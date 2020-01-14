const {app, BrowserWindow, globalShortcut} = require('electron');
let win;

function createWindow() {
    win = new BrowserWindow({
        width: 900,
        height: 710,
        webPreferences: {
            nodeIntegration: true
        },
        show: false
    });

    // win.removeMenu();

    win.on('ready-to-show', () => {
        win.show()
    });

    win.loadFile('app/pages/main.html').catch(console.log);

    win.on('closed', () => {
        win = null
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});
