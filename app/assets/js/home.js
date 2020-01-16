function load() {
    const dir = document.getElementById('output-directory');
    dir.value = config.video.outputPath || 'Não definido';
    loadTransitions(
        {
            selector: 'button',
            value: 'background-color .3s, color .3s, filter .1s'
        },
        {
            selector: '#show-process-window',
            value: 'background-color .15s'
        },
        {
            selector: '.process > span',
            value: 'background-color .3s'
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
        document.getElementById('process-name').innerText = 'Inicializando...';
        document.getElementById('subprocess-name').innerText = 'Carregando recursos...';
        startRendering();
    } else {
        toolbar.style.pointerEvents = 'all';
        toolbar.style.opacity = '1';
        document.getElementById('start-rendering').innerText = 'Iniciar';
        document.getElementById('process-name').innerText = 'Processo Interrompido';
        document.getElementById('subprocess-name').innerText = 'Aguradando inicialização';
        removeClass('.process', 'process-running');
        removeClass('.process', 'process-done');
        stopRendering(args.hasStopped);
    }
}

function updateRenderProcess(args) {
    if (!args.code) return;

    const code = args.code;
    const [processType, source, processMessage = 'Processando...'] = code.split('::');

    let target;
    let text = '...';

    switch (processType) {
        case 'bot-start':
            if (source === 'main') return;
            startRunningProcess(source);
            target = document.getElementById('process-name');
            text = 'Processando ' + source;
            break;
        case 'bot-end':
            markProcessDone(source);
            target = document.getElementById('process-name');
            if (source === 'main') {
                text = 'Vídeo renderizado';
            } else {
                text = source + ' finalizou sua tarefa';
            }
            break;
        case 'bot-process':
            // changeProcessInBotBar(source, processMessage);
            target = document.getElementById('subprocess-name');
            text = processMessage;
            break;
    }
    target.innerText = text;
}

function startRunningProcess(id) {
    removeClass('.process', 'process-running');
    document.getElementById(id).className += ' process-running';
}

function markProcessDone(id) {
    document.getElementById(id).className += ' process-done';
}

function removeClass(selector, className) {
    [...document.querySelectorAll(selector)].forEach(e => {
        if(e.classList.contains(className)) {
            e.className = e.className.replace(className, '');
        }
    });
}

module.exports = {
    load,
    selectOutputDir,
    toggleRender,
    updateRenderProcess
};
