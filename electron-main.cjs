const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');

const viteDevServerUrl = 'http://localhost:8080';

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

<<<<<<< HEAD
  

=======
>>>>>>> parent of 615a596 (style fix)
  if (app.isPackaged) {
    // Load the production build of your web app
    win.loadFile(path.join(__dirname, '../dist/index.html'));
    // win.webContents.openDevTools(); // Removed as per user's request
  } else {
    // Function to check if Vite server is ready
    const checkViteServer = () => {
      http.get(viteDevServerUrl, (res) => {
        if (res.statusCode === 200) {
          console.log('Vite server is ready, loading URL...');
          win.loadURL(viteDevServerUrl);
          // win.webContents.openDevTools(); // Removed as per user's request
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
<<<<<<< HEAD
  if (app.isPackaged) {
    // Start the backend server in production
    const serverPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'dist-server', 'server.mjs');
    // For debugging: Use spawn with 'inherit' stdio to see server output directly in the terminal
    serverProcess = require('child_process').spawn('node', [serverPath], {
      stdio: 'inherit' // Inherit stdout/stderr from the parent process
    });
    console.log(`Attempting to start server from: ${serverPath}`);
    serverProcess.on('error', (err) => {
      console.error(`Failed to start server process: ${err.message}`);
    });
    serverProcess.on('exit', (code, signal) => {
      console.log(`Server process exited with code ${code} and signal ${signal}`);
    });
  }

=======
>>>>>>> parent of 615a596 (style fix)
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