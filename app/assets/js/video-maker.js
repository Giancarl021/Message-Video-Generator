const {remote, ipcRenderer} = require('electron');

function killProcess() {
    remote.getCurrentWindow().close();
}
