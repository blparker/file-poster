# file-poster

## Purpose
A simple node.js module to post a file to remote resource simulating a multipart form.

## Download
You can install file-poster via `npm`:

    npm install file-poster

## Example

    var postFile = require('file-poster'),
        url = require('url'),
        assert = require('assert');

    var options = url.parse('http://localhost:8080/upload');
    options['method'] = 'POST';

    postFile(__dirname + '/kitten.jpg', options, function(err, res) {
        assert.equal(res.statusCode, 200);
        assert.equal(err, null);
    });
