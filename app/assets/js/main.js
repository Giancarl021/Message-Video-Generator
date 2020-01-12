const {shell} = require('electron');
const fs = require('fs');
const prefixPath = 'app/pages/';
const transitionLoadTime = 200;
let localRequire = null;

// File

function fileExists(path) {
    return fs.existsSync(path);
}

function loadFile(path) {
    return fs.readFileSync(prefixPath + path, 'utf8');
}

function deleteFile(path) {
    fs.unlinkSync(path);
}

function saveFile(path, string) {
    fs.writeFileSync(prefixPath + path, string);
}

// JSON

function saveJSON(path, data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 4));
}

function loadJSON(path) {
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
        return `#${decToHex(r)}${decToHex(g)}${decToHex(b)}`

        function decToHex(n) {
            const num = parseInt(n).toString(16);
            return num.length < 2 ? '0' + num : num;
        }
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
    alert(message);
}

// Main page

function loadCSSFiles() {
    const path = 'app/assets/css';
    fs.readdirSync(path).forEach(css => {
        document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="../assets/css/${css}"/>`);
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

    content.innerHTML = loadFile(`../tabs/${target}.html`);

    if (fs.existsSync(`app/assets/js/${target}.js`)) {
        localRequire = require(`./../assets/js/${target}`);
        localRequire.load();
    }
}

function init() {
    const toolbar = document.getElementById('toolbar');
    const initialTab = toolbar.getAttribute('data-initial-tab');
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
        if(!selectedTab) selectedTab++;
        loadTab(tabs[i], document.querySelector(`[alt="${tabs[i]}"]`));
    }, interval.time);
}

function stopTest() {
    clearInterval(interval.id);
}
