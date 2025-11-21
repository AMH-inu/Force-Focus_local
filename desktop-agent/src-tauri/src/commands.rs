// 파일 위치: Force-Focus/desktop-agent/src-tauri/src/commands.rs

/*
새로운 데이터를 추가하는 방법
1. InputStats 구조체에 새 필드 추가
2. 수집 로직 추가 (input_monitor.rs)
3. to_activity_vector_json 함수에 키/값 을 추가

*/


use tauri::{command, State};
use serde::{Serialize, Deserialize};
use std::time::{SystemTime, UNIX_EPOCH}; // 타임스탬프 생성을 위해 필요
use active_win_pos_rs::get_active_window; // 활성 창 정보를 가져오는 함수
use std::path::PathBuf; // active-win-pos-rs::ActiveWindow 구조체 필드에 PathBuf가 포함

use sysinfo::{System};
use std::sync::{Mutex, Arc};

use rdev::{listen, Event, EventType};
use std::thread;


// [추가] Windows API 사용을 위한 모듈 import (Windows 환경에서만 컴파일)
#[cfg(target_os = "windows")]
use winapi::shared::minwindef::{BOOL, DWORD, TRUE, FALSE, LPARAM, MAX_PATH, HRGN}; 
#[cfg(target_os = "windows")]
use winapi::shared::windef::{HWND, RECT};
#[cfg(target_os = "windows")]
use winapi::um::winuser::{
    EnumWindows, GetWindowTextW, GetWindowTextLengthW, GetWindowThreadProcessId, 
    IsIconic, IsWindowVisible, GetWindow, GW_OWNER, 
    GetTopWindow, GW_HWNDNEXT, GetForegroundWindow, GetWindowRect // [추가] Z-Order 및 활성 창 API
}; 
#[cfg(target_os = "windows")]
use winapi::um::processthreadsapi::{OpenProcess};
#[cfg(target_os = "windows")]
use winapi::um::winbase::{QueryFullProcessImageNameW};
#[cfg(target_os = "windows")]
use winapi::um::handleapi::{CloseHandle};
#[cfg(target_os = "windows")]
use winapi::um::winnt::{HANDLE, PROCESS_QUERY_LIMITED_INFORMATION};
#[cfg(target_os = "windows")]
use std::ffi::{OsString};
#[cfg(target_os = "windows")]
use std::os::windows::ffi::OsStringExt;
#[cfg(target_os = "windows")]
use winapi::um::wingdi::{
    CreateRectRgn, CreateRectRgnIndirect, CombineRgn, GetRgnBox, DeleteObject, 
    RGN_OR, RGN_DIFF, NULLREGION, SIMPLEREGION, COMPLEXREGION
};




// --- 공유 상태 관리 ---
// Mutex<System>만 포함하며, System 인스턴스를 공유 상태로 관리합니다.
pub struct SysinfoState(pub Mutex<System>);

// 사용자 입력 통계 추적을 위한 공유 상태
// 앱 시작 시 한 번 초기화되어 계속 사용되므로 Arc로 공유됩니다.
#[derive(Debug, Default, Clone, Serialize, Deserialize)] 
pub struct InputStats {
    // 키/클릭/휠 이벤트만 카운트
    pub meaningful_input_events: u64,
    // 키/클릭/휠의 마지막 타임스탬프
    pub last_meaningful_input_timestamp_ms: u64,
    
    // 마우스 이동 전용 타임스탬프
    pub last_mouse_move_timestamp_ms: u64,

    // 모니터링 시작 시점
    pub start_monitoring_timestamp_ms: u64,
}

// FastAPI 모델 activity_vector
impl InputStats {
    /// 자신을 FastAPI가 요구하는 Dict[str, float]의 JSON 문자열로 변환
    pub fn to_activity_vector_json(&self) -> String {
        // serde_json::json! 매크로를 사용하여 Dict 생성
        let vector = serde_json::json!({
            "meaningful_input_events": self.meaningful_input_events,
            "last_meaningful_input_timestamp_ms": self.last_meaningful_input_timestamp_ms,
            "last_mouse_move_timestamp_ms": self.last_mouse_move_timestamp_ms,
            // [추후] "clipboard_events": 0.0 (여기에만 추가하면 됨)
        });
        vector.to_string() // JSON 문자열로 반환
    }
}

pub type InputStatsArcMutex = Arc<Mutex<InputStats>>;


// --- 1. 활성 창 정보 관련 데이터 모델 및 명령어 ---

