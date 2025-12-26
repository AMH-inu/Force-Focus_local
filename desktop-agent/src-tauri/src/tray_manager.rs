use tauri::{
    menu::{Menu, MenuItem},
    tray::{TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, Runtime,
};

/// [추가] Task 5.1.2: 트레이 메뉴 생성 및 이벤트 핸들러 설정
pub fn setup_tray_menu<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
    // 1. 메뉴 아이템 생성
    let quit_i = MenuItem::with_id(app, "quit", "종료 (Quit)", true, None::<&str>)?;
    let show_hide_i =
        MenuItem::with_id(app, "toggle", "열기/숨기기 (Show/Hide)", true, None::<&str>)?;

    // 2. 메뉴 구성
    let menu = Menu::with_items(app, &[&show_hide_i, &quit_i])?;

    // 3. 트레이 아이콘 생성
    let _tray = TrayIconBuilder::with_id("tray")
        .icon(app.default_window_icon().unwrap().clone()) // 앱 기본 아이콘 사용
        .menu(&menu)
        .on_menu_event(move |app, event| {
            match event.id.as_ref() {
                "quit" => {
                    println!("Tray: Quit clicked");
                    app.exit(0); // 앱 완전 종료
                }
                "toggle" => {
                    println!("Tray: Toggle clicked");
                    if let Some(window) = app.get_webview_window("main") {
                        if window.is_visible().unwrap_or(false) {
                            window.hide().unwrap();
                        } else {
                            window.show().unwrap();
                            window.set_focus().unwrap();
                        }
                    }
                }
                _ => {}
            }
        })
        .on_tray_icon_event(|tray, event| {
            // (선택) 트레이 아이콘 클릭 시 동작 (예: 메인 창 열기)
            if let TrayIconEvent::Click { .. } = event {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        })
        .build(app)?;

    Ok(())
}
