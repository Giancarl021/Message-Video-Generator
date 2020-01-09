function load() {
    const imageConfig = require('./../../../video_maker/data/config').image;
    const {text, backgroundColor} = imageConfig;
    const example = document.getElementById('message-example');
    const bgColorPicker = document.getElementById('background-color-picker');
    const fgColorPicker = document.getElementById('foreground-color-picker');

    fgColorPicker.style.backgroundColor = fgColorPicker.getElementsByTagName('input')[0].value = example.style.color = example.style.borderColor = text.color;
    bgColorPicker.style.backgroundColor = bgColorPicker.getElementsByTagName('input')[0].value = example.style.backgroundColor = backgroundColor;
    example.style.fontFamily = text.font;
}

function changeMessageValue(args) {
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

function save() {
    const data = loadJSON('video_maker/data/config.json');
    console.log(data);
    const example = document.getElementById('message-example');
    const backgroundColor = example.style.backgroundColor;
    const font = example.style.fontFamily;
    const color = example.style.color;
    if(backgroundColor) {
        data.image.backgroundColor = backgroundColor;
    }
    if(font) {
        data.image.text.font = font;
    }
    if(color) {
        console.log(color); // Convert to HEX
        data.image.text.color = color;
    }
    // saveJSON('video_maker/data/config.json', data);
}

module.exports = {
    load,
    save,
    changeMessageValue
};
