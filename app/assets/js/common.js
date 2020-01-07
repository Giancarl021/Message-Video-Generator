const fs = require('fs');
const prefixPath = 'app/pages/';

function loadFile(path) {
    return fs.readFileSync(prefixPath + path, 'utf8');
}

function saveFile(path, string) {
    fs.writeFileSync(prefixPath + path, string);
}

function saveJSON(path, data) {
    fs.writeFileSync(prefixPath + path, JSON.stringify(data, null, 4));
}

function loadJSON(path) {
    return JSON.parse(fs.readFileSync(prefixPath + path, 'utf8'));
}