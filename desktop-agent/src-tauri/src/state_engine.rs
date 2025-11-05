// 파일 위치: src-tauri/src/state_engine.rs

use std::time::{SystemTime, UNIX_EPOCH};
use crate::commands::{ActiveWindowInfo, InputStats}; // commands.rs에서 정의한 데이터 모델

// --- 1. 상수 정의 ---

/// '방해 앱'으로 간주되는 키워드 목록
/// StateEngine은 이 목록을 기반으로 '이탈 점수'를 계산
const DISTRACTION_KEYWORDS: &[&str] = &[
    "youtube", 
    "netflix",
    "facebook",
    "discord",     
    "steam.exe",   
    "slack",       
];

/// 점수 임계값: 이탈 점수가 이 값에 도달하면 '알림'을 트리거
const THRESHOLD_NOTIFICATION: u16 = 10;
/// 점수 임계값: 이탈 점수가 이 값에 도달하면 '강한 개입(오버레이)'을 트리거
const THRESHOLD_OVERLAY: u16 = 20;

/// 점수 계산 규칙: 방해 키워드 발견 시 추가할 점수
const SCORE_DISTRACTION_APP: u16 = 5;
/// 점수 계산 규칙: 3분 (180초) 이상 입력이 없을 시 추가할 점수
const SCORE_INACTIVITY_MILD: u16 = 3;
/// 점수 계산 규칙: 10분 (600초) 이상 입력이 없을 시 추가할 점수
const SCORE_INACTIVITY_SEVERE: u16 = 10;

/// 비활성(Inactivity) 판단 기준 시간 (초 단위)
const INACTIVITY_THRESHOLD_MILD_S: u16 = 180; // 3분
const INACTIVITY_THRESHOLD_SEVERE_S: u16 = 600; // 10분


// --- 2. StateEngine 상태 및 로직 ---

/// State Engine이 반환할 개입(Intervention) 명령의 종류
#[derive(Debug, PartialEq)]
pub enum InterventionTrigger {
    DoNothing,          // 아무것도 하지 않음
    TriggerNotification, // 가벼운 알림 (예: OS 알림)
    TriggerOverlay,     // 강한 개입 (예: 화면 오버레이)
}

/// State Engine의 현재 상태를 관리하는 구조체
/// 이 구조체는 세션이 시작될 때 생성
#[derive(Debug)]
pub struct StateEngine {
    /// 현재 누적된 '이탈 점수'
    deviation_score: u16,
    /// 마지막으로 '이탈 점수'가 감소된 시점의 타임스탬프
    last_decay_timestamp_s: u64,
}

impl StateEngine {
    /// 새로운 세션을 위한 StateEngine을 생성
    pub fn new() -> Self {
        StateEngine {
            deviation_score: 0,
            last_decay_timestamp_s: current_timestamp_s(),
        }
    }

    /// 현재 점수를 반환 (UI 표시 등에 사용)
    pub fn get_current_score(&self) -> u16 {
        self.deviation_score
    }

    /// Activity Monitor로부터 받은 최신 데이터를 처리하고,
    /// '이탈 점수'를 갱신한 뒤, 필요한 개입 명령을 반환
    ///
    /// 이 함수는 주기적으로 (예: 매 5초) 또는 이벤트 발생 시 호출
    ///
    /// # Arguments
    /// * `window_info` - 현재 활성 창 정보
    /// * `input_stats` - 현재까지의 누적 입력 통계
    ///
    /// # Returns
    /// * `InterventionTrigger` - 계산 결과에 따른 개입 명령
    pub fn process_activity(
        &mut self,
        window_info: &ActiveWindowInfo,
        input_stats: &InputStats,
    ) -> InterventionTrigger {
        let now_s = current_timestamp_s();
        let mut score_to_add: u16 = 0;

        // --- 규칙 1: 방해 키워드 검사 ---
        // 창 제목과 앱 이름을 모두 소문자로 변환하여 검사
        let title_lower = window_info.title.to_lowercase();
        let app_name_lower = window_info.app_name.to_lowercase();

        let is_distraction = DISTRACTION_KEYWORDS.iter().any(|&keyword| {
            title_lower.contains(keyword) || app_name_lower.contains(keyword)
        });

        if is_distraction {
            score_to_add += SCORE_DISTRACTION_APP;
        }

        // --- 규칙 2: 비활성(Inactivity) 검사 ---
        let last_input_s = input_stats.last_input_timestamp_ms / 1000;
        let inactivity_duration_s = now_s.saturating_sub(last_input_s);

        if inactivity_duration_s >= INACTIVITY_THRESHOLD_SEVERE_S.into() {
            score_to_add += SCORE_INACTIVITY_SEVERE;
        } else if inactivity_duration_s >= INACTIVITY_THRESHOLD_MILD_S.into() {
            score_to_add += SCORE_INACTIVITY_MILD;
        }

        // --- 규칙 3: 점수 감소 (Decay) 로직 ---
        // 만약 방해 활동이 감지되지 않았고(score_to_add == 0),
        // 마지막 입력이 최근(예: 1분 이내)에 있었다면, 점수를 서서히 감소
        let is_productive = !is_distraction && (inactivity_duration_s < 60);

        if is_productive {
            // 10초마다 1점씩 감소 (예시)
            let time_since_last_decay = now_s.saturating_sub(self.last_decay_timestamp_s);
            if time_since_last_decay >= 10 {
                self.deviation_score = self.deviation_score.saturating_sub(1); // 1점 감소
                self.last_decay_timestamp_s = now_s;
            }
        }

        // --- 최종 점수 계산 및 개입 결정 ---
        if score_to_add > 0 {
            // 딴짓을 하면 점수가 즉시 오르지만, 최대치를 제한 (예: 100)
            self.deviation_score = (self.deviation_score + score_to_add).min(100);
        }

        // 임계값을 기준으로 개입 명령 결정
        if self.deviation_score >= THRESHOLD_OVERLAY {
            InterventionTrigger::TriggerOverlay
        } else if self.deviation_score >= THRESHOLD_NOTIFICATION {
            InterventionTrigger::TriggerNotification
        } else {
            InterventionTrigger::DoNothing
        }
    }
}

