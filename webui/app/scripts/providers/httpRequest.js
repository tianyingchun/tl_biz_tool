app.factory("httpRequest", ['$log', '$http', "$q", 'utility', 'appConfig', 'remoteApi',

    function($log, $http, $q, utility, appConfig, remoteApi) {

        var apiBaseUrl = remoteApi.apiBaseUrl;
        var defaultMethod = remoteApi.defaultMethod; // local debug requird 'GET' live is 'POST'

        // common header, 
        var commonHeader = {
            "Authorization": "Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ=="
        };
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

        // Expose base http request constructor.
        return function BaseHttpRequest() {

            /**
             * http request.
             * @param  {string} url     request url
             * @param  {string} method  GET,POST default is POST.
             * @param  {data} data      the parameters for GET, POST
             * @param  {function} dto   optional,customized data converter.
             * @param  {object/string/array} customizedData   optional,allow us passed customized data into DTO converter callback.
            
             * @param  {object} headers {post|get|put:{ "Content-Type":"application/json"}}
             */
            this.postRequest = function(url, requestData, dto, customizedData, postHeaders) {
                // must be isntance it in each request.
                var defered = $q.defer();
                // default configurations. no need to use common header now.
                // $http.defaults.headers.common = commonHeader;
                // attached other header configurations here.
                angular.extend($http.defaults.headers.post, postHeaders);

                // request requestData.
                requestData = getRequestData(requestData) || {};

                var logKey = this.logAPIUniqueKey;

                $http.post(url, requestData).success(function(data, status, headers, config) {
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

            this.getRequest = function(url, requestData, dto, customizedData, getHeaders) {

                var defered = $q.defer();

                // default configurations. no need to use common header now.
                // $http.defaults.headers.common = commonHeader;
                // attached other header configurations here.
                angular.extend($http.defaults.headers, getHeaders);

                // request requestData.
                requestData = getRequestData(requestData);

                var logKey = this.logAPIUniqueKey || "Not Defined Log Key!";

                $http.get(url, {
                    params: requestData
                }).success(function(data, status, headers, config) {
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
            this.remoteRequest = function(url, requestData, dto, customizedData, getHeaders) {
                var promise;
                var valid = /^(ftp|http|https):\/\/[^ "]+$/.test(url);
                if (!valid) {
                    var url = getRequestUrl(url);
                }
                switch (defaultMethod) {
                    case "POST":
                        promise = this.postRequest(url, requestData, dto, customizedData, getHeaders);
                        break;
                    case "GET":
                        promise = this.getRequest(url, requestData, dto, customizedData, getHeaders);
                        break;
                    default:
                        promise = this.postRequest(url, requestData, dto, customizedData, getHeaders);
                        break;
                }
                return promise;
            };
            // used to ajax fetch project assets.
            this.localRequest = function(url, requestData, dto, customizedData, getHeaders) {
                var url = appConfig.getTemplateUrl(url);
                var promise = this.getRequest(url, requestData, dto, customizedData, getHeaders);
                return promise;
            };
        };
    }
]);
