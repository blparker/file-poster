# file-poster

## Purpose
A simple node.js module to post a file to remote resource simulating a multipart form.

## Installation
You can install file-poster via `npm`:

    npm install file-poster

Or manually:

    git clone git://github.com/blparker/file-poster.git file-poster

## Example
Client usage:

    var postFile = require('file-poster'),
        url = require('url'),
        assert = require('assert');

    var options = url.parse('http://localhost:8080/upload');
    options['method'] = 'POST';

    postFile(__dirname + '/kitten.jpg', options, function(err, res) {
        assert.equal(res.statusCode, 200);
        assert.equal(err, null);
    });

Example server (note, this server is using [felixge's](https://github.com/felixge) [node-formidable](https://github.com/felixge/node-formidable) library):

    var http = require('http'),
        formidable = require('formidable'),
        path = require('path');

    var server = http.createServer();

    server.on('request', function(req, res) {
        if(req.method.toLowerCase() === 'post') {
            var form = new formidable.IncomingForm(),
                fields = [],
                files = [];

            form
                .on('fileBegin', function(name, file) {
                    file.path = __dirname + '/test' + path.extname(file.name);
                })
                .on('field', function(field, value) {
                    fields.push([ field, value ]);
                })
                .on('file', function(field, file) {
                    files.push([ field, file ]);
                })
                .on('end', function() {
                    res.end();
                });

            form.parse(req);
        }
        else {
            res.end();
        }
    });

    server.listen(8080);

## Usage

    postFile(filePath, requestOptions, callback)

  - `filePath` - A string representing the path to a file on disc
  - `requestOptions` - A string **or** array representing either the URL, or HTTP request options for a request
  - `callback` - A function that is invoked after completion. The callback function accepts to parameters:
    - `err` - Represents the error returned (if an error occurred). Otherwise, null
    - `response` - The HTTP response returned from the request