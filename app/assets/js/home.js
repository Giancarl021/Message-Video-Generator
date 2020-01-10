function load() {
    const config = loadJSON('video_maker/data/config.json');
    const dir = document.getElementById('output-directory');
    dir.value = config.video.outputPath || 'Não definido';
}

function selectOutputDir() {
    const {dialog} = require('electron').remote;
    const config = loadJSON('video_maker/data/config.json');
    const response = dialog.showOpenDialogSync({
        properties: ['openDirectory']
    });
    if(!response) {
        return;
    }
    const path = response[0];
    document.getElementById('output-directory').value = path;
    config.video.outputPath = path;
    saveJSON('video_maker/data/config.json', config);
}

function startRender() {
    const toolbar = document.getElementById('toolbar');
    toolbar.style.pointerEvents = 'none';
    toolbar.style.opacity = '.6';
    document.getElementById('start-rendering').innerText = 'Cancelar';
    const videoMaker = require('./../../../video_maker/index');
    const config = loadJSON('video_maker/data/config.json');

    if(!config.video.outputPath) {
        showMsgBox('O diretório não foi selecionado!');
        return;
    }
    config.video.filename = document.getElementById('filename').value;

    saveJSON('video_maker/data/config.json', config);
    videoMaker(document.getElementById('report-container'));
}

module.exports = {
    load,
    selectOutputDir,
    startRender
};
