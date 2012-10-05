
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

function _getParams(filename, type, data) {

	var boundary = Math.random(),
		postData = [];
	
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

function _doRequest (filename, options, data, callback) {
	
	var params = _getParams(filename, 'image/jpeg', data);

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
		request.write(params.data[i]);
	}
	
	request.end();
}

function _doPost (filename, options, callback) {
	
	async.waterfall([
		function(cb) {
			fs.readFile(filename, function(err, data) {
				if(err) return callback(err);

				cb(null, data);
			});
		},
		function(data, cb) {
			_doRequest(filename, options, data, cb);
		}
	],
	function(err, res) {
		return callback(err, res);
	});
}

function postFile(file, options, callback) {
	
	if(!(options instanceof Array)) {
		options = url.parse(options);
		options['method'] = 'POST';
	}

	_doPost(file, options, callback);
}

module.exports = postFile;

