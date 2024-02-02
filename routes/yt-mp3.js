

const express = require('express');
const router = express.Router();
const ytdl = require('ytdl-core');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');

router.get('/', async (req, res) => {
    const videoURL = decodeURIComponent(req.query.videoURL);
    const audioQuality = req.query.audioQuality;

    try {
        if (!ytdl.validateURL(videoURL)) {
            throw new Error('Invalid YouTube URL');
        }

        const info = await ytdl.getInfo(videoURL);
        const sanitizedTitle = sanitizeTitle(info.videoDetails.title);
        const audioStream = ytdl(videoURL, { quality: 'highestaudio' });

        let conversionStarted = false;
        ffmpeg(audioStream)
            .setFfmpegPath(ffmpegInstaller.path)
            .audioBitrate(audioQuality)
            .toFormat('mp3')
            .on('error', error => {
                console.error('Error converting audio:', error);
                if (!conversionStarted) {
                    res.status(500).json({ error: 'Error converting audio' });
                }
            })
            .on('start', () => {
                conversionStarted = true;
                res.setHeader('Content-Type', 'audio/mpeg');
                res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.mp3"`);
            })
            .pipe(res, { end: true });

    } catch (error) {
        if (!res.headersSent) {
            console.error('Error fetching YouTube Audio:', error);
            res.status(500).json({ error: 'Error fetching YouTube Audio' });
        }
    }
});
function sanitizeTitle(title) {
    return title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
}

module.exports = router;
