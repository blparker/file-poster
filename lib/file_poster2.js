
var fs = require('fs'),
    uuid = require('node-uuid'),
    util = require('util'),
    url = require('url'),
    async = require('async'),
    http = require('http');

function _encodeMultipart(filename, data, fields) {
    
    var BOUNDARY = '---------------------------' + uuid.v4().replace(/\-/g, '').substring(0, 13);
    var CRLF = '\r\n';

    var postData = [];

    for(var key in fields) {
        var value = fields[key];

        postData.push(new Buffer('--' + BOUNDARY));
        postData.push(new Buffer(util.format('Content-Disposition: form-data; name="%s"', key)));
        postData.push(new Buffer(''));
        postData.push(new Buffer(value));
    }

    postData.push(new Buffer('--' + BOUNDARY));
    postData.push(new Buffer(util.format('Content-Disposition: form-data; name="%s"; filename="%s"', filename, filename)));
    postData.push(new Buffer('Content-Type: image/jpeg'));
    postData.push(new Buffer(''));
    postData.push(new Buffer(data, 'utf8'));

    postData.push(new Buffer('--' + BOUNDARY + '--'));
    postData.push(new Buffer(''));

    var body = postData.join(CRLF);
    var contentType = util.format('multipart/form-data; boundary=%s', BOUNDARY);
    return { type : contentType, body : body };
}

function _doRequest(filename, options, data, fields, callback) {
    
    var encoded = _encodeMultipart(filename, data, fields);
    var contentType = encoded.type;
    var body = encoded.body;

    options['headers'] = {
        'Content-Type' : contentType,
        'Content-Length' : body.length
    };

    console.log("### OPTIONS = ", options);

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

    /*for(var i = 0; i < params.data.length; i++) {
        console.log(params.data[i].toString());
        request.write(params.data[i]);
    }*/
    console.log(body);
    request.write(body);
    
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

