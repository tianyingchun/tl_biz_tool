var connect = require('connect');
var port = 10000;
connect.createServer(
    connect.static(__dirname)
).listen(port);
