const printer = require('./print');
const {buildPath} = require('./path');
const fs = require('fs');

function main() {
    printer.print('>> Initializing cleaner bot');
    printer.sendInfo('bot-start::cleaner');
    printer.sendInfo('bot-process::cleaner::cleaning-temp');
    const path = buildPath('video_maker/temp');
    const tmp = fs.readdirSync(path);
    tmp.forEach(e => {
        clearDirectory(`${path}/${e}`)
    });
    printer.print('>>> Temp files cleaned');
    printer.sendInfo('bot-process::cleaner::verifying-folders');
    createTempDirectories(path);
    printer.sendInfo('bot-end::cleaner');
}

function createTempDirectories(path) {
    const dir = [
        'background',
        'foreground',
        'music',
        'slide'
    ];
    dir.forEach(e => {
        if(!fs.existsSync(`${path}/${e}`)) {
            fs.mkdirSync(e);
        }
    });
}

function clearDirectory(path) {
    if (fs.lstatSync(path).isDirectory()) {
        const sub = fs.readdirSync(path);
        sub.forEach(e => {
            clearDirectory(`${path}/${e}`)
        });
    } else if(!path.includes('.lock')) {
        fs.unlinkSync(path);
    }
}

module.exports = main;
