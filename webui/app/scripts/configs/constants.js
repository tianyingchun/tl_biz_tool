//This configures the routes and associates each route with a view and a controller
app.factory("remoteApi", ["$location", "$log", function($location, $log) {

    // common remote api resource definitions.
    var commonResource = {
        //noting now
    };

    // envionment resource definitions here.
    var env = {
        // we can specificed api baseurl here, if not use current web server root path.
        apiBaseUrl: "http://localhost:3000"
    };
    var protocol = $location.protocol(),
        currHost = $location.host(), // $location.port();
        port = $location.port(),
        _baseUrl = protocol + "://" + (port ? (currHost + ":" + port) : currHost);

    var result = angular.extend({}, commonResource, {
        apiBaseUrl: env.apiBaseUrl || _baseUrl
    });
    $log.debug(result);

    return result;
}]);

// agreements definitions.
app.constant("cacheKeysDefinition", {
    cacheFactoryKeys: {
        "common": "COMMON_INFO" //other cachek item factory
    },
    cacheKeys: {
        "config": "SYSTEM_CONFIG"
    }
});

// all available regex rules.
app.constant("regexRules", {
    "postcode": /^[1-9][0-9]{5}$/, //邮政编码
    "idcard": /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, //身份证号码验证表达式
    "chCode": /[^\u4e00-\u9fa5\s+]/ig, //所有字符必须为中文字符
    "enCode": /^[a-zA-Z\s]+$/, // 所有的英文字符
    "mobile": /^1[0-9][0-9]\d{8}$/, //验证手机号码/^1[3|4|5|8][0-9]\d{4,8}$/
    "empty": /^\s+|\s+$/ig, // 移除字符串空字符串
    "url": /^https?:\/\//
});

app.constant("statusEnum", {
    "PROCESSING": "处理中",
    "PROCESS_SUCCESS": "处理成功",
    "PROCESS_FAILED": "处理失败"
});

app.constant("configPath", {
    "server": "./tl_biz_tool/server_config.json",
    "client": "./tl_biz_tool/module_config.json"
});

app.constant('appModules', {
    modules: [{
        title: "配置管理",
        value: "config"
    }, {
        title: "产品管理",
        value: "product"
    }, {
        title: "图片管理",
        value: "picture"
    }]
})

app.constant("navigationConfig", {
    categories: [{
        name: "产品管理",
        path: "product-manage",
        subCategories: [{
            name: "自动上传产品",
            path: "auto-upload"
        }, {
            name: "图片抓取管理",
            path: "image-spider"
        }, {
            name: "图片上传模块",
            path: "image-upload"
        }]
    }, {
        name: "系统配置管理",
        subCategories: []
    }, {
        name: "模块功能配置",
        subCategories: [{
            name: "客户端配置",
            path: "client-config"
        }, {
            name: "服务端配置",
            path: "server-config"
        }]
    }]
})
