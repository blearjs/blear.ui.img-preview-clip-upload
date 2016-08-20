/**
 * 文件描述
 * @author ydr.me
 * @create 2016-06-27 17:34
 */


'use strict';

var ImgPreviewClipUpload = require('../src/index');

var uploadEl = document.getElementById('upload');
var ipcu = new ImgPreviewClipUpload();

uploadEl.onclick = function () {
    ipcu.open();
};


