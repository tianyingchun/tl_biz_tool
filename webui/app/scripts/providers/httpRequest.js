app.factory("httpRequest", ['$log', '$http', '$q', 'utility', 'appConfig', 'remoteApi',

    function($log, $http, $q, utility, appConfig, remoteApi) {

        var apiBaseUrl = remoteApi.apiBaseUrl;
        var defaultMethod = remoteApi.defaultMethod; // local debug requird 'GET' live is 'POST'

        // common header, 
        var commonHeader = {
            "Authorization": "Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ=="
        };
        // default configurations. no need to use common header now.
        // angular.extend($http.defaults.headers.common, commonHeader);
        // $http.defaults.headers.post
        // $http.defaults.headers.get

        // get current api async request data object.
        function getRequestData(data) {
            // default request data
            var defaultRequestData = {
                appId: remoteApi.appId,
                clientId: remoteApi.clientId
            };
            return angular.extend(defaultRequestData, data);
        };

        // get current api request url full path string.
        function getRequestUrl(apiUrl) {
            return remoteApi.apiBaseUrl + apiUrl;
        };

        // for get request get params parameter
        function getSerializedUrl(url, requestData) {
            var oParam = {};
            requestData = angular.isArray(requestData) ? requestData : [requestData];
            for (var i = 0; i < requestData.length; i++) {
                var oCur = requestData[i];
                for (var p in oCur) {
                    oParam[p] = encodeURIComponent(oCur[p]);
                }
            }

            var newUrlParamStr = "";
            for (var i in oParam) {
                newUrlParamStr += i + "=" + oParam[i] + "&";
            }
            return url.split("?")[0] + "?" + newUrlParamStr.substring(0, newUrlParamStr.length - 1);
        };
        // Expose base http request constructor.
        return function BaseHttpRequest() {

            /**
             * the post request
             * @param  {string} url            [description]
             * @param  {object} requestData    {name:'sss',password:''}
             * @param  {function} dto            optonal
             * @param  {object} customizedData passed to dto
             * @param  {object} config    configJson {headers:{},xxxx}
             */
            this.postRequest = function(url, requestData, dto, customizedData, config) {
                // must be isntance it in each request.
                var defered = $q.defer();

                // request requestData.
                requestData = getRequestData(requestData) || {};

                var logKey = this.logAPIUniqueKey;

                $http.post(url, requestData, config).success(function(data, status, headers, config) {
                    // converted raw data.
                    var result = utility.httpRespDataConverter(data, status);
                    // customized dto if available.
                    if (dto && angular.isFunction(dto)) {

                        // DTO(result, requestData, customizedData)
                        result = dto(result, requestData, customizedData);
                    }
                    $log.debug(logKey, utility.stringFormat("success -> converted data {0} ", result));

                    return defered.resolve(result);

                }).error(function(data, status, headers, config) {
                    var result = utility.httpRespDataConverter(data, status);
                    $log.debug(logKey, utility.stringFormat("failed -> converted data {0}", result));
                    return defered.reject(result);
                });

                return defered.promise;
            };
            /**
             * the get request
             * @param  {string} url            [description]
             * @param  {object} requestData    {name:'sdfsf', password:''}
             * @param  {function} dto            optonal
             * @param  {object} customizedData passed to dto
             * @param  {object} config    configJson {headers:{},xxxx}
             
             */
            this.getRequest = function(url, requestData, dto, customizedData, config) {

                var defered = $q.defer();
                // request requestData.
                requestData = getRequestData(requestData) || {};

                // get serialized Url
                url = getSerializedUrl(url, requestData);

                var logKey = this.logAPIUniqueKey || "Not Defined Log Key!";

                $http.get(url, config).success(function(data, status, headers, config) {
                    // converted raw data.
                    var result = utility.httpRespDataConverter(data, status);
                    // customized dto if available.
                    if (dto && angular.isFunction(dto)) {
                        // DTO(result, requestData, customizedData)
                        result = dto(result, requestData, customizedData);
                    }
                    $log.debug(logKey, utility.stringFormat("success -> converted data {0} ", result));

                    return defered.resolve(result);

                }).error(function(data, status, headers, config) {
                    var result = utility.httpRespDataConverter(data, status);
                    $log.debug(logKey, utility.stringFormat("failed -> converted data {0}", result));

                    return defered.reject(result);
                });
                return defered.promise;
            };

            // in the most time ,we can invoke remoteRequest to send http request
            this.remoteRequest = function(url, requestData, dto, customizedData, config){
                var promise;
                var valid = /^(ftp|http|https):\/\/[^ "]+$/.test(url);
                if (!valid) {
                    var url = getRequestUrl(url);
                }
                switch (defaultMethod) {
                    case "POST":
                        promise = this.postRequest(url, requestData, dto, customizedData, config);
                        break;
                    case "GET":
                        promise = this.getRequest(url, requestData, dto, customizedData, config);
                        break;
                    default:
                        promise = this.postRequest(url, requestData, dto, customizedData, config);
                        break;
                }
                return promise;
            };
            // used to ajax fetch project assets.
            this.localRequest = function(url, requestData, dto, customizedData, config){
                var url = appConfig.getTemplateUrl(url);
                var promise = this.getRequest(url, requestData, dto, customizedData, config);
                return promise;
            };
        };
    }
]);