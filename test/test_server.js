
var http = require('http'),
    formidable = require('formidable'),
    path = require('path');

var server = http.createServer();

server.on('request', function(req, res) {

    if(req.method.toLowerCase() === 'post') {
        var form = new formidable.IncomingForm();
        var fields = [],
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
                console.log(fields);
                res.end();
            });

        form.parse(req);
    }
    else {
        res.end();
    }
});

server.listen(8888);

