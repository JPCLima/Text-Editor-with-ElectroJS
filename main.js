const { app, BrowserWindow } = require('electron');

// Main Window
var mainWindow = null;
async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600
    });

    await mainWindow.loadFile('src/pages/editor/index.html')
}

// On ready
app.whenReady().then(createWindow);

// Activate
app.on('activate', () => {
    if (BrowserWindow.getFocusedWindow().length === 0) {
        createWindow();
    }
});