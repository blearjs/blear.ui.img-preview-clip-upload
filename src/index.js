/**
 * blear.ui.img-preview-clip-upload
 * @author ydr.me
 * @create 2016年06月04日14:09:36
 */

'use strict';


var Upload = require('blear.ui.upload');
var ImgPreview = require('blear.ui.img-preview');
var ImgClip = require('blear.ui.img-clip');
var object = require('blear.utils.object');
var canvasImg = require('blear.utils.canvas-img');
var canvasContent = require('blear.utils.canvas-content');
var event = require('blear.core.event');
var selector = require('blear.core.selector');
var attribute = require('blear.core.attribute');
var modification = require('blear.core.modification');

var template = require('./template.html');
require('./style.css', 'css|style');

var tempCanvasEl = modification.create('canvas', {
    style: {
        display: 'none'
    }
});
var namespace = 'blearui-imgPreviewClipUpload';
var defaults = {
    dialog: {
        title: '裁剪图片并上传',
        width: 1000
    },
    preview: {
        /**
         * 预览的宽度
         * @type String|Number
         */
        width: 'auto',

        /**
         * 预览的高度
         * @type String|Number
         */
        height: 'auto',

        /**
         * 预览的最小宽度
         * @type String|Number
         */
        minWidth: 800,

        /**
         * 预览的最小高度
         * @type String|Number
         */
        minHeight: 'auto',

        /**
         * 预览的最大宽度
         * @type String|Number
         */
        maxWidth: 1000,

        /**
         * 预览的最大高度
         * @type String|Number
         */
        maxHeight: 800
    },
    clip: {
        /**
         * 是否自动最大居中选区
         */
        auto: true,

        /**
         * 裁剪比例
         */
        ratio: 1,

        /**
         * 裁剪最小宽度
         */
        minWidth: 100,

        /**
         * 裁剪最小高度
         */
        minHeight: 100,

        /**
         * 裁剪最大宽度
         */
        maxWidth: 0,

        /**
         * 裁剪最大高度
         */
        maxHeight: 0,

        /**
         * 开始选区的最小值
         */
        minSelectionSize: 10
    },
    tips: '点击选择文件并上传',
    name: 'file',
    // 必须是清晰的约束条件
    // @link http://frontenddev.org/article/under-the-chrome-input-file-accept-constraints-lead-to-pop-up-response-is-slow.html
    accept: 'image/png,image/jpg,image/jpeg,image/bmp',

    /**
     * 图片扩展名，使用英文逗号分隔开
     * @type String
     */
    extension: '.png,.jpg,.jpeg,.bmp',

    multiple: false,

    /**
     * 绘制的宽度
     * @type Number
     */
    drawWdith: 100,

    /**
     * 绘制的高度
     * @type Number
     */
    drawHeight: 100,

    /**
     * 绘制的图片质量
     * @type Number
     */
    drawQuality: 0.8,

    /**
     * 绘制的图片类型
     * @type String
     */
    drawType: 'image/jpeg',
    onUpload: function (fileInputEl, done) {
        done(new Error('未配置上传'));
    },
    onBlobUpload: function (fileInputEl, blob, done) {
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
        the[_initNode]();
        the[_initEvent]();
        the[_changeMode](false);
    },


    /**
     * 重置
     * @returns {ImgPreviewClipUpload}
     */
    reset: function () {
        var the = this;

        the[_changeMode](false);
        the.resize();

        return the;
    },


    /**
     * 销毁实例
     */
    destroy: function () {
        var the = this;

        event.un(the[_resetButtonEl], 'click');
        event.un(the[_sureButtonEl], 'click');

        modification.remove(the[_operatorEl]);
        the[_imgPreview].destroy();
        the[_imgPreview] = null;

        if (the[_imgClip]) {
            the[_imgClip].destroy();
            the[_imgClip] = null;
        }

        ImgPreviewClipUpload.superInvoke('destroy', the);
    }
});
var _options = ImgPreviewClipUpload.sole();
var _initNode = ImgPreviewClipUpload.sole();
var _initEvent = ImgPreviewClipUpload.sole();
var _uploadEl = ImgPreviewClipUpload.sole();
var _operatorEl = ImgPreviewClipUpload.sole();
var _containerEl = ImgPreviewClipUpload.sole();
var _footerEl = ImgPreviewClipUpload.sole();
var _resetButtonEl = ImgPreviewClipUpload.sole();
var _sureButtonEl = ImgPreviewClipUpload.sole();
var _inputFileEl = ImgPreviewClipUpload.sole();
var _imgEl = ImgPreviewClipUpload.sole();
var _imgPreview = ImgPreviewClipUpload.sole();
var _imgClip = ImgPreviewClipUpload.sole();
var _changeMode = ImgPreviewClipUpload.sole();
var _changeButtonMode = ImgPreviewClipUpload.sole();
var pro = ImgPreviewClipUpload.prototype;

