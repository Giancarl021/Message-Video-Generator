const printer = require('./print');
const {buildPath, buildUnpacked} = require('./path');
const videoshow = require('videoshow');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path; // ERROR HERE
const ffprobePath = require('@ffprobe-installer/ffprobe').path; // ERROR HERE
const videoOptions = require('./../data/config').video;
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const fs = require('fs');
const imageSize = require('image-size');
const {getAudioDurationInSeconds} = require('get-audio-duration');

async function main(data) {
    printer.print('>> Video bot initialing');
    const images = insertImages(data);
    const slideDuration = await getSlideDuration(data, images.length);
    const options = {
        fps: 25,
        loop: slideDuration,
        transition: true,
        transitionDuration: .7,
        videoBitrate: 8000,
        size: `${videoOptions.resolution.width}x${videoOptions.resolution.height}`,
        audioBitrate: '128k',
        audioChannels: 2,
        format: videoOptions.format,
        videoCodec: 'libx264',
        pixelFormat: 'yuv420p'
    };

    data.video = options;

    await renderVideo(data, images, options);
    return data;
}

function calculateBpmDuration(data, seconds) {
    const bps = data.music.bpm / 60;
    return Math.floor(seconds / bps) * bps;
}

function insertImages(data) {
    printer.print('>>> Parsing Images');
    const images = data.image;

    if (videoOptions.openingImage && fs.existsSync(videoOptions.openingImage) && fs.lstatSync(videoOptions.openingImage).isFile()) {
        let dim;
        try {
            dim = imageSize(videoOptions.openingImage);
        } catch (e) {
            printer.print('>>> Opening image file is not a image');
            dim = false;
        }
        if (!dim || dim.width !== 1920 || dim.height !== 1080) {
            if (dim) printer.print('>>> Opening image with wrong resolution, resize the image to 1920x1080px');
        } else {
            images.unshift(videoOptions.openingImage);
        }
    }

    if (videoOptions.endingImage && fs.existsSync(videoOptions.endingImage) && fs.lstatSync(videoOptions.endingImage).isFile()) {
        let dim;
        try {
            dim = imageSize(videoOptions.endingImage);
        } catch (e) {
            printer.print('>>> Ending image file is not a image');
            dim = false;
        }
        if (!dim || dim.width !== 1920 || dim.height !== 1080) {
            if (dim) printer.print('>>> Ending image with wrong resolution, resize the image to 1920x1080px');
        } else {
            images.push(videoOptions.endingImage);
        }
    }
    return images;
}

async function getSlideDuration(data, n) {
    printer.print('>>> Calculating slide duration');
    let slideDuration;
    if (videoOptions.slideDuration && typeof videoOptions.slideDuration === 'number') {
        slideDuration = calculateBpmDuration(data, videoOptions.slideDuration);
    } else {
        const audioDuration = await getAudioDurationInSeconds(buildPath('video_maker/temp/music/song.mp3'));
        slideDuration = calculateBpmDuration(data, audioDuration / n);
    }
    return slideDuration;
}

async function renderVideo(data, images, options) {
    printer.print('>>> Rendering video');
    printer.sendInfo('bot-start::video');
    const filename = videoOptions.filename || Date.now();
    printer.sendInfo('bot-process::video::rendering');
    return new Promise((resolve, reject) => {
        videoshow(images, options)
            .audio(data.music.path)
            .save(`${videoOptions.outputPath}/${filename}.mp4`)
            .on('error', reject)
            .on('end', () => {
                printer.print('>>> Video successfully rendered');
                printer.sendInfo('bot-end::video');
                resolve();
            });
    });
}

module.exports = main;
