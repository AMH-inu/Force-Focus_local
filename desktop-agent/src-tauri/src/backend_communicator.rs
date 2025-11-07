// 파일 위치: src-tauri/src/backend_communicator.rs

use reqwest::Client;
use serde::{Deserialize, Serialize};
use tauri::{command, State};

// lib.rs에서 정의한 전역 상태 타입들
use crate::{
    ActiveSessionInfo,
    SessionStateArcMutex,
    StorageManagerArcMutex,
};

// StorageManager의 메서드를 호출하기 위해 모듈 import
use crate::storage_manager; 
use std::time::{SystemTime, UNIX_EPOCH}; // 세션 시작 시간 생성용
use uuid::Uuid; // 로컬에서 임시 세션 ID 생성용

// --- 1. 상수 정의 ---

// MSW 목업이 아닌, 실제 FastAPI 백엔드 서버의 주소
// (로컬 개발 환경을 가정)
const API_BASE_URL: &str = "http://127.0.0.1:8000/api/v1"; 

// '가상 사용자' 전략을 위한 하드코딩된 인증 토큰
// msw/handlers.ts에 정의된 'mock-jwt-token-123'
const MOCK_AUTH_TOKEN: &str = "mock-jwt-token-123";

// --- 2. API 요청/응답을 위한 구조체 ---

/// `POST /feedback` API의 Request Body 스키마
/// (API 명세서: event_id, feedback_type)
#[derive(Debug, Serialize)]
struct FeedbackRequest<'a> {
    event_id: &'a str, // 이벤트 ID (임시)
    feedback_type: &'a str, // "is_work" 또는 "distraction_ignored"
}

// (API 응답을 위한 Deserialize 구조체도 필요시 추가)
// #[derive(Debug, Deserialize)]
// struct FeedbackResponse { ... }

// --- 세션 API 요청/응답 모델 ---
#[derive(Debug, Serialize)]
struct SessionStartRequest<'a> {
    task_id: Option<&'a str>,
    goal_duration: u32,
}
#[derive(Debug, Deserialize)]
struct SessionStartResponse {
    session_id: String,
    start_time: String, // ISO 8601
}
#[derive(Debug, Serialize)]
struct SessionEndRequest {
    user_evaluation_score: u8,
}

// --- 3. BackendCommunicator 상태 정의 ---

/// reqwest::Client를 전역 상태로 관리하기 위한 구조체
/// Client는 내부에 Arc를 가지고 있어 복제(clone)에 저렴
pub struct BackendCommunicator {
    client: Client,
}

impl BackendCommunicator {
    /// 앱 시작 시 호출될 생성자
    pub fn new() -> Self {
        Self {
            client: Client::new(),
        }
    }
}

// --- 4. 이 모듈에 속한 Tauri 커맨드 정의 ---

/// '개입'에 대한 사용자 피드백을 서버로 전송하는 비동기(async) 커맨드
///
/// # Arguments
/// * `feedback_type` - 프론트엔드에서 받은 피드백 (예: "is_work")
/// * `comm_state` - Tauri가 주입하는 BackendCommunicator 전역 상태
#[command]
pub async fn submit_feedback(
    feedback_type: String, 
    comm_state: State<'_, BackendCommunicator>
) -> Result<(), String> {
    
    // (임시) 현재는 event_id가 없으므로 임의의 값을 사용
    let event_id = "temp_event_001"; 

    let request_body = FeedbackRequest {
        event_id,
        feedback_type: &feedback_type,
    };

    let url = format!("{}/feedback", API_BASE_URL);

    println!( // 디버깅 로그
        "Submitting feedback to {}: type={}",
        url, request_body.feedback_type
    );

    match comm_state.client
        .post(&url)
        .bearer_auth(MOCK_AUTH_TOKEN) // '가상 사용자' 토큰 사용
        .json(&request_body)
        .send()
        .await
    {
        Ok(response) => {
            if response.status().is_success() {
                println!("Feedback submitted successfully.");
                Ok(())
            } else {
                let error_msg = format!("API Error: {}", response.status());
                eprintln!("{}", error_msg);
                Err(error_msg)
            }
        }
        Err(e) => {
            let error_msg = format!("Reqwest Error: {}", e);
            eprintln!("{}", error_msg);
            Err(error_msg)
        }
    }
}


