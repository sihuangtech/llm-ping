// Tauri 负责桌面壳、托盘和生命周期；核心检测逻辑仍由 TypeScript server/core 提供。
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let _tray = tauri::tray::TrayIconBuilder::new()
                .tooltip("llm-ping is running")
                .build(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("failed to run llm-ping desktop");
}
