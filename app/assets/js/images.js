function load() {
    const videoMakerConfig = require('./../../../video_maker/data/config');
    const resolution = videoMakerConfig.video.resolution;
    const imageData = videoMakerConfig.image;

    const example = document.getElementById('message-example');

    const proportion = Math.floor(example.parentElement.clientWidth / resolution.width);
    console.log(proportion);
}

module.exports = load;