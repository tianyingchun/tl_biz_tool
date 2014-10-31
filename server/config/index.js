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
        port: 10001,
        nginxPort: "",
        virtualDir: "",
        sqlserver: {
            username: "",
            password: "",
            server: "10.211.55.4\SQLEXPRESS", //You can use 'localhost\\instance' to connect to named instance
            database: ""
        }
    },
    production: {
        mode: "production",
        port: 8084,
        nginxPort: "",
        virtualDir: "",
        sqlserver: {
            username: "",
            password: "",
            server: "", //You can use 'localhost\\instance' to connect to named instance
            database: ""
        }
    }
};
// exports site configuration.
module.exports = function(mode) {
    var env = 'local';
    var use = serverCfg[mode || process.argv[2] || env] || serverCfg[env];
    return _.extend(use, config);
};
