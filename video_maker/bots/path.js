const {remote} = require('electron');

function getPacked() {
    return getPath();
}

function getUnpacked() {
    return getPath(true);
}

function buildPath(path, isUnpacked) {
    return (isUnpacked ? getUnpacked() : getPacked()) + path;
}

function getPath(isUnpacked = false) {
    let string = remote.app.getAppPath().replace(/\\/g, '/');
    if (string.charAt(string.length - 1) !== '/') {
        string += '/';
    }
    if (isUnpacked) {
        string = string.replace('.asar', '.asar.unpacked');
    }
    return string;
}

module.exports = {
    getPacked,
    getUnpacked,
    buildPath
};
