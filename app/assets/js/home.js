function load() {
    const dir = document.getElementById('output-directory');
    dir.value = config.video.outputPath || 'Não definido';
    loadTransitions({
        selector: 'button',
        value: 'background-color .3s, color .3s, filter .1s'
    });
}

function selectOutputDir() {
    const {dialog} = require('electron').remote;
    const response = dialog.showOpenDialogSync({
        properties: ['openDirectory']
    });
    if (!response) {
        return;
    }
    const path = response[0];
    document.getElementById('output-directory').value = path;
    config.video.outputPath = path;
    saveJSON(__configPath, config);
}

function startRender() {
    if (!config.video.outputPath) {
        showMsgBox('O diretório não foi selecionado!');
        return;
    }

    const toolbar = document.getElementById('toolbar');
    toolbar.style.pointerEvents = 'none';
    toolbar.style.opacity = '.6';
    document.getElementById('start-rendering').innerText = 'Cancelar';
    const videoMaker = require('./../../../video_maker/index');
    config.video.filename = document.getElementById('filename').value;

    saveJSON(__configPath, config);
    videoMaker(document.getElementById('report-container'));
}

module.exports = {
    load,
    selectOutputDir,
    startRender
};
