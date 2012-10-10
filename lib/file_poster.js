var url = require('url'),
    async = require('async'),
    fs = require('fs'),
    http = require('http');

function _encode(boundary, type, filename) {
    var ret = [];
    ret.push('--' + boundary + '\r\n');
    ret.push('Content-Disposition: form-data; name="'+ filename +'"; filename="'+ filename + '"\r\n');
    ret.push('Content-Type: ' + type + '\r\n\r\n');
    return ret.join('');
}

function _encodeFields(boundary, name, value) {
    var ret = [];
    ret.push('--' + boundary + '\r\n');
    ret.push('Content-Disposition: form-data; name="'+ name +'"\r\n\r\n');
    ret.push(value + '\r\n');
    return ret.join('');
}

function _getParams(filename, type, fields, data) {

    var boundary = Math.random(),
        postData = [];

    if(fields) {
        for(var key in fields) {
            var v = fields[key];
            postData.push(new Buffer(_encodeFields(boundary, key, v), 'ascii'));
        }
    }
    
    postData.push(new Buffer(_encode(boundary, type, filename), 'ascii'));
    postData.push(new Buffer(data, 'utf8'));
    postData.push(new Buffer('\r\n--' + boundary + '--'), 'ascii');

    var len = 0;

    for(var i = 0; i < postData.length; i++) {
        len += postData[i].length;
    }

    var params = {
        data : postData,
        headers : {
            'Content-Type' : 'multipart/form-data; boundary=' + boundary,
            'Content-Length' : len
        }
    };

    return params;
}

function _doRequest (filename, options, data, fields, callback) {
    
    var params = _getParams(filename, 'image/jpeg', fields, data);

    options['headers'] = params.headers;

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

    for(var i = 0; i < params.data.length; i++) {
        console.log(params.data[i].toString());
        request.write(params.data[i]);
    }
    
    request.end();
}

function _doPost (filename, options, fields, callback) {
    
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