// 활성 창의 상세 정보를 담을 Rust 구조체
// 이 구조체는 웹 프론트엔드로 전송될 것이므로 Serialize/Deserialize 트레이트를 파생
// active_win_pos_rs::ActiveWindow 구조체와 유사하게 정의하되, 필요한 추가 필드를 포함
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ActiveWindowInfo {
    pub timestamp_ms: u64, // 정보 수집 시점의 타임스탬프 (밀리초)
    pub title: String,     // 창의 제목 (예: "Google Chrome - Wikipedia")
    pub process_path: String, // 실행 파일의 전체 경로 (예: "C:\Program Files\Google\Chrome\Application\chrome.exe")
    pub app_name: String,  // 애플리케이션 이름 (예: "chrome", "firefox")
    pub window_id: String, // 운영체제별 고유 창 ID
    pub process_id: u64,   // 프로세스 ID
    pub x: f64,            // 창의 X 좌표
    pub y: f64,            // 창의 Y 좌표
    pub width: f64,        // 창의 너비
    pub height: f64,       // 창의 높이
}


// ActiveWindowInfo를 생성하는 내부 헬퍼 함수
pub fn _get_active_window_info_internal() -> Result<ActiveWindowInfo, String> {
    // 현재 시간을 밀리초 단위의 Unix 타임스탬프로 가져옴
    let timestamp_ms = SystemTime::now().duration_since(UNIX_EPOCH)
                                    .unwrap_or_else(|_| std::time::Duration::from_secs(0)) // 에러 처리 추가
                                    .as_millis() as u64;

    // 현재 활성 창 정보
    match get_active_window() {
        Ok(active_window) => {
            Ok(ActiveWindowInfo {
                timestamp_ms,
                title: active_window.title,
                process_path: active_window.process_path.to_string_lossy().into_owned(), // PathBuf를 String으로 변환
                app_name: active_window.app_name,
                window_id: active_window.window_id,
                process_id: active_window.process_id,
                x: active_window.position.x,
                y: active_window.position.y,
                width: active_window.position.width,
                height: active_window.position.height,
            })
        },
        // 활성 창을 가져오는 데 실패했을 경우 (에러나 활성 창 없음)
        Err(e) => Err(format!("Failed to get active window info: {:?}", e)),
    }
}

// 현재 활성 창의 정보를 가져오는 Tauri Command
#[tauri::command]
pub fn get_current_active_window_info() -> Result<ActiveWindowInfo, String> {
    _get_active_window_info_internal()
}



// --- 2. 시스템 상태 관련 데이터 모델 및 명령어 ---

// 모든 프로세스에 대한 요약 정보를 담을 Rust 구조체
// 이 구조체는 웹 프론트엔드로 전송될 것이므로 Serialize/Deserialize 트레이트를 파생합니다.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProcessSummary {
    pub name: String,            // 프로세스의 이름 (예: "chrome", "notepad.exe")
    pub start_time_unix_s: u64,  // 프로세스 시작 시점의 Unix 타임스탬프 (초 단위)

}


// 시스템의 모든 실행 중인 프로세스 요약 정보를 가져오는 Tauri Command
#[command]
pub fn get_all_processes_summary(sys_state: State<'_, SysinfoState>) -> Result<Vec<ProcessSummary>, String> {
    // SysinfoState가 Mutex<System>만 가지므로 sys_state.0.lock()으로 접근합니다.
    let mut sys_guard = sys_state.0.lock().unwrap();

    // 시스템 정보 새로 고침
    // sysinfo::System::refresh_all()은 프로세스 목록을 포함한 대부분의 시스템 정보를 갱신합니다.
    sys_guard.refresh_all();

    let mut processes_summary = Vec::new();
    // sys_guard.processes()는 (Pid, &Process) 형태의 Iterator를 반환합니다.
    for (_pid, process) in sys_guard.processes() {
        if (process.start_time() > 0) {
            processes_summary.push(ProcessSummary {
                name: process.name().to_string_lossy().into_owned(), // &OsStr을 String으로 안전하게 변환
                start_time_unix_s: process.start_time(),
            });
        }
            
    }
    Ok(processes_summary)
}

// --- 3. (향후 추가될) 스크린샷 관련 데이터 모델 및 명령어 ---
// (현재 비어 있음)




// --- 4. 사용자 입력 및 유휴 시간 관련 데이터 모델 및 명령어 ---

// 현재까지의 사용자 입력 빈도 통계를 반환하는 Command
#[command]
pub fn get_input_frequency_stats(input_stats_arc_mutex: State<'_, InputStatsArcMutex>) -> Result<InputStats, String> {
    // input_stats_arc_mutex는 직접 Arc<Mutex<InputStats>>의 참조 가짐.
    // .lock().unwrap()을 호출하여 MutexGuard를 얻고, 내부 데이터를 클론
    let stats = input_stats_arc_mutex.lock().unwrap();
    Ok((*stats).clone())
}



