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
        virtualDir: ""
    },
    production: {
        mode: "production",
        port: 4000,
        nginxPort: "",  
        virtualDir: ""
    }
};
// exports site configuration.
module.exports = function(mode) {
    var env = 'local';
    var use = serverCfg[mode || process.argv[2] || env] || serverCfg[env];
    return _.extend(use, config);
};
