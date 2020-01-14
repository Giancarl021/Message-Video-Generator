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
    /* *
    *
    * args
    * {
    *   action: 'start' | ['kill' | 'stop'] | 'show',
    * }
    * 
    * */

    if (args.action) {
        switch (args.action) {
            case 'start':
                startVideoMaker();
                break;
            case 'stop':
            case 'kill':
                killVideoMaker();
                break;
            case 'show':
                showVideoMaker();
                break;
            default:
                console.log('Action not recognized: ' + args.action);
        }
    }
    event.sender.send('video-maker', 'Action done: ' + args.action);
});

ipcMain.on('vidmk-status', (event, args) => {
    if(!args.status) return;
    console.log(args);
    parseVidmkStatus(args.status);
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
    } catch (e) {
        console.log(e);
    }
}

function showVideoMaker() {
    if (!vidmk) return;
    vidmk.show();
}

function parseVidmkStatus(status) {
    switch(status) {
        case 'killed':
            win.webContents.send('video-maker-status', {status: 'killed'});
            break;
    }
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
        webPreferences: {
            nodeIntegration: true
        },
        frame: false,
        show: false
    });

    vidmk.removeMenu();

    vidmk.loadFile('app/pages/video-maker.html').catch(console.log);

    vidmk.on('closed', () => {
        vidmk = null;
    });
}
