// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod commands;

use tauri::{Manager, Builder, State};
use std::sync::Mutex;
use sysinfo::System;

// 애플리케이션 전역에서 공유할 시스템 정보 상태 정의
pub struct SysinfoState(pub Mutex<System>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())

        .manage(commands::SysinfoState( // commands::SysinfoState로 경로 명시
            Mutex::new(System::new_all()),
        ))


        .invoke_handler(tauri::generate_handler![
            greet,
            commands::get_current_active_window_info,
            commands::get_all_processes_summary,
            ])

        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}