const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 960,
    height: 700,
    minWidth: 400,
    minHeight: 300,
    title: 'assistente apk',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
    show: false,
    autoHideMenuBar: true,
  });

  win.loadFile(path.join(__dirname, 'www', 'index.html'));

  win.once('ready-to-show', () => win.show());

  // Remove menu bar
  Menu.setApplicationMenu(null);
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
