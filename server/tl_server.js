var express = require('express');
//最下面
var https = require('http');
var fs = require("fs");

var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cons = require('consolidate');

var config = require("./config")();
var route = require("./config/route");
var debug = require('debug')(config.appName);

// sql server connection.
var sql = require('mssql');


var app = express();

// debug version.
app.set("env", config.mode);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// assign the swig engine to .html files
app.engine('html', cons.swig);
// set .html as the default extension 
app.set('view engine', 'html');
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

express.static.mime.define({
    'text/xml': ['plist']
});
// the default is "/" capture the static dir as all static resource root.
app.use("/static", express.static(path.join(__dirname, 'public')));
sql.connect(config.sqlserver, function(err) {
    // initialize application route config.
    route.init(app);
    https.createServer(app).listen(config.port, function() {
        debug(
            'Sql server connection successfully! Express server listening on port ' + config.port
        );
    });
});


// command line $>> npm start
module.exports = app;
