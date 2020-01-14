function load() {
    const dir = document.getElementById('output-directory');
    dir.value = config.video.outputPath || 'Não definido';
    loadTransitions({
        selector: 'button',
        value: 'background-color .3s, color .3s, filter .1s'
    });
}

function selectOutputDir() {
    const { dialog } = require('electron').remote;
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

function toggleRender(args = {hasStopped: false}) {
    const toolbar = document.getElementById('toolbar');

    if (!isRendering) {
        if (!config.video.outputPath) {
            showMsgBox('O diretório não foi selecionado!');
            return;
        }

        toolbar.style.pointerEvents = 'none';
        toolbar.style.opacity = '.6';
        document.getElementById('start-rendering').innerText = 'Cancelar';
        config.video.filename = document.getElementById('filename').value;
        saveJSON(__configPath, config);
        startRendering();
    } else {
        toolbar.style.pointerEvents = 'all';
        toolbar.style.opacity = '1';
        document.getElementById('start-rendering').innerText = 'Iniciar';
        stopRendering(args.hasStopped);
    }
}

function updateRenderProcess(args) {
    if(!args.code) return;
    const code = args.code;
    const [processType, source, processMessage = 'Processando...'] = code.split('::');
    switch(processType) {
        case 'bot-start':
            // selectBotBar(source);
            console.log('BOT START: ' + source);
            if(source === 'main') {
                // Process started
                console.log('Everything started');
            }
            break;
        case 'bot-end':
            // completeBotBar(source);
            console.log('BOT ENDED: ' + source);
            if(source === 'main') {
                console.log('Everything ended');
            }
            break;
        case 'bot-process':
            // changeProcessInBotBar(source, processMessage);
            console.log('BOT DOING: ' + source + ' > ' + processMessage);
            break;
    }
}

module.exports = {
    load,
    selectOutputDir,
    toggleRender,
    updateRenderProcess
};
