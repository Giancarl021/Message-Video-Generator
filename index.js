const {app, BrowserWindow, ipcMain} = require('electron');
let win, vidmk;

// Stating the application

app.on('ready', createMainWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
    killVideoMaker();
});

app.on('activate', () => {
    if (win === null) {
        createMainWindow();
    }
});

// Async Window Communication

ipcMain.on('video-maker', (event, args) => {
    let reply = 'Nothing happened';
    if (args.action) {
        switch (args.action) {
            case 'start':
                startVideoMaker();
                reply = 'Starting Video Maker';
                break;
            case 'stop':
            case 'kill':
                killVideoMaker();
                reply = 'Stopping Video Maker';
                break;
            case 'show':
                showVideoMaker();
                reply = 'Showing Video Maker';
                break;
            default:
                reply = 'Action not recognized: ' + args.action;
        }
    }
    event.sender.send('video-maker', reply);
});

ipcMain.on('vidmk-status', (event, args) => {
    if(!args.status) return;
    win.webContents.send('video-maker-status', args);
});

// Video Maker Process Handlers

function startVideoMaker() {
    createReportWindow();
}

function killVideoMaker() {
    if (!vidmk) return;
    try {
        vidmk.close();
        vidmk = null;
        win.webContents.send('video-maker-status', {status: 'killed'});
    } catch (e) {
        console.log(e);
    }
}

function showVideoMaker() {
    if (!vidmk) return;
    vidmk.show();
}

// Window Constructors

function createMainWindow() {
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
        killVideoMaker();
        win = null;
    });
}

function createReportWindow() {
    vidmk = new BrowserWindow({
        width: 600,
        height: 400,
        minWidth: 600,
        minHeight: 400,
        webPreferences: {
            nodeIntegration: true
        },
        frame: false,
        show: false
    });

    vidmk.removeMenu();

    vidmk.loadFile('app/pages/video-maker.html').catch(console.log);

    vidmk.on('closed', () => {
        win.webContents.send('video-maker-status', {status: 'killed'});
        vidmk = null;
    });
}
