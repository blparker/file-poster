
var fs = require('fs'),
    uuid = require('node-uuid'),
    util = require('util'),
    url = require('url'),
    async = require('async'),
    http = require('http');

function _encodeMultipart(filename, data, fields) {
    
    var BOUNDARY = '----------' + uuid.v4().replace(/\-/g, '').substring(0, 13);
    var CRLF = '\r\n';

    var postData = [];

    for(var key in fields) {
        var value = fields[key];

        postData.push(new Buffer('--' + BOUNDARY + CRLF));
        postData.push(new Buffer(util.format('Content-Disposition: form-data; name="%s"' + CRLF, key)));
        postData.push(new Buffer('' + CRLF));
        postData.push(new Buffer(value + CRLF));
    }

    var ret = [
        '--' + BOUNDARY + CRLF,
        util.format('Content-Disposition: form-data; name="%s"; filename="%s"' + CRLF, filename, filename),
        'Content-Type: image/jpeg' + CRLF + CRLF
    ].join('');

    /*postData.push(new Buffer('--' + BOUNDARY + CRLF));
    postData.push(new Buffer(util.format('Content-Disposition: form-data; name="%s"; filename="%s"' + CRLF, filename, filename)));
    postData.push(new Buffer('Content-Type: image/jpeg' + CRLF));
    postData.push(new Buffer('' + CRLF));
    postData.push(new Buffer(data + CRLF, 'utf8'));*/
    postData.push(new Buffer(ret, 'ascii'));
    postData.push(new Buffer(data, 'utf8'));

    postData.push(new Buffer(CRLF + '--' + BOUNDARY + '--'));
    //postData.push(new Buffer('' + CRLF));

    //var body = postData.join(CRLF);
    var contentType = util.format('multipart/form-data; boundary=%s', BOUNDARY);
    return { type : contentType, body : postData };
}

function _doRequest(filename, options, data, fields, callback) {
    
    var encoded = _encodeMultipart(filename, data, fields);
    var contentType = encoded.type;
    var body = encoded.body;

    var len = 0;

    for(var i = 0; i < body.length; i++) {
        len += body[i].length;
    }

    options['headers'] = {
        'Content-Type' : contentType,
        'Content-Length' : len
    };

    var request = http.request(options, function(res) {
        res.body = '';
        res.setEncoding('utf8');

        res.on('data', function(chunk) {
            res.body += chunk;
        });

        res.on('end', function() {
            return callback(null, res);
        });
    });

    request.on('error', function(err) {
        return callback(err, null);
    });

    for(var i = 0; i < body.length; i++) {
        request.write(body[i]);
    }
    //request.write(body);
    
    request.end();
}

function _doPost(filename, options, fields, callback) {

    async.waterfall([
        function(cb) {
            fs.readFile(filename, function(err, data) {
                if(err) return callback(err);

                cb(null, data);
            });
        },
        function(data, cb) {
            _doRequest(filename, options, data, fields, cb);
        }
    ],
    function(err, res) {
        return callback(err, res);
    });
}

function postFile(file, options, fields, callback) {
    
    if(!(options instanceof Array)) {
        options = url.parse(options);
        options['method'] = 'POST';
    }

    if(typeof fields === 'function') {
        callback = fields;
        fields = null;
    }

    _doPost(file, options, fields, callback);
}

module.exports = postFile;

