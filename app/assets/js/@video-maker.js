const { remote, ipcRenderer } = require('electron');
const videoMaker = require('./../../video_maker/index');

function killProcess() {
    ipcRenderer.send('vidmk-status', { status: 'killed' });
    remote.getCurrentWindow().close();
}

function init() {
    videoMaker(document.getElementById('output'))
        .then(() => {
            killProcess();
        })
        .catch((err) => {
            ipcRenderer.send('vidmk-status', { status: 'error', message: err.message })
            killProcess();
        });
}

document.addEventListener('DOMContentLoaded', init);