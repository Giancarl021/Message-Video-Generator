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

function toggleRender(args = {hasStopped: false, hasFinished: false}) {
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
        document.getElementById('process-name').innerText = args.hasFinished ? 'Processo concluído' : 'Processo Interrompido';
        document.getElementById('subprocess-name').innerText = args.hasFinished ? 'Seu vídeo está pronto!' : 'Aguardando inicialização';
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
            text = 'Processando ' + parseBotName(source);
            break;
        case 'bot-end':
            if (source !== 'main') markProcessDone(source);
            target = document.getElementById('process-name');
            if (source === 'main') {
                text = 'Vídeo renderizado';
            } else {
                text = 'Finalização do Processamento de ' + source;
            }
            break;
        case 'bot-process':
            target = document.getElementById('subprocess-name');
            text = parseBotMessage(processMessage);
            break;
    }
    target.innerText = text;
}

function parseBotName(botName) {
    let name;
    switch (botName) {
        case 'cleaner':
            name = 'Inicialização';
            break;
        case 'phrase':
            name = 'Frases';
            break;
        case 'image':
            name = 'Imagens';
            break;
        case 'music':
            name = 'Música';
            break;
        case 'video':
            name = 'Vídeo';
            break;
        default:
            name = '. . .';
    }
    return name;
}

function parseBotMessage(text) {
    let message;
    switch (text) {
        case 'cleaning-temp':
            message = 'Limpando arquivos temporários';
            break;
        case 'downloading-phrases':
            message = 'Baixando frases';
            break;
        case 'generating-fg':
            message = 'Gerando imagens com frases';
            break;
        case 'downloading-bg':
            message = 'Baixando imagens de fundo';
            break;
        case 'merging-img':
            message = 'Mesclando imagens de frases com imagens de fundo';
            break;
        case 'finding-music':
            message = 'Buscando música';
            break;
        case 'downloading-music':
            message = 'Baixando música';
            break;
        case 'rendering':
            message = 'Renderizando vídeo';
            break;
        default:
            message = '. . .';
    }
    return message;
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
        if (e.classList.contains(className)) {
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
