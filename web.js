var express = require('express');
var app = express();
var path = require('path');

app.use(express.static('public'));

var http = require('http');
var fs = require('fs');
var url = require('url');


var app = http.createServer(function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    if (pathname === '/') {
        fs.readFile('index.html', 'utf8', function(err, content) {
            if (err) {
                response.writeHead(500); // Internal Server Error
                response.end('Internal Server Error');
            } else {
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(content);
            }
        });
    }});

app.listen(3000);
