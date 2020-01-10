const printer = require('./print');
const fs = require('fs');

function main() {
    printer.print('>> Initializing cleaner bot');
    const tmp = fs.readdirSync('video_maker/temp');
    tmp.forEach(e => {
        clearDirectory(`video_maker/temp/${e}`)
    });
    printer.print('>>> Temp files cleaned');
}

function clearDirectory(path) {
    if (fs.lstatSync(path).isDirectory()) {
        const sub = fs.readdirSync(path);
        sub.forEach(e => {
            clearDirectory(`${path}/${e}`)
        });
    } else {
        fs.unlinkSync(path);
    }
}

module.exports = main;