// --- 세션 시작 커맨드 ---
#[command]
pub async fn start_session(
    task_id: Option<String>,
    goal_duration: u32,
    // comm_state는 백그라운드 스레드로 'move'되어야 하므로 Arc로 감싸진 State
    comm_state: State<'_, Arc<BackendCommunicator>>,
    session_state_mutex: State<'_, SessionStateArcMutex>,
    storage_manager_mutex: State<'_, StorageManagerArcMutex>,
) -> Result<ActiveSessionInfo, String> { // React에 ActiveSessionInfo 반환


    // 1. '읽기' 락: .await 전에 세션이 활성 상태인지 '확인'
    { // 락 범위를 제한하기 위해 새 스코프 생성
        let session_state = session_state_mutex.lock().map_err(|e| format!("State lock error: {}", e))?;
        if session_state.is_some() {
            return Err("Session already active.".to_string());
        }
        // 'session_state' MutexGuard는 여기서(스코프 끝) 자동으로 drop (락 해제)
    }
    // [!] storage_manager 락도 .await 이후로 이동

    let task_id_ref = task_id.as_deref();
    let request_body = SessionStartRequest {
        task_id: task_id_ref,
        goal_duration,
    };
    let url = format!("{}/sessions/start", API_BASE_URL);

    // 2. await (네트워크 호출)
    // .await이 실행되는 이 시점에는 *어떤 Mutex 락도* 걸려있지 않음
    let result_info = match comm_state.client.post(&url).bearer_auth(MOCK_AUTH_TOKEN).json(&request_body).send().await {
        Ok(response) if response.status().is_success() => {
            // [케이스 A: 서버 통신 성공]
            let response_body: SessionStartResponse = response.json().await.map_err(|e| e.to_string())?;
            let start_time_s = chrono::DateTime::parse_from_rfc3339(&response_body.start_time)
                .map_err(|e| e.to_string())?.timestamp() as u64;

            let info = ActiveSessionInfo {
                session_id: response_body.session_id,
                task_id,
                start_time_s,
            };
            println!("Session started (Online). ID: {}", info.session_id);
            Ok(info)
        }
        _ => {
            // [케이스 B: 서버 통신 실패 (오프라인 강건성)]
            let session_id = format!("local-{}", Uuid::new_v4());
            let start_time_s = SystemTime::now().duration_since(UNIX_EPOCH)
                .map_err(|e| e.to_string())?.as_secs();

            let info = ActiveSessionInfo {
                session_id: session_id.clone(),
                task_id,
                start_time_s,
            };
            eprintln!("Session started (Offline). ID: {}", info.session_id);
            // E0282: 컴파일러가 이 Ok의 Err 타입을 추론할 수 없으므로,
            // '터보피시' 구문을 사용해 Err 타입이 String임을 명시
            Ok::<ActiveSessionInfo, String>(info)
        }
    }?; // [!] .await의 결과를 먼저 확정 (info)

    // 3. '쓰기' 락: .await가 끝난 *후에* LSN과 전역 상태를 갱신
    let mut session_state = session_state_mutex.lock().map_err(|e| format!("State lock error: {}", e))?;
    let storage_manager = storage_manager_mutex.lock().map_err(|e| format!("Storage lock error: {}", e))?;

    storage_manager.save_active_session(&result_info)?;
    *session_state = Some(result_info.clone());
    
    Ok(result_info) // React가 타이머를 시작할 수 있도록 정보 반환
}

// --- 세션 종료 커맨드 ---
#[command]
pub async fn end_session(
    user_evaluation_score: u8,
    comm_state: State<'_, BackendCommunicator>,
    session_state_mutex: State<'_, SessionStateArcMutex>,
    storage_manager_mutex: State<'_, StorageManagerArcMutex>,
) -> Result<(), String> {

     // 1. '읽기' 락: .await 전에 세션 ID를 읽기
    let active_session_id = { // 락 범위를 제한하기 위해 새 스코프 생성
        let session_state = session_state_mutex.lock().map_err(|e| e.to_string())?;
        session_state.as_ref()
            .map(|s| s.session_id.clone())
            .ok_or_else(|| "No active session to end.".to_string())?
        // 'session_state' MutexGuard는 여기서(스코프 끝) 자동으로 drop (락 해제)
    };

    let url = format!("{}/sessions/{}", API_BASE_URL, active_session_id);
    let request_body = SessionEndRequest { user_evaluation_score };

    // 2. .await (네트워크 호출)
    // .await이 실행되는 이 시점에는 *어떤 Mutex 락도* 걸려있지 않음
    let _ = comm_state.client.put(&url).bearer_auth(MOCK_AUTH_TOKEN).json(&request_body).send().await
        .map_err(|e| eprintln!("Warning: Failed to sync session end to server: {}", e));

    // 3. '쓰기' 락: .await가 끝난 *후에* LSN과 전역 상태를 갱신
    let mut session_state = session_state_mutex.lock().map_err(|e| e.to_string())?;
    let storage_manager = storage_manager_mutex.lock().map_err(|e| e.to_string())?;

    // 로컬 상태 정리
    storage_manager.delete_active_session()?;
    *session_state = None; // 전역 상태 초기화

    println!("Session ID {} successfully ended (score: {}).", active_session_id, user_evaluation_score);
    Ok(())
}