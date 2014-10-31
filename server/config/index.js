var _ = require("underscore");

// site configuration.
var config = {
    appName: "zl_biz_tool_server",
    defaultDataProvider: "sqlserver"
};
// web server configuration
var serverCfg = {
    local: {
        mode: "local",
        sqlConn:"http://192.168.12.40:8080/app/", // remove push message
        port: 10001,
        nginxPort:"",
        virtualDir: "",
        mongo: {
            //host: "192.168.12.40",
            host: '127.0.0.1',
            port: 27017
        }
    },
    production: {
        mode: "production",
        sqlConn:"http://113.106.74.149:8081/app/", // remove push message
        port: 8084,
        nginxPort: "",
        virtualDir: "",
        mongo: {
            host: "127.0.0.1",
            port: 27017
        }
    }
};
// exports site configuration.
module.exports = function(mode) {
    var env = 'local';
    var use = serverCfg[mode || process.argv[2] || env] || serverCfg[env];
    return _.extend(use, config);
};
