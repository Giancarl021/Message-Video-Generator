const {shell, ipcRenderer} = require('electron');
const fs = require('fs');
const resolvePath = require('path').resolve;
const transitionLoadTime = 200;
let localRequire = null;

let __configPath = 'video_maker/data/config.json';
let config;

// File

function fileExists(path) {
    console.log('fileExists: ' + path);
    return fs.existsSync(path);
}

function loadFile(path) {
    console.log('loadFile: ' + path);
    return fs.readFileSync(path, 'utf8');
}

function deleteFile(path) {
    console.log('deleteFile: ' + path);
    fs.unlinkSync(path);
}

function saveFile(path, string) {
    console.log('saveFile: ' + path);
    fs.writeFileSync(path, string);
}

// JSON

function saveJSON(path, data) {
    console.log('saveJSON: ' + path);
    fs.writeFileSync(path, JSON.stringify(data, null, 4));
    config = loadJSON(path);
}

function loadJSON(path) {
    console.log('loadJSON: ' + path);
    return JSON.parse(fs.readFileSync(path, 'utf8'));
}

// External calls

function openLink(url) {
    shell.openExternal(url).catch(console.log);
}

// CSS

function cssRgbToHex(string) {
    const values = string.substring(string.indexOf('(') + 1, string.indexOf(')')).split(',');
    return rgbToHex(values[0], values[1], values[2]);

    function rgbToHex(r, g, b) {
        return `#${decToHex(r)}${decToHex(g)}${decToHex(b)}`;

        function decToHex(n) {
            const num = parseInt(n).toString(16);
            return num.length < 2 ? '0' + num : num;
        }
    }
}

// Video Maker communication

ipcRenderer.on('start-video-maker', (event, args) => {
    console.log(args)
});
ipcRenderer.on('stop-video-maker', (event, args) => {
    console.log(args)
});

function startRendering() {
    ipcRenderer.send('start-video-maker');
}

function stopRendering() {
    ipcRenderer.send('stop-video-maker', 'nothing');
}

// Tabs calls

function local(fn, args = undefined) {
    if (!localRequire) {
        console.error('Local JS is not defined');
        return;
    }
    if (typeof localRequire[fn] !== 'function') {
        console.error('Local JS Call is not a function');
        return;
    }
    localRequire[fn](args);
}

function loadTransitions(...transitions) {
    setTimeout(() => {
        for (const transition of transitions) {
            [...document.querySelectorAll(transition.selector)].forEach(element => {
                element.style.transition = transition.value;
            });
        }
    }, transitionLoadTime);
}

function showMsgBox(message) {
    alert(message);
}

// Main page

function loadCSSFiles() {
    const path = 'app/assets/css';
    fs.readdirSync(path).forEach(css => {
       if(!css.includes('@')) document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="../assets/css/${css}"/>`);
    });
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

    content.innerHTML = loadFile(`app/tabs/${target}.html`);

    if (fs.existsSync(`app/assets/js/${target}.js`)) {
        localRequire = require(`./../assets/js/${target}`);
        localRequire.load();
    }
}

function init() {
    const toolbar = document.getElementById('toolbar');
    const initialTab = toolbar.getAttribute('data-initial-tab');
    config = loadJSON(__configPath);
    loadCSSFiles();
    if (initialTab) {
        loadTab(initialTab, document.querySelector(`[alt="${initialTab}"]`));
    }
}

document.addEventListener('DOMContentLoaded', init);

let tabs = ['welcome', 'home', 'images', 'configs'];
let selectedTab = 0;

const interval = {
    id: undefined,
    time: 1000
};


function startTest() {
    interval.id = setInterval(() => {
        const i = selectedTab === tabs.length ? selectedTab = 0 : selectedTab++;
        if (!selectedTab) selectedTab++;
        loadTab(tabs[i], document.querySelector(`[alt="${tabs[i]}"]`));
    }, interval.time);
}

function stopTest() {
    clearInterval(interval.id);
}
