use tauri::Listener;
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;
use std::sync::{Arc, Mutex};

pub struct SidecarHandle(Mutex<Option<tauri_plugin_shell::process::CommandChild>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let sidecar_handle = Arc::new(SidecarHandle(Mutex::new(None)));
  tauri::Builder::default()
    .manage(sidecar_handle.clone())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_log::Builder::default().level(log::LevelFilter::Debug).build())
    .setup(move |app| {
      // Removed log plugin initialization from here
      // Launch the backend sidecar
      #[cfg(not(target_os = "android"))] // Sidecars are not supported on Android
      #[cfg(not(target_os = "ios"))] // Sidecars are not supported on iOS
      {
        let (mut rx, child) = app.handle().shell().sidecar("tabooz-backend")
          .expect("failed to create tabooz-backend command")
          .spawn()
          .expect("failed to spawn sidecar");

        let sidecar_handle_clone_for_spawn = sidecar_handle.clone(); // Clone for spawn closure
        let mut handle_guard = sidecar_handle_clone_for_spawn.0.lock().unwrap();
        *handle_guard = Some(child);

        tauri::async_runtime::spawn(async move {
          while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(ref line) = event {
              println!("Backend stdout: {}", String::from_utf8_lossy(line));
            }
            if let CommandEvent::Stderr(ref line) = event {
              eprintln!("Backend stderr: {}", String::from_utf8_lossy(line));
            }
          }
        });

        // Kill the sidecar when the main window is destroyed
        let app_handle_clone = app.handle().clone(); // Clone app_handle for the closure
        let sidecar_handle_clone_for_listen = sidecar_handle.clone(); // Clone for listen closure
        app_handle_clone.listen("tauri://destroyed", move |_event| { // Use app_handle_clone directly
            println!("Main window destroyed. Attempting to kill sidecar...");
            let mut child_guard = sidecar_handle_clone_for_listen.0.lock().unwrap(); // Use cloned sidecar_handle
            if let Some(child) = child_guard.take() {
                if let Err(e) = child.kill() {
                    eprintln!("Failed to kill sidecar: {}", e);
                } else {
                    println!("Sidecar killed.");
                }
            } else {
                println!("No sidecar process found to kill.");
            }
        });
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
