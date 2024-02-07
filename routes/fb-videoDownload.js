const express = require('express');
const router = express.Router();
const request = require('request');
const fs = require('fs');
// Function to get the download URL of the Facebook video
const getUrl = (url, callback) => {
    let options = {
        'method': 'POST',
        'url': 'https://www.getfvid.com/downloader',
        formData: {
            'url': url
        }
    };
    request(options, function (error, response) {
        if (error) {
            return callback(error, null);
        }
        let private = response.body.match(/Uh-Oh! This video might be private and not public/g);
        if (private) {
            return callback(new Error('This video is private'), null);
        }
        const regexNama = /<p class="card-text">(.*?)<\/p>/g;
        let arrNama = [...response.body.matchAll(regexNama)];
        let namaVideo = arrNama[0] != undefined ? arrNama[0][1] + ".mp4" : "noname.mp4";
        const rgx = /<a href="(.+?)" target="_blank" class="btn btn-download"(.+?)>(.+?)<\/a>/g;
        let arr = [...response.body.matchAll(rgx)];
        let resAkhir = arr.map(item => ({
            quality: item[3],
            url: item[1].replace(/amp;/gi, '')
        }));
        if (resAkhir.length > 0) {
            callback(null, { namaVideo, resAkhir });
        } else {
            callback(new Error('No download links found'), null);
        }
    });
};
// Endpoint to process Facebook video download
router.post('/', (req, res) => {
    const url = req.body.url;
    getUrl(url, (err, result) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.json(result);
    });
});


module.exports = router;
// to test on postman 
// http://localhost:3000/fbDownloader
// and in raw (Json) 
// {
//    "url": "https://fb.watch/pYu1AD9Ppb/"
// }