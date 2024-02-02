
const express = require('express');
const router = express.Router();
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

function sanitizeTitle(title) {
    return title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
}

router.get('/', async (req, res) => {
    const videoURL = decodeURIComponent(req.query.videoURL);
    const {  itag } = req.query;
    try {
        if (!ytdl.validateURL(videoURL)) {
            throw new Error('Invalid YouTube URL');
        }
        const info = await ytdl.getInfo(videoURL);
        
        // Choose the format with the itag provided by the client
        const format = info.formats.find(f => f.itag == itag);
        if (!format) {
            throw new Error('Requested format not available.');
        }
        
        // Set headers if contentLength is available
        if (format.contentLength) {
            res.setHeader('Content-Length', format.contentLength);
        }

        res.setHeader('Content-Disposition', 'attachment; filename="' + sanitizeTitle(info.videoDetails.title) + '.mp4"');
        res.setHeader('Content-Type', 'video/mp4');
        
        // Stream the video
        const videoStream = ytdl(videoURL, { format });
        videoStream.pipe(res);
        
        videoStream.on('error', (error) => {
            console.error('Error while streaming video:', error.message);
            res.status(500).send({ error: 'An error occurred while streaming the video.' });
        });
        
    } catch (error) {
        console.error('Error while processing the request:', error.message);
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;