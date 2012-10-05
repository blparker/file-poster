# file-poster

## Purpose
A simple node.js module to post a file to remote resource simulating a multipart form.

## Download
You can install file-poster via `npm`:

    npm install file-poster

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

