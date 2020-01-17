const {remote, ipcRenderer} = require('electron');
const videoMaker = require('./../../video_maker/index');

function killProcess() {
    remote.getCurrentWindow().hide();
}

function init() {
    videoMaker(document.getElementById('output'))
        .then(() => {
            ipcRenderer.send('vidmk-status', {status: 'finished'});
            killProcess();
        })
        .catch((err) => {
            ipcRenderer.send('vidmk-status', {status: 'error', message: err.message});
            killProcess();
        });
    const output = document.getElementById('output');
    setInterval(() => {
        window.scrollTo(0, output.scrollHeight);
    }, 0);
}

document.addEventListener('DOMContentLoaded', init);
