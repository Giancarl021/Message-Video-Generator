const { remote, ipcRenderer } = require('electron');

function killProcess() {
    ipcRenderer.send('vidmk-status', { status: 'killed' });
    remote.getCurrentWindow().close();
}
