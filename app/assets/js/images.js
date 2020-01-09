function load() {
    const imageConfig = loadJSON('video_maker/data/config.json').image;
    const {text, backgroundColor} = imageConfig;
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

function changeMessageValue(args) {
    const form = document.getElementsByClassName('form-control')[0];
    if(form.classList.contains('form-locked')) {
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

function save() {
    document.getElementsByClassName('form-control')[0].className += ' form-locked';
    const data = loadJSON('video_maker/data/config.json');
    const example = document.getElementById('message-example');
    const backgroundColor = cssRgbToHex(example.style.backgroundColor);
    const font = example.style.fontFamily;
    const color = cssRgbToHex(example.style.color);
    if(backgroundColor) {
        data.image.backgroundColor = backgroundColor; // Convert to HEX
    }
    if(font) {
        data.image.text.font = font;
    }
    if(color) {
        data.image.text.color = color;
    }
    saveJSON('video_maker/data/config.json', data);
}

module.exports = {
    load,
    save,
    changeMessageValue
};
