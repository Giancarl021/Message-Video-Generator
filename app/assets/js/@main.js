const {shell, ipcRenderer, remote} = require('electron');
const fs = require('fs');
const transitionLoadTime = 200;
let localRequire = null;

const prefix = createPrefix();
const unpackedPrefix = createPrefix(true);
const __configPath = 'video_maker/data/config.json';
let config;

let isRendering = false;

// File

function createPrefix(isUnpacked = false) {
    let string = remote.app.getAppPath().replace(/\\/g, '/');
    if (string.charAt(string.length - 1) !== '/') {
        string += '/';
    }
    if (isUnpacked) {
        string = string.replace('.asar', '.asar.unpacked');
    }
    return string;
}

function fileExists(path, isUnpacked = false) {
    const address = isUnpacked ? unpackedPrefix + path : prefix + path;
    console.log('fileExists: ' + address);
    return fs.existsSync(address);
}

function loadFile(path, isUnpacked = false) {
    const address = isUnpacked ? unpackedPrefix + path : prefix + path;
    console.log('loadFile: ' + address);
    return fs.readFileSync(prefix + path, 'utf8');
}

function deleteFile(path, isUnpacked = false) {
    const address = isUnpacked ? unpackedPrefix + path : prefix + path;
    console.log('deleteFile: ' + address);
    fs.unlinkSync(address);
}

function saveFile(path, string, isUnpacked = false) {
    const address = isUnpacked ? unpackedPrefix + path : prefix + path;
    console.log('saveFile: ' + address);
    fs.writeFileSync(prefix + path, string);
}

function loadDir(path, isUnpacked = false) {
    const address = isUnpacked ? unpackedPrefix + path : prefix + path;
    console.log('loadDir: ' + address);
    return fs.readdirSync(address);
}

// JSON

function saveJSON(path, data) {
    let isUnpacked = false;
    if (path === __configPath) {
        isUnpacked = true;
    }
    saveFile(path, JSON.stringify(data, null, 4), isUnpacked);
    config = loadJSON(path);
}

function loadJSON(path) {
    let isUnpacked = false;
    if (path === __configPath) {
        isUnpacked = true;
    }
    return JSON.parse(loadFile(path, isUnpacked));
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

ipcRenderer.on('video-maker', (event, args) => {
    console.log(args)
});

function startRendering() {
    ipcRenderer.on('video-maker-status', __vidmkStatusListener);
    ipcRenderer.send('video-maker', {action: 'start'});
    isRendering = true;
}

function showOutput() {
    if (isRendering) {
        ipcRenderer.send('video-maker', {action: 'show'});
    } else {
        showMsgBox('Não está renderizando');
    }
}

function stopRendering(hasStopped) {
    if (!hasStopped) {
        ipcRenderer.send('video-maker', {action: 'kill'});
    }
    isRendering = false;
    ipcRenderer.removeAllListeners('video-maker-status');
}

function __vidmkStatusListener(event, args) {
    if (!args.status) return;
    if (args.status === 'killed') {
        local('toggleRender', {hasStopped: true});
    } else if (args.status === 'finished') {
        local('toggleRender', {hasStopped: true, hasFinished: true})
    } else if (args.status === 'info') {
        local('updateRenderProcess', {code: args.message});
    } else if (args.status === 'error') {
        if(isRendering) local('toggleRender', {hasStopped: true});
        showMsgBox(args.message);
    }
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
    console.log(message);
    remote.dialog.showMessageBoxSync({
        type: 'info',
        title: 'Message Video Generator',
        buttons: ['Ok'],
        message: message
    });
}

// Main page

function loadCSSFiles() {
    const path = 'app/assets/css';
    loadDir(path).forEach(css => {
        if (!css.includes('@')) document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="../assets/css/${css}"/>`);
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

    if (fileExists(`app/assets/js/${target}.js`)) {
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
