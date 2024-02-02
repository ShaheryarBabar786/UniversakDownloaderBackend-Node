const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');

require('dotenv').config();
require('./database/db');

const app = express();

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use(cors());
app.use(morgan('dev'));



function sanitizeTitle(title) {
    return title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
}

// Import the routers
const downloadRouter = require('./routes/yt-mp4');
const downloadmp3Router = require('./routes/yt-mp3');
const videoDetailsRoute = require('./routes/videoDetailsRoute');
const fbDownloaderRouter = require('./routes/fb-videoDownload');

console.log('fbDownloaderRouter:', fbDownloaderRouter);

// Use the routers for specific routes
app.use('/download', downloadRouter);
app.use('/downloadmp3', downloadmp3Router);
app.use('/fbDownloader', fbDownloaderRouter);
app.use('/videoDetails', videoDetailsRoute);

const publicAudiosFolder = path.join(__dirname, 'public', 'audios');

// Serve static files
app.use('/getvideo', express.static('public/videos'));
app.use('/getaudio', express.static('public/audios'));


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});


