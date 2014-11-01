var _ = require("underscore");

// site configuration.
var config = {
    appName: "tl_biz_tool_server",
    defaultDataProvider: "sqlserver"
};
// web server configuration
var serverCfg = {
    local: {
        mode: "local",
        port: 3000,
        nginxPort: "",
        virtualDir: "",
        sqlserver: {
            username: "sa",
            password: "19861121.lr",
            server: "TERENCE-PC\\SQLEXPRESSS", //You can use 'localhost\\instance' to connect to named instance
            database: "Nop28"
        }
    },
    production: {
        mode: "production",
        port: 4000,
        nginxPort: "",
        virtualDir: "",
        sqlserver: {
            username: "sa",
            password: "19861121.lr",
            server: "TERENCE-PC\\SQLEXPRESSS", //You can use 'localhost\\instance' to connect to named instance
            database: "Nop28"
        }
    }
};
// exports site configuration.
module.exports = function(mode) {
    var env = 'local';
    var use = serverCfg[mode || process.argv[2] || env] || serverCfg[env];
    return _.extend(use, config);
};
