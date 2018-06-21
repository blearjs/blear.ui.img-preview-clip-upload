/**
 * 文件描述
 * @author ydr.me
 * @create 2016-06-27 17:34
 */


'use strict';

var ImgPreviewClipUpload = require('../src/index');
var upload = require('blear.core.upload');

var uploadEl = document.getElementById('upload');
var viewEl = document.getElementById('view');
var ipcu = window.ipcu = new ImgPreviewClipUpload({
    drawWdith: 500,
    drawHeight: 500,
    onUpload: function (el, blob, callback) {
        upload({
            url: 'http://localhost:5678',
            fileEl: el,
            blob: blob,
            onComplete: function (err, xhr) {
                if (err) {
                    return callback(err);
                }

                var json = JSON.parse(xhr.responseText);
                callback(null, json.url);
            }
        });
    }
});

uploadEl.onclick = function () {
    ipcu.start();
};

ipcu.on('error', function (err) {
    alert(err.message);
});

ipcu.on('success', function (url) {
    viewEl.innerHTML = '<img src="' + url + '">';
});

// var uploadBoxEl = document.getElementById('uploadBox');
// var inputFile = document.createElement('input');
// inputFile.setAttribute('type', 'file');
// inputFile.setAttribute('accept', 'image/*');
// uploadBoxEl.appendChild(inputFile);
//
// inputFile = document.createElement('input');
// inputFile.setAttribute('type', 'file');
// inputFile.setAttribute('accept', 'image/png,image/jpg,image/jpeg');
// uploadBoxEl.appendChild(inputFile);
//
// inputFile = document.createElement('input');
// inputFile.setAttribute('type', 'file');
// uploadBoxEl.appendChild(inputFile);