// 初始化节点
pro[_initNode] = function () {
    var the = this;
    var options = the[_options];
    var previewOptions = options.preview;
    var node = the[_operatorEl] = modification.parse(template);
    var buttons = selector.query('.' + namespace + '-button', node);

    the[_uploadEl] = the.getContentEl();
    the[_containerEl] = selector.query('.' + namespace + '-container', node)[0];
    the[_footerEl] = selector.query('.' + namespace + '-footer', node)[0];
    the[_resetButtonEl] = buttons[0];
    the[_sureButtonEl] = buttons[1];
    modification.insert(node, the[_uploadEl], 'afterend');
    the[_imgPreview] = new ImgPreview({
        el: the[_containerEl],
        width: previewOptions.width,
        height: previewOptions.height,
        minWidth: previewOptions.minWidth,
        minHeight: previewOptions.minHeight,
        maxWidth: previewOptions.maxWidth,
        maxHeight: previewOptions.maxHeight,
        onUpload: function (fileInputEl, done) {
            options.onUpload.call(this, fileInputEl, function(err, url){
                ImgPreviewClipUpload.superInvoke('reset', the);
                done(err, url);
            });
        }
    });
};

// 初始化事件
pro[_initEvent] = function () {
    var the = this;
    var options = the[_options];
    var clipOptions = options.clip;

    the.on('beforeUpload', function (inputFileEl) {
        the[_inputFileEl] = inputFileEl;

        // 切换为操作模式
        the[_changeMode](true);

        // 上传之前预览
        the[_imgPreview].preview(inputFileEl, function (err, img) {
            if (err) {
                the.reset();
                return the.emit('error', err);
            }

            the.resize();

            // 预览之后裁剪
            if (the[_imgClip]) {
                the[_imgClip].changeImage(img.src);
            } else {
                the[_imgClip] = new ImgClip({
                    el: the[_imgEl] = the[_imgPreview].getImgEl(),
                    auto: clipOptions.auto,
                    ratio: clipOptions.ratio,
                    minWidth: clipOptions.minWidth,
                    minHeight: clipOptions.minHeight,
                    maxWidth: clipOptions.maxWidth,
                    maxHeight: clipOptions.maxHeight,
                    minSelectionSize: clipOptions.minSelectionSize
                });

                the[_imgClip].on('beforeSelection', function () {
                    the[_changeButtonMode](false);
                });

                the[_imgClip].on('cancelSelection', function () {
                    the[_changeButtonMode](false);
                });

                the[_imgClip].on('afterSelection', function () {
                    the[_changeButtonMode](true);
                });

                the[_imgClip].on('changeSelection', function () {
                    // the[_changeButtonMode](true);
                });
            }
        });

        // 不被动上传
        return false;
    });

    // the.on('afterUpload', function () {
    //
    // });
    //
    // the.on('success', function (url) {
    //
    // });

    the[_imgPreview].on('beforeUpload', function () {
        the.emit('beforePreviewUpload');
    });

    the[_imgPreview].on('afterUpload', function () {
        the.emit('beforePreviewUpload');
    });

    the[_imgPreview].on('beforeLoading', function () {
        the.emit('beforePreviewLoading');
    });

    the[_imgPreview].on('afterLoading', function () {
        the.emit('afterPreviewLoading');
    });

    event.on(the[_resetButtonEl], 'click', function () {
        the.reset();
    });

    event.on(the[_sureButtonEl], 'click', function () {
        the[_changeButtonMode](false);
        var sel = the[_imgClip].getSelection();
        var drawWdith = options.drawWdith || sel.srcWidth;
        var drawHeight = options.drawHeight || sel.srcHeight;
        tempCanvasEl.width = drawWdith;
        tempCanvasEl.height = drawHeight;
        canvasImg.draw(tempCanvasEl, the[_imgEl], {
            srcLeft: sel.srcLeft,
            srcTop: sel.srcTop,
            srcWidth: sel.srcWidth,
            srcHeight: sel.srcHeight,
            drawLeft: 0,
            drawTop: 0,
            drawWidth: drawWdith,
            drawHeight: drawHeight
        });
        canvasContent.toBlob(tempCanvasEl, {
            type: options.drawType,
            quality: options.drawQuality
        }, function (blob) {
            the.emit('beforeBlobUpload');
            options.onBlobUpload(the[_inputFileEl], blob, function (err, url) {
                the.emit('afterBlobUpload');
                ImgPreviewClipUpload.superInvoke('reset', the);

                if (err) {
                    return the.emit('error', err);
                }

                the.emit('success', url);
            });
        });
    });
};

// 切换模式
pro[_changeMode] = function (isOperating) {
    var the = this;

    if (isOperating) {
        attribute.hide(the[_uploadEl]);
        attribute.show(the[_operatorEl]);
    } else {
        attribute.show(the[_uploadEl]);
        attribute.hide(the[_operatorEl]);
    }
};


// 切换按钮模式
pro[_changeButtonMode] = function (canUpload) {
    var the = this;

    if (canUpload) {
        attribute.show(the[_sureButtonEl]);
    } else {
        attribute.hide(the[_sureButtonEl]);
    }
};

ImgPreviewClipUpload.defaults = defaults;
module.exports = ImgPreviewClipUpload;
