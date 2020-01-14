let __printElement;
const { ipcRenderer } = require('electron');

function print(message) {
    __printElement.innerHTML += message + '<br/>';
}

function sendInfo(message) {
    ipcRenderer.send('vidmk-status', { status: 'info', message: message });
}

function setElement(element) {
    __printElement = element;
}

module.exports = {
    print,
    sendInfo,
    setElement
};
