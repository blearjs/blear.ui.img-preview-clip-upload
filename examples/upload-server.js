/**
 * 文件描述
 * @author ydr.me
 * @create 2018-06-21 15:24
 * @update 2018-06-21 15:24
 */


'use strict';

var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var formidable = require('formidable');

var dirname = __dirname;

http.createServer(function (req, res) {
    var u = url.parse(req.url, true);

    console.log(req.method, req.url);
    res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
    res.setHeader('Access-Control-Allow-Method', 'POST');

    if (req.headers.origin) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    }

    switch (u.pathname) {
        case '/':
            switch (req.method) {
                case 'POST':
                    var form = new formidable.IncomingForm();

                    form.parse(req, function (err, fields, files) {
                        var file = files.file;
                        var fileName = Date.now().toString();
                        var filePath = '/file-' + fileName + path.extname(file.name);
                        var writePath = path.join(dirname, filePath);
                        var rs = fs.createReadStream(file.path);
                        var ws = fs.createWriteStream(writePath);

                        rs.pipe(ws);
                        res.setHeader('content-type', 'application/json; charset=utf8');
                        res.end(JSON.stringify({
                            url: 'http://localhost:5678' + filePath
                        }));
                    });
                    break;

                default:
                    res.end('ERROR');
                    break;
            }
            break;

        default:
            var file2 = path.join(dirname, u.pathname);
            fs.createReadStream(file2).on('error', function (err) {
                res.end(err.message);
            }).pipe(res);
            break;
    }
}).listen(5678);


