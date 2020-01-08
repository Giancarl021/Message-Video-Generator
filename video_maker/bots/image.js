const fs = require('fs');
const imageHandler = require('text-to-picture');
const gm = require('gm').subClass({imageMagick: true});
const imgDownloader = require('image-downloader');
const data = require('../data/config');
const {text, backgroundColor, wordWrapCharCount} = data.image;
const {resolution} = data.video;
const {phraseCount} = data.phrase;
const {exec} = require('child_process');
const {useExec} = data.dev;

async function main(phrases) {
    console.log('>> Initializing image bot');
    const paths = await generateImages(phrases);
    await downloadRandomBackgrounds(phraseCount);
    return await mergeImages(paths);
}

async function generateImages(phrases) {
    console.log('>>> Generating base images');
    let i = 0;
    const paths = [];
    for (const phrase of phrases) {
        const path = `video_maker/temp/foreground/${i}.png`;
        await textToImage(`${wrapText(phrase.message)}\n\n--- ${wrapText(phrase.author)} ---`, text, path);
        paths.push({
            text: path,
            background: `video_maker/temp/background/${i}.jpg`
        });
        i++;
    }

    return paths;

    async function textToImage(text, font, output) {
        const image = await imageHandler.convert({
            text: text,
            color: font.color,
            source: {
                width: 1920,
                height: 1080,
                background: backgroundColor
            },
            quality: '100'
        });

        await image.write(output);
    }

    function wrapText(text) {
        if (text.length > wordWrapCharCount) {
            if (text.match(/\./g) && (text.indexOf('.') > 10 && text.indexOf('.') < text.length - 10)) {
                text = text.replace(/\./, '.\n');
            } else if (text.match(/,/g) && (text.indexOf(',') > 10 && text.indexOf(',') < text.length - 10)) {
                text = text.replace(/,/, ',\n');
            } else {
                const arr = text.split(' ');
                text = '';
                for (let i = 0; i < arr.length; i++) {
                    if (Math.floor(arr.length / 2) === i) {
                        text += `${arr[i]}\n`;
                    } else {
                        text += `${arr[i]} `;
                    }
                }
            }
            text = text.split('\n').map(e => {
                if (e.length > wordWrapCharCount) {
                    return wrapText(e);
                } else return e;
            }).join('\n');
        }
        return text;
    }
}

async function mergeImages(paths) {
    console.log('>>> Merging images');
    let i = 0;
    const outputs = [];
    for (const path of paths) {
        const output = `video_maker/temp/slide/${i++}.png`;
        await mergeImage(path.background, path.text, output);
        outputs.push(output);
    }

    return outputs;

    async function mergeImage(background, foreground, output) {

        return new Promise((resolve, reject) => {
            if (useExec) {
                exec(`magick ${background} ${foreground} -gravity Center -composite ${output}`, (err, stdout, stderr) => {
                    if (err) reject(err);
                    resolve();
                });
            } else {
                gm()
                    .in(background)
                    .in(foreground)
                    .gravity('Center')
                    .out('-composite')
                    .write(output, err => {
                        if (err) return reject(err);
                        return resolve();
                    });
            }
        });
    }
}

async function downloadRandomBackgrounds(n) {
    console.log('>>> Downloading backgrounds');
    const destinationPath = 'video_maker/temp/background';

    for (let i = 0; i < n; i++) {
        await downloadImage(`https://picsum.photos/${resolution.width}/${resolution.height}?random=${i}.jpg`, `${destinationPath}/${i}.jpg`);
    }

    async function downloadImage(url, destination) {
        await imgDownloader.image({
            url: url,
            dest: destination
        });
    }
}

module.exports = main;
