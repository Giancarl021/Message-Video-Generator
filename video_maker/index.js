const bots = {
    print: require('./bots/print'),
    phrase: require('./bots/phrase'),
    image: require('./bots/image'),
    music: require('./bots/music'),
    video: require('./bots/video'),
    cleaner: require('./bots/cleaner'),
    devTools: require('./bots/dev-tools')
};

async function main(element) {
    bots.print.setElement(element);
    bots.print.sendInfo('bot-start::main');
    const data = {};
    bots.cleaner();
    data.phrases = await bots.phrase();
    data.image = await bots.image(data.phrases);

    // /* # */ bots.devTools.saveJSON('C:\Users\Pichau\Documents\Git\Message-Video-Generator\video_maker\temp\data.json', data);
    // /* # */ const data = bots.devTools.loadJSON('C:\\Users\\Pichau\\Documents\\Git\\Message-Video-Generator\\video_maker\\temp\\data.json');
    
    data.music = await bots.music();
    await bots.video(data);
    bots.devTools.saveJSON('video_maker/temp/data.json', data);
    console.log('>> Process successfully ended');
    bots.print.sendInfo('bot-end::main');
}

module.exports = main;