// --- 5. 시각 센서 (Visible Windows) ---
// 화면에 보이는 창을 수집

// --- [설정] 시각적 임계값 ---
// 이 크기보다 작게 보이는 창(자투리)은 '안 보임' 처리합니다.
const MIN_VISIBLE_WIDTH: i32 = 80;
const MIN_VISIBLE_HEIGHT: i32 = 80;

// [1] Debug 구현을 위한 Rust용 Rect 구조체
#[derive(Debug, Clone, Serialize)]
pub struct WinRect {
    pub left: i32,
    pub top: i32,
    pub right: i32,
    pub bottom: i32,
}

// [2] WindowInfo 구조체 정의
#[derive(Debug, Clone, Serialize)]
pub struct WindowInfo {
    pub title: String,
    pub is_visible_on_screen: bool,
    pub rect: WinRect, 
}

// --- OS 유틸리티 경로 목록 (필터링용) ---
#[cfg(target_os = "windows")]
const WINDOWS_SYSTEM_PATHS: &[&str] = &[
    "C:\\WINDOWS\\SYSTEM32", 
    "C:\\WINDOWS\\SYSTEMAPPS", 
    "C:\\PROGRAM FILES\\WINDOWSAPPS", 
    "C:\\WINDOWS\\EXPLORER.EXE",
];

#[cfg(target_os = "windows")]
const IGNORED_TITLES: &[&str] = &[
    "Shell Handwriting Canvas",
    "Microsoft Text Input Application",
    "Program Manager",
    "Settings", // 윈도우 설정 같은 백그라운드 앱
];

// --- PID로 프로세스 경로를 얻는 헬퍼 함수 ---
#[cfg(target_os = "windows")]
fn get_process_path_from_pid(pid: DWORD) -> Option<String> {
    if pid == 0 { return None; }

    unsafe {
        let access_rights: DWORD = PROCESS_QUERY_LIMITED_INFORMATION;
        let handle = OpenProcess(access_rights, FALSE, pid);
        
        if handle.is_null() {
            return None;
        }

        let mut path_buf: Vec<u16> = vec![0; MAX_PATH as usize + 1];
        let mut size = MAX_PATH as DWORD;
        
        let success = QueryFullProcessImageNameW(handle, 0, path_buf.as_mut_ptr(), &mut size);
        
        CloseHandle(handle);

        if success > 0 {
            let slice = &path_buf[..size as usize];
            let path_os_string = OsString::from_wide(slice);
            path_os_string.into_string().ok()
        } else {
            None
        }
    }
}
// --- EnumWindows를 위한 상태 구조체 ---
#[cfg(target_os = "windows")]
struct EnumContext {
    windows: Vec<WindowInfo>,
    foreground_hwnd: HWND,
    // 지금까지 화면을 덮어버린 영역들의 합집합 (누적 가림막)
    covered_rgn: HRGN, 
}

