/**
 * blear.ui.img-preview-clip-upload
 * @author ydr.me
 * @create 2016年06月04日14:09:36
 */

'use strict';


var Dialog = require('blear.ui.dialog');
var ImgPreview = require('blear.ui.img-preview');
var ImgClip = require('blear.ui.img-clip');
var object = require('blear.utils.object');
var canvasImg = require('blear.utils.canvas-img');
var canvasContent = require('blear.utils.canvas-content');
var event = require('blear.core.event');
var selector = require('blear.core.selector');
var attribute = require('blear.core.attribute');
var modification = require('blear.core.modification');
var layout = require('blear.core.layout');

var template = require('./template.html');
require('./style.css', 'css|style');

var tempCanvasEl = modification.create('canvas', {
    style: {
        display: 'none'
    }
});
var supportClientClip = canvasContent.supportToBlob;
var namespace = 'blearui-imgPreviewClipUpload';
var windowHeight = layout.height(window);
var extraHeight = 150;
var defaults = {
    dialog: {
        title: '裁剪图片并上传',
        width: 800
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
        maxWidth: 800,

        /**
         * 预览的最大高度，会自动计算取最小值
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
        minSelectionSize: 10,

        /**
         * 期望宽度
         */
        expectWidth: 800,

        /**
         * 期望高度
         */
        expectHeight: 0
    },
    name: 'file',
    // 必须是清晰的约束条件
    // @link http://frontenddev.org/article/under-the-chrome-input-file-accept-constraints-lead-to-pop-up-response-is-slow.html
    accept: 'image/png,image/jpg,image/jpeg,image/bmp',

    /**
     * 图片扩展名，使用英文逗号分隔开
     * @type String
     */
    extension: '.png,.jpg,.jpeg,.bmp',

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
    onUpload: function (fileInputEl, blob, done) {
        done(new Error('未配置 BLOB 上传'));
    }
};
var ImgPreviewClipUpload = Dialog.extend({
    className: 'ImgPreviewClipUpload',
    constructor: function (options) {
        var the = this;

        options = the[_options] = object.assign(true, {}, defaults, options);
        ImgPreviewClipUpload.parent(the, options.dialog);
        the[_initNode]();
        the[_initEvent]();
    },

    /**
     * 开始
     * @returns {ImgPreviewClipUpload}
     */
    start: function () {
        var the = this;
        var options = the[_options];
        var inputFileEl = the[_createInputFileEl]();

        inputFileEl.onchange = function () {
            var value = inputFileEl.value;

            if (!value) {
                return;
            }

            the.emit('beforeUpload', inputFileEl);
        };
        event.emit(inputFileEl, event.create('click', MouseEvent));
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

        ImgPreviewClipUpload.invoke('destroy', the);
    }
});
var sole = ImgPreviewClipUpload.sole;
var _options = sole();
var _initNode = sole();
var _initEvent = sole();
var _operatorEl = sole();
var _containerEl = sole();
var _footerEl = sole();
var _resetButtonEl = sole();
var _sureButtonEl = sole();
var _rotateButtonEl = sole();
var _inputFileEl = sole();
var _imgEl = sole();
var _imgPreview = sole();
var _imgClip = sole();
var _changeButtonMode = sole();
var _createInputFileEl = sole();
var proto = ImgPreviewClipUpload.prototype;

// 初始化节点
proto[_initNode] = function () {
    var the = this;
    var options = the[_options];
    var previewOptions = options.preview;
    var node = the[_operatorEl] = modification.parse(template);
    var buttons = selector.query('.' + namespace + '-button', node);

    ImgPreviewClipUpload.invoke('setHTML', the, node);
    the[_containerEl] = selector.query('.' + namespace + '-container', node)[0];
    the[_footerEl] = selector.query('.' + namespace + '-footer', node)[0];
    the[_resetButtonEl] = buttons[0];
    the[_sureButtonEl] = buttons[1];
    the[_rotateButtonEl] = buttons[2];
    previewOptions.el = the[_containerEl];
    previewOptions.maxHeight = Math.min(previewOptions.maxHeight, windowHeight - extraHeight);
    the[_imgPreview] = new ImgPreview(previewOptions);
};

// 初始化事件
proto[_initEvent] = function () {
    var the = this;
    var options = the[_options];
    var clipOptions = options.clip;

    the.on('beforeUpload', function (inputFileEl) {
        the[_inputFileEl] = inputFileEl;

        // 上传之前预览
        the[_imgPreview].preview(inputFileEl, function (err, imgEl) {
            if (err) {
                return the.emit('error', err);
            }

            if (!the[_imgClip]) {
                modification.insert(imgEl, the[_containerEl]);
            }

            the[_imgEl] = imgEl;
            the.open(function () {
                if (the[_imgClip]) {
                    the[_imgClip].changeImage(imgEl.src);
                } else {
                    clipOptions.el = imgEl;
                    the[_imgClip] = new ImgClip(clipOptions);

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
        });
    });

    the[_imgPreview].on('beforeUpload', function () {
        the.emit('beforePreviewUpload');
    });

    the[_imgPreview].on('afterUpload', function () {
        the.emit('afterPreviewUpload');
    });

    the[_imgPreview].on('beforeLoading', function () {
        the.emit('beforePreviewLoading');
    });

    the[_imgPreview].on('afterLoading', function () {
        the.emit('afterPreviewLoading');
    });

    the.on('afterClose', function () {
        if (the[_imgClip]) {
            the[_imgClip].reset();
        }
    });

    event.on(the[_resetButtonEl], 'click', function () {
        the.close();
        the.start();
    });

    event.on(the[_sureButtonEl], 'click', function () {
        var sel = the[_imgClip].getSelection();
        var clipOptions = sel;
        var context = tempCanvasEl.getContext('2d');

        tempCanvasEl.width = sel.actualWidth;
        tempCanvasEl.height = sel.actualHeight;
        context.save();
        context.translate(sel.drawX, sel.drawY);
        context.rotate(sel.drawRadian);
        canvasImg.draw(tempCanvasEl, the[_imgPreview].getImageEl(), clipOptions);
        context.restore();
        canvasContent.toBlob(tempCanvasEl, {
            type: options.drawType,
            quality: options.drawQuality
        }, function (blob) {
            the.emit('beforeBlobUpload');
            options.onUpload.call(the, the[_inputFileEl], blob, function (err, url) {
                the.emit('afterBlobUpload');

                if (err) {
                    return the.emit('error', err);
                }

                the.emit('success', url);
                the.close();
            });
        });
    });

    event.on(the[_rotateButtonEl], 'click', function () {
        the[_imgPreview].rotate(90);
        the[_imgClip].changeImage(
            the[_imgPreview].getImageEl().src,
            the[_imgPreview].getRotation()
        );
        the.resize();
    });
};

// 切换按钮模式
proto[_changeButtonMode] = function (canUpload) {
    var the = this;

    if (canUpload) {
        attribute.show(the[_sureButtonEl]);
    } else {
        attribute.hide(the[_sureButtonEl]);
    }
};

proto[_createInputFileEl] = function () {
    var the = this;
    var options = the[_options];
    var properties = {
        name: options.name,
        accept: options.accept,
        multiple: false,
        type: 'file',
        tabIndex: -1,
        style: {
            display: 'none'
        }
    };
    var inputFileEl = modification.create('input', properties);
    modification.insert(inputFileEl);
    return inputFileEl;
};

ImgPreviewClipUpload.supportClientClip = supportClientClip;
ImgPreviewClipUpload.defaults = defaults;
module.exports = ImgPreviewClipUpload;
