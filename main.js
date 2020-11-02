const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

// Main Window
var mainWindow = null;
async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    await mainWindow.loadFile('src/pages/editor/index.html')


    //mainWindow.webContents.openDevTools();

    // Create new file when the app is open
    createNewFile();

    ipcMain.on('update-content', function (event, data) {
        file.content = data;
    });
}

// File
var file = {}

// Create new file
function createNewFile() {
    file = {
        name: 'new-file.txt',
        content: '',
        saved: false,
        path: app.getPath('documents') + '\\new-file.txt'
    };
    mainWindow.webContents.send('set-file', file)
}

// Save file
function writeFile(filePath) {
    try {
        fs.writeFile(filePath, file.content, function (error) {
            // Error
            if (error) throw error;

            // File Save
            file.path = filePath;
            file.saved = true;
            file.name = path.basename(filePath);

            mainWindow.webContents.send('set-file', file);


        })
    } catch (e) {
        console.log(e);
    }
}

// Create function to save as
async function saveFileAs() {
    //Dialog 
    let dialogFile = await dialog.showSaveDialog(
        {
            defaultPath: file.path
        });

    // Check if its canceled
    if (dialogFile.canceled) {
        return false;
    }

    // Save the file
    writeFile(dialogFile.filePath);

}

// Save file
function saveFile() {
    // Save
    if (file.saved) {
        return writeFile(file.path);
    }

    // Save as 
    return saveFileAs();
}

// Read function 
function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (e) {
        console.log(e)
        return '';
    }
}


// Open file
async function openFile() {
    //Dialog 
    let dialogFile = await dialog.showOpenDialog({
        defaultPath: file.path
    });
    console.log(dialogFile);

    // Check if cancel
    if (dialog.canceled) return false;

    // Open the file
    file = {
        name: path.basename(dialogFile.filePaths[0]),
        content: readFile(dialogFile.filePaths[0]),
        saved: true,
        path: dialogFile.filePaths[0]
    }

    mainWindow.webContents.send('set-file', file);

}
// Template menu
const templateMenu = [
    {
        label: 'File',
        submenu: [
            {
                label: 'New',
                accelerator: 'CmdOrCtrl+N',
                click() {
                    createNewFile();
                }
            },
            {
                label: 'Open',
                accelerator: 'CmdOrCtrl+O',
                click() {
                    openFile();
                }
            },
            {
                label: 'Save',
                accelerator: 'CmdOrCtrl+S',
                click() {
                    saveFile();
                }
            },
            {
                label: 'Save As',
                accelerator: 'CmdOrCtrl+Shift+S',
                click() {
                    saveFileAs();
                }
            },
            {
                label: 'Close',
                accelerator: 'CmdOrCtrl+Q',
                role: process.platform === 'darwin' ? 'close' : 'quit'
            },
        ]
    },
    {
        label: 'Edit File',
        submenu: [
            {
                label: 'Undo',
                role: 'undo'
            },
            {
                label: 'Redo',
                role: 'redo'
            },
            {
                type: 'separator',
            },
            {
                label: 'Copy',
                role: 'copy'
            },
            {
                label: 'Paste',
                role: 'paste'
            },
        ]
    }
];

// Menu
const menu = Menu.buildFromTemplate(templateMenu);
Menu.setApplicationMenu(menu);

// On ready
app.whenReady().then(createWindow);

// Activate
app.on('activate', () => {
    if (BrowserWindow.getFocusedWindow().length === 0) {
        createWindow();
    }
});