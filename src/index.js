/**
 * blear.ui.img-preview-clip-upload
 * @author ydr.me
 * @create 2016年06月04日14:09:36
 */

'use strict';


var Upload = require('blear.ui.upload');
var object = require('blear.utils.object');

var template = require('./template.html');
require('./style.css');

var defaults = {
    dialog : {
        title: '裁剪图片并上传',
        width: 1000
    },
    tips: '点击选择文件并上传',
    name: 'file',
    accept: 'image/*',
    multiple: false,
    onUpload: function (fileInputEl, done) {
        done(new Error('未配置上传'));
    }
};
var ImgPreviewClipUpload = Upload.extend({
    className: 'ImgPreviewClipUpload',
    constructor: function (options) {
        var the = this;

        the[_options] = object.assign(true, {}, defaults, options);
        ImgPreviewClipUpload.parent(the, {
            dialog: the[_options].dialog,
            tips: the[_options].tips,
            name: the[_options].name,
            accept: the[_options].accept,
            multiple: the[_options].multiple,
            onUpload: the[_options].onUpload
        });
    }
});
var _options = ImgPreviewClipUpload.sole();

ImgPreviewClipUpload.defaults = defaults;
module.exports = ImgPreviewClipUpload;
