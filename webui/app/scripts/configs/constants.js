//This configures the routes and associates each route with a view and a controller
app.factory("remoteApi", ["$location", "$log", function($location, $log) {

    // COMMON  RESOURCE DEFINITION.
    var commonResource = {
        clientId: "",
        appId: "T-100014" //T-100014" //花漾卡
    };

    // OTHER SPECIFIC ENVIONMENT RESOURCE DEFINITON.
    var ENVMapping = {
        "localhost": {
            apiBaseUrl: "http://114.80.86.110:11380/mtp-web", //"http://192.168.11.212:8080/mtp-web",//stg5://http://114.80.86.110:11380/mtp-web
            defaultMethod: 'POST' //will used for all http request while we invoke STAG envionment.

            // apiBaseUrl: "http://192.168.14.145:8081/tests",
            // defaultMethod: 'GET', //'GET', in my local /test/h5/xxxx.json we need use get request.
        },
        "production": {
            apiBaseUrl: "https://mobile.1qianbao.com/mtp-web",
            defaultMethod: 'POST'
        }
    }
    var currHost = $location.host(); // $location.port();
    $log.info("currHost: ", currHost);
    var result = {};
    switch (currHost) {
        case "localhost":
        case "192.168.14.145":
            angular.extend(result, commonResource, ENVMapping["localhost"]);
            break;
        default:
            angular.extend(result, commonResource, ENVMapping["production"]);
            break;
    }

    return result;
}]);
 
// agreements definitions.
app.constant("cacheKeysDefinition", {
    cacheFactoryKeys: {
        "common": "COMMON_INFO", //other cachek item factory
        "provinceCityArea": "PROVINCE_CITY_AREA" //省市区 CACHEKEY
    },
    cacheKeys: {
        "idcard": "ID_CARD_NUMBER", //身份证号码CACHEKEY,
        "basicInfo": "USER_BASIC_INFO", //用户基本信息的CACHEKEY.
        "address": "DELIVERY_ADDRESS_INFO", //地址信息
        "idcardOrg": "ID_CARD_ORG", // 身份证对应的发证机关
        "provinceCityArea": "PCR_SOURCE", // 省，市，区 数据源CACHEK KAY
        "inviterTel": "INVITER_TEL" //邀请人手机号码
    }
});

// dialog default configurations.
app.constant("dialogDefaultCfg", {
    title: "默认标题",
    body: "默认弹窗内容",
    buttons: [{
        txt: "确定",
        classes: "btn-primary",
        action: "confirm"
    }, {
        txt: "取消",
        classes: "btn-danger",
        action: "cancel"
    }],
    callbackFn: null
});
 
// all available regex rules.
app.constant("regexRules", {
    "postcode": /^[1-9][0-9]{5}$/, //邮政编码
    "idcard": /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, //身份证号码验证表达式
    "chCode": /[^\u4e00-\u9fa5\s+]/ig, //所有字符必须为中文字符
    "enCode": /^[a-zA-Z\s]+$/, // 所有的英文字符
    "mobile": /^1[0-9][0-9]\d{8}$/, //验证手机号码/^1[3|4|5|8][0-9]\d{4,8}$/
    "empty": /^\s+|\s+$/ig // 移除字符串空字符串
});