// --- 3. 유틸리티 함수 ---

/// 현재 시간을 초 단위 Unix 타임스탬프로 반환
fn current_timestamp_s() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}


// --- 4. 유닛 테스트 ---
// 이 모듈이 독립적으로 잘 작동하는지 테스트
#[cfg(test)]
mod tests {
    use super::*;

    // 테스트용 목업(Mock) 데이터 생성
    fn mock_window_info(title: &str, app_name: &str) -> ActiveWindowInfo {
        ActiveWindowInfo {
            timestamp_ms: 0, // 테스트에서는 중요하지 않음
            title: title.to_string(),
            process_path: "".to_string(),
            app_name: app_name.to_string(),
            window_id: "".to_string(),
            process_id: 0,
            x: 0.0, y: 0.0, width: 0.0, height: 0.0,
        }
    }

    fn mock_input_stats(last_input_ago_s: u64) -> InputStats {
        let now_ms = current_timestamp_s() * 1000;
        InputStats {
            total_input_events: 1, // 테스트에서는 중요하지 않음
            last_input_timestamp_ms: now_ms.saturating_sub(last_input_ago_s * 1000),
            start_monitoring_timestamp_ms: 0,
        }
    }

    #[test]
    fn test_distraction_score_increases() {
        let mut engine = StateEngine::new();
        let window_info = mock_window_info("Working on Document", "word.exe");
        let input_stats = mock_input_stats(10); // 10초 전 입력

        // 처음에는 점수가 0
        assert_eq!(engine.get_current_score(), 0);

        // 방해 앱 실행
        let distraction_window = mock_window_info("YouTube - Google Chrome", "chrome.exe");
        let trigger = engine.process_activity(&distraction_window, &input_stats);

        // 점수가 오르고, 알림 트리거 확인 (규칙에 따라 다름)
        assert!(engine.get_current_score() > 0);
        assert_eq!(engine.get_current_score(), SCORE_DISTRACTION_APP);
        // (점수가 THRESHOLD_NOTIFICATION보다 낮다는 가정 하에)
        // assert_eq!(trigger, InterventionTrigger::DoNothing); // 또는 TriggerNotification
    }

    #[test]
    fn test_inactivity_score_increases() {
        let mut engine = StateEngine::new();
        let window_info = mock_window_info("Working on Document", "word.exe");
        
        // 4분 (240초) 동안 입력 없음
        let input_stats_mild = mock_input_stats(240);
        let trigger_mild = engine.process_activity(&window_info, &input_stats_mild);
        
        assert_eq!(engine.get_current_score(), SCORE_INACTIVITY_MILD);
        
        // 11분 (660초) 동안 입력 없음
        let input_stats_severe = mock_input_stats(660);
        let trigger_severe = engine.process_activity(&window_info, &input_stats_severe);

        // 점수가 누적됨 (기존 점수 + 새로운 점수)
        assert_eq!(engine.get_current_score(), SCORE_INACTIVITY_MILD + SCORE_INACTIVITY_SEVERE);
    }

    #[test]
    fn test_score_decays_when_productive() {
        let mut engine = StateEngine::new();

        // 1. 점수를 먼저 올림 (방해 앱)
        let distraction_window = mock_window_info("YouTube - Google Chrome", "chrome.exe");
        let input_stats = mock_input_stats(10);
        engine.process_activity(&distraction_window, &input_stats);
        let initial_score = engine.get_current_score();
        assert!(initial_score > 0);

        // 2. 시간을 10초 이상 흐르게 함 (시뮬레이션)
        std::thread::sleep(std::time::Duration::from_secs(11));

        // 3. 생산적인 활동으로 전환
        let productive_window = mock_window_info("Productive Task", "code.exe");
        let productive_stats = mock_input_stats(1); // 1초 전 입력 (활발히 활동 중)
        engine.process_activity(&productive_window, &productive_stats);
        
        // 점수가 감소해야 함
        assert!(engine.get_current_score() < initial_score);
        assert_eq!(engine.get_current_score(), initial_score.saturating_sub(1));
    }
}