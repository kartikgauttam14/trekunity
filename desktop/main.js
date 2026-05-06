const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  Menu.setApplicationMenu(null);

  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#080c10',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const indexPath = app.isPackaged
    ? path.join(process.resourcesPath, 'frontend-dist', 'index.html')
    : path.join(__dirname, '..', 'frontend', 'dist', 'index.html');

  win.loadFile(indexPath);
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
