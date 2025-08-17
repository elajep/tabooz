const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');
const { fork } = require('child_process');

const viteDevServerUrl = 'http://localhost:8080';

let serverProcess;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // Re-enabled for debugging, as per user's previous request
    },
  });

  win.webContents.openDevTools();

  if (app.isPackaged) {
    // Load the production build of your web app
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  } else {
    // Function to check if Vite server is ready
    const checkViteServer = () => {
      http.get(viteDevServerUrl, (res) => {
        if (res.statusCode === 200) {
          console.log('Vite server is ready, loading URL...');
          win.loadURL(viteDevServerUrl);
        } else {
          console.log('Vite server not ready, retrying...');
          setTimeout(checkViteServer, 1000);
        }
      }).on('error', (err) => {
        console.log('Vite server connection error, retrying...', err.message);
        setTimeout(checkViteServer, 1000);
      });
    };
    checkViteServer();
  }
}

app.whenReady().then(() => {
  if (app.isPackaged) {
    // Start the backend server in production
    const serverPath = path.join(__dirname, 'dist-server', 'server.mjs');
    serverProcess = fork(serverPath, [], {
      stdio: 'pipe' // Pipe stdout/stderr to the main process
    });
    serverProcess.stdout.on('data', (data) => {
      console.log(`Server stdout: ${data}`);
    });
    serverProcess.stderr.on('data', (data) => {
      console.error(`Server stderr: ${data}`);
    });
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Kill the server process when the app is about to quit
  if (serverProcess) {
    console.log('Killing server process...');
    serverProcess.kill();
  }
});