const {remote} = require('electron');

const __packedPath = getPath();
const __unpackedPath = getPath(true);

function buildPath(path, isUnpacked = true) {
    return (isUnpacked ? __unpackedPath : __packedPath) + path;
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
    buildPath
};
