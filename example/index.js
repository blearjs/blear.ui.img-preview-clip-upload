/**
 * 文件描述
 * @author ydr.me
 * @create 2016-06-27 17:34
 */


'use strict';

var ImgPreviewClipUpload = require('../src/index');

var uploadEl = document.getElementById('upload');
var ipcu = window.ipcu = new ImgPreviewClipUpload();

uploadEl.onclick = function () {
    ipcu.open();
};

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