// --- 콜백 함수  ---
#[cfg(target_os = "windows")]
unsafe extern "system" fn enum_window_callback(hwnd: HWND, lparam: LPARAM) -> BOOL {
    let context = &mut *(lparam as *mut EnumContext);

    if IsIconic(hwnd) != 0 { return TRUE; }

    if IsWindowVisible(hwnd) != 0 && GetWindow(hwnd, GW_OWNER).is_null() {
        
        // 1. 먼저 창의 좌표를 구함
        let mut rect = RECT { left: 0, top: 0, right: 0, bottom: 0 };
        GetWindowRect(hwnd, &mut rect);
        let width = rect.right - rect.left;
        let height = rect.bottom - rect.top;

        // 너무 작은 창은 시각적 노이즈로 간주하고 무시
        if width < 100 || height < 100 {
            return TRUE;
        }

        let length = GetWindowTextLengthW(hwnd);
        if length > 0 {
            let mut buffer: Vec<u16> = vec![0; (length + 1) as usize];
            let copied_len = GetWindowTextW(hwnd, buffer.as_mut_ptr(), buffer.len() as i32);
            
            if copied_len > 0 {
                if let Ok(title) = OsString::from_wide(&buffer[..copied_len as usize]).into_string() {
                    let trimmed_title = title.trim();

                    // 블랙리스트 필터
                    if IGNORED_TITLES.contains(&trimmed_title) {
                        return TRUE; 
                    }

                    let mut pid: DWORD = 0;
                    GetWindowThreadProcessId(hwnd, &mut pid);
                    let is_system = if let Some(path) = get_process_path_from_pid(pid) {
                        let p = path.to_lowercase();
                        WINDOWS_SYSTEM_PATHS.iter().any(|sys| p.starts_with(&sys.to_lowercase()))
                    } else { false };

                    if !is_system {
                        // ---------------------------------------------------------
                        // [핵심 로직: Region Occlusion Calculation]
                        // ---------------------------------------------------------
                        
                        // 1. 현재 창의 영역 생성
                        let current_win_rgn = CreateRectRgnIndirect(&rect);
                        
                        // 2. 실제로 보이는 영역 계산 (현재 창 - 이미 가려진 영역)
                        let visible_part_rgn = CreateRectRgn(0, 0, 0, 0);
                        let region_type = CombineRgn(visible_part_rgn, current_win_rgn, context.covered_rgn, RGN_DIFF);

                        // 3. 보이는 영역이 존재하는지 확인
                       let mut is_visually_visible = false;

                        if region_type != NULLREGION {
                            // [추가된 로직] 남은 영역의 Bounding Box 크기 측정
                            let mut box_rect = RECT { left: 0, top: 0, right: 0, bottom: 0 };
                            GetRgnBox(visible_part_rgn, &mut box_rect);

                            let visible_w = box_rect.right - box_rect.left;
                            let visible_h = box_rect.bottom - box_rect.top;

                            // C. 실제로 보이는 부분이 임계값 이상이어야 함
                            if visible_w >= MIN_VISIBLE_WIDTH && visible_h >= MIN_VISIBLE_HEIGHT {
                                is_visually_visible = true;
                            }
                        }

                        // (옵션) 보이는 면적이 너무 작으면(예: 픽셀 몇 개) 안 보이는 것으로 칠 수도 있음
                        // 정확도를 위해 GetRgnBox로 visible_part_rgn의 크기를 체크할 수도 있으나, 
                        // 여기서는 '조금이라도 보이면 보임'으로 처리.

                        if is_visually_visible {
                            context.windows.push(WindowInfo {
                                title: trimmed_title.to_string(),
                                is_visible_on_screen: true,
                                rect: WinRect {
                                    left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom,
                                },
                            });

                            // 4. 이 창이 보이는 만큼, 다음 창들을 가리게 됨. 누적 가림막에 추가(Union).
                            CombineRgn(context.covered_rgn, context.covered_rgn, current_win_rgn, RGN_OR);
                        } else {
                            // 완전히 가려진 창은 리스트에 넣되 false로 표시하거나, 아예 뺄 수도 있음.
                            // 디버깅을 위해 일단 리스트에는 넣고 false 처리
                             context.windows.push(WindowInfo {
                                title: trimmed_title.to_string(),
                                is_visible_on_screen: false, // 가려짐!
                                rect: WinRect {
                                    left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom,
                                },
                            });
                        }

                        // 5. GDI 객체 정리 (메모리 누수 방지)
                        DeleteObject(current_win_rgn as *mut _);
                        DeleteObject(visible_part_rgn as *mut _);
                    }
                }
            }
        }
    }
    TRUE
}

/// [내부 함수] 현재 화면에 보이는 모든 창의 제목을 수집합니다.
/// (Windows 전용 구현)
pub fn _get_all_visible_windows_internal() -> Vec<WindowInfo> {
    #[cfg(target_os = "windows")]
    {
        unsafe {
            let foreground_hwnd = GetForegroundWindow();
            // [초기화] 빈 영역(0,0,0,0) 생성
            let covered_rgn = CreateRectRgn(0, 0, 0, 0);

            // 콜백에 전달할 상태 객체 생성
            let mut context = EnumContext {
                windows: Vec::new(),
                foreground_hwnd,
                covered_rgn,
            };

            // EnumWindows 호출 (안정적인 순회)
            let lparam = &mut context as *mut _ as LPARAM;
            if EnumWindows(Some(enum_window_callback), lparam) == 0 {
                // 에러 처리 필요 시 추가 (현재는 빈 벡터 반환 가능성 있음)
                // eprintln!("EnumWindows failed"); 
            }

            // [정리] 다 쓰고 난 누적 영역 삭제
            DeleteObject(context.covered_rgn as *mut _);

            context.windows
        }
    }

    // (비-Windows 환경을 위한 더미 구현)
    #[cfg(not(target_os = "windows"))]
    {
        vec![("Unsupported OS".to_string(), false)]
    }
}


/// [Tauri 커맨드] 프론트엔드나 app_core에서 호출 가능한 래퍼
#[command]
pub fn get_visible_windows() -> Result<Vec<WindowInfo>, String> {
    let windows = _get_all_visible_windows_internal();
    Ok(windows)
}