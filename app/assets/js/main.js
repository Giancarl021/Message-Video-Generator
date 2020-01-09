const { shell } = require('electron');
const fs = require('fs');
const prefixPath = 'app/pages/';
const videoMaker = require('./../../video_maker/index.js');

let localRequire = null;

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

function openLink(url) {
    shell.openExternal(url);
}

function startRender() {
    videoMaker();
}

function init() {
    const toolbar = document.getElementById('toolbar');
    const initialTab = toolbar.getAttribute('data-initial-tab');
    if (initialTab) {
        loadTab(initialTab, document.querySelector(`[alt="${initialTab}"]`));
    }
}

function loadTab(target, element) {
    const toolbarItems = document.getElementsByClassName('toolbar-item');
    for (const toolbarItem of toolbarItems) {
        const classes = toolbarItem.classList;
        if (classes.contains('toolbar-item-selected') && toolbarItem !== element) {
            classes.remove('toolbar-item-selected');
        }
    }
    if (element) {
        element.classList.add('toolbar-item-selected');
    }

    const content = document.getElementById('content');
    let html = loadFile(`../tabs/${target}.html`);

    if (fs.existsSync(`app/assets/css/${target}.css`)) {
        html += `<link rel="stylesheet" href="../assets/css/${target}.css"/>`;
    }

    content.innerHTML = html;

    if (fs.existsSync(`app/assets/js/${target}.js`)) {
        localRequire = require(`./../assets/js/${target}`);
        localRequire.load();
    }
}
function local(fn, args = undefined) {
    if(!localRequire) return;
    localRequire[fn](args);
}


document.addEventListener('DOMContentLoaded', init);
