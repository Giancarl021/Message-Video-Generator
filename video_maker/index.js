const bots = {
    path: require('./bots/path'),
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
    data.music = await bots.music();
    await bots.video(data);
    const dataPath = bots.path.buildPath('video_maker/temp/data.json');
    bots.print.print(`>> Saving data of this run on ${dataPath}`);
    bots.devTools.saveJSON(dataPath, data);
    console.log('>> Process successfully ended');
    bots.print.sendInfo('bot-end::main');
}

module.exports = main;
