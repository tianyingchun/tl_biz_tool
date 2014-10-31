var connect = require('connect');
var port = 2000;
connect.createServer(
    connect.static(__dirname)
).listen(port);
