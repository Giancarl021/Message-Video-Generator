const {app, BrowserWindow} = require('electron');

require('./video_maker/index')().catch(console.log);