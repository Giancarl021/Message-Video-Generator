const bots = {
    phrase: require('./bots/phrase'),
    image: require('./bots/image'),
    music: require('./bots/music'),
    video: require('./bots/video'),
    cleaner: require('./bots/cleaner'),
    devTools: require('./bots/dev-tools')
};

async function main() {
    // const data = {};
    bots.cleaner();
    // data.phrases = await bots.phrase();
    // /* # */ bots.devTools.saveJSON('video_maker/temp/data.json', data);
    /* # */ const data = bots.devTools.loadJSON('video_maker/data/data.json');
    data.image = await bots.image(data.phrases);
    data.music = await bots.music();
    await bots.video(data);
    bots.devTools.saveJSON('video_maker/temp/data.json', data);
    console.log('>> Process successfully ended');
}

module.exports = main;
