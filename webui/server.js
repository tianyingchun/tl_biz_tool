var connect = require('connect');
var http = require('http');
var serveStatic = require('serve-static');

var port = 2000;
var app = connect();
app.use(serveStatic(__dirname));
// create basic http local node web server.
http.createServer(app).listen(port, function() {
	console.log('biz tool webui server listening on port ' + port);
});