function load() {
    loadMessageTile();
    loadImageControllers();
    loadTransitions(
        {
            selector: '#message-example',
            value: 'color .3s, background-color .5s'
        },
        {
            selector: '.message-control-button, .image-control',
            value: 'background-color .3s, color .3s, filter .1s'
        },
        {
            selector: '.form-control, .image-controls',
            value: 'opacity .3s'
        },
        {
            selector: '.reset-button, .confirm-button',
            value: 'filter .15s'
        }
    );
}

/* Message Tile */

function changeMessageValue(args) {
    const form = document.getElementsByClassName('form-control')[0];
    if (form.classList.contains('form-locked')) {
        form.className = form.className.replace('form-locked', '');
    }
    const example = document.getElementById('message-example');
    if (!args.style || !args.value) {
        throw new Error('Args not defined!');
    }

    switch (args.style) {
        case 'background':
            example.style.backgroundColor = args.value;
            break;
        case 'foreground':
            example.style.color = example.style.borderColor = args.value;
            break;
        case 'font':
            example.style.fontFamily = args.value;
    }
}

function loadMessageTile() {
    const imageConfig = config.image;
    const { text, backgroundColor } = imageConfig;
    const example = document.getElementById('message-example');
    const bgColorPicker = document.getElementById('background-color-picker');
    const fgColorPicker = document.getElementById('foreground-color-picker');
    const fontSelector = document.getElementById('font-selector');

    document.getElementsByClassName('form-control')[0].className += ' form-locked';
    fgColorPicker.style.backgroundColor = fgColorPicker.getElementsByTagName('input')[0].value = example.style.color = example.style.borderColor = text.color;
    bgColorPicker.style.backgroundColor = bgColorPicker.getElementsByTagName('input')[0].value = example.style.backgroundColor = backgroundColor;
    example.style.fontFamily = text.font;
    fontSelector.value = text.font.replace(/\"/g, '');
}

function saveMessageTile() {
    document.getElementsByClassName('form-control')[0].className += ' form-locked';
    const data = config;
    const example = document.getElementById('message-example');
    const backgroundColor = cssRgbToHex(example.style.backgroundColor);
    const font = example.style.fontFamily;
    const color = cssRgbToHex(example.style.color);
    if (backgroundColor) {
        data.image.backgroundColor = backgroundColor;
    }
    if (font) {
        data.image.text.font = font;
    }
    if (color) {
        data.image.text.color = color;
    }
    saveJSON(__configPath, data);
}

function invertColors() {
    const example = document.getElementById('message-example');
    const bgColorPicker = document.getElementById('background-color-picker');
    const fgColorPicker = document.getElementById('foreground-color-picker');

    const bg = cssRgbToHex(example.style.backgroundColor);
    const fg = cssRgbToHex(example.style.color);

    fgColorPicker.style.backgroundColor = fgColorPicker.getElementsByTagName('input')[0].value = bg;
    bgColorPicker.style.backgroundColor = bgColorPicker.getElementsByTagName('input')[0].value = fg;

    changeMessageValue({ style: 'foreground', value: bg });
    changeMessageValue({ style: 'background', value: fg });
}

/* Image Tiles */

function fallbackImage(element) {
    if (!element) return;
    element.src = '../assets/img/image.svg';
    modifyImageControls(element.parentElement, false);
}

function loadImageControllers() {
    const { openingImage, endingImage } = config.video;
    const img = {
        op: document.getElementById('op-img'),
        ed: document.getElementById('ed-img')
    };
    if (openingImage && fileExists(openingImage, true)) {
        img.op.src = unpackedPrefix + `${openingImage}?${Date.now()}`;
        modifyImageControls(img.op.parentElement, true);
    } else {
        fallbackImage(img.op);
    }

    if (endingImage && fileExists(endingImage, true)) {
        img.ed.src = unpackedPrefix + `${endingImage}?${Date.now()}`;
        modifyImageControls(img.ed.parentElement, true);
    } else {
        fallbackImage(img.ed);
    }
}

function modifyImageControls(element, hasImage) {
    const elements = {
        add: element.getElementsByClassName('add-img')[0],
        rm: element.getElementsByClassName('rm-img')[0]
    };

    if (hasImage) {
        elements.add.innerText = 'Mudar imagem';
        if (elements.rm.classList.contains('disabled-image-control')) {
            elements.rm.className = elements.rm.className.replace('disabled-image-control', '');
        }
    } else {
        elements.add.innerText = 'Adicionar imagem';
        if (!elements.rm.classList.contains('disabled-image-control')) {
            elements.rm.className += ' disabled-image-control';
        }
    }
}

function addImage(args) {
    if (!args.target) return;
    const target = document.getElementById(args.target);
    target.onchange = async function () {
        const file = target.files[0];
        if (!file) return;
        if (file.type.replace(/\/.*/g, '') !== 'image') {
            showMsgBox('Arquivo inválido ou inexistente');
            return;
        }
        startLoadingController(target.parentElement.parentElement);
        const path = await fitImage(file.path);
        if (args.target === 'add-op-img') {
            config.video.openingImage = path;
        } else if (args.target === 'add-ed-img') {
            config.video.endingImage = path;
        }
        saveJSON(__configPath, config);
        stopLoadingController(target.parentElement.parentElement);
        loadImageControllers();

        async function fitImage(filePath) {
            const { resolution } = config.video;
            const gm = require('gm').subClass({ imageMagick: true });
            const output = `video_maker/data/images/${args.target}.png`;
            return new Promise((resolve, reject) => {
                const { exec } = require('child_process');
                exec(`magick "${filePath}" -resize ${resolution.width}x${resolution.height} -background black -gravity center -extent ${resolution.width}x${resolution.height} "${unpackedPrefix + output}"`, (err, stdout, stderr) => {
                    if (err) return reject(err);
                    return resolve(output);
                });
            });
        }
    };
    target.click();
}

function removeImage(args) {
    if (!args.target) return;
    const data = config;
    const img = {
        op: document.getElementById('op-img'),
        ed: document.getElementById('ed-img')
    };

    const target = {
        op: document.getElementById('add-op-img'),
        ed: document.getElementById('add-ed-img')
    };

    if (args.target === 'op') {
        deleteFile(data.video.openingImage, true);
        data.video.openingImage = '';
        target.op.value = '';
        img.op.src = '';
    } else if (args.target === 'ed') {
        deleteFile(data.video.endingImage, true);
        data.video.endingImage = '';
        target.ed.value = '';
        img.ed.src = '';
    }
    saveJSON(__configPath, data);
    loadImageControllers();
}

function startLoadingController(element) {
    element.__text = element.getElementsByTagName('h1')[0].innerText;
    element.getElementsByTagName('h1')[0].innerText = 'Carregando...';
    const buttons = element.getElementsByClassName('image-control');
    for (const button of buttons) {
        if (!button.classList.contains('disabled-image-control'))
            button.className += ' disabled-image-control';
    }
}

function stopLoadingController(element) {
    element.getElementsByTagName('h1')[0].innerText = element.__text;
    const buttons = element.getElementsByClassName('image-control');
    for (const button of buttons) {
        button.className = button.className.replace('disabled-image-control', '');
    }
}

module.exports = {
    load,
    loadMessageTile,
    saveMessageTile,
    invertColors,
    changeMessageValue,
    addImage,
    removeImage
};
