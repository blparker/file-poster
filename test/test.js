
var postFile = require('../'),
	url = require('url'),
	assert = require('assert');

var options = url.parse('http://localhost:8080/upload');
options['method'] = 'POST';

postFile(__dirname + '/kitten.jpg', options, function(err, res) {
	assert.equal(res.statusCode, 200);
	assert.equal(err, null);
});

