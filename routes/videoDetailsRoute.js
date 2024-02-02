// Inside videoDetailsRoute.js
const express = require('express');
const router = express.Router();
const ytdl = require('ytdl-core');

router.get('/', async (req, res) => {
    const { videoURL } = req.query;
    try {
        if (!ytdl.validateURL(videoURL)) {
            return res.status(400).send({ error: 'Invalid YouTube URL' });
        }
        
        // Get video information from YouTube
        const info = await ytdl.getInfo(videoURL);


        // Define the desired resolutions
        const desiredResolutions = ['144p', '240p', '360p', '480p', '720p', '1080p'];

        // Function to get the closest format to the desired resolution
        const getClosestFormat = (formats, desiredResolution) => {
            return formats
                .filter(format => 
                    format.hasVideo && 
                    format.hasAudio && 
                    format.container === 'mp4' && 
                    format.qualityLabel.includes(desiredResolution))
                .sort((a, b) => {
                    const qualityA = parseInt(a.qualityLabel);
                    const qualityB = parseInt(b.qualityLabel);
                    return qualityA - qualityB;
                })
                .shift();
        };

        // Filter formats to include closest formats to desired resolutions
        const availableFormats = desiredResolutions.map(desiredResolution => {
            return getClosestFormat(info.formats, desiredResolution);
        }).filter(format => format !== undefined);

        // Log the available formats to debug
        console.log('Filtered availableFormats:', availableFormats);

        // Create video details object to send as a response
        const videoDetails = {
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails[0].url,
            duration: info.videoDetails.lengthSeconds,
            availableFormats: availableFormats
        };
        res.json(videoDetails);
    } catch (error) {
        console.error('Error in videoDetails route:', error);
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;

