app.factory("httpRequest", ['$log', '$http', 'utility', 'appConfig', 'remoteApi',

    function($log, $http, utility, appConfig, remoteApi) {

        // api base url
        var apiBaseUrl = remoteApi.apiBaseUrl;

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
            var defaultRequestData = {};

            return angular.extend(defaultRequestData, data);
        };
        // get current api request url full path string.
        function getRequestUrl(url) {

            // if we providered an api url with "http|s" prefix omit it.
            if (!/^(ftp|http|https):\/\/[^ "]+$/.test(url)) {
                url = remoteApi.apiBaseUrl + url;
            } else {
                url = remoteApi.apiBaseUrl + url;
            }
            return url;
        };

        // for get request get params parameter
        function getSerializedUrl(url, requestData) {
            return url.split("?")[0] + "?" + utility.toQueryString(requestData);
        };
        /**
         * Define global row data result converter.
         */
        var promisecb = {

            success: function(dto, requestData, customizedData, resp) {
                // converted raw data.
                var result = utility.httpRespDataConverter(resp.data, resp.status);
                // customized dto if available.
                if (dto && angular.isFunction(dto)) {
                    // DTO(result, requestData, customizedData)
                    result = dto(result, requestData, customizedData);
                }
                $log.debug(this.logKey(), utility.stringFormat("success -> converted data {0} ", result));

                return result;
            },
            failed: function(resp) {

                var result = utility.httpRespDataConverter(resp.statusText || resp.data, resp.status);
                $log.debug(this.logKey(), utility.stringFormat("failed -> converted data {0}", result));

                return result;
            }
        };

        // Expose base http request constructor.
        function BaseHttpRequest() {
            // log key
            this.logKey = function() {
                return this.logAPIUniqueKey || "Not Defined Log Key!"
            };
            /**
             * provider short cut to create multi methods.
             * @param  {array} methods methods
             */
            function registerMultipleMethods(methods) {
                for (var i = 0; i < methods.length; i++) {

                    var method = methods[i].toUpperCase();

                    switch (method) {
                        case "GET":
                            /**
                             * the get request
                             * @param  {string} url            [description]
                             * @param  {object} requestData    {name:'username', password:''}
                             * @param  {function} dto          optional
                             * @param  {object} customizedData passed to dto
                             * @param  {object} config    configJson {headers:{},xxxx}
                             */
                            this["getRequest"] = function(url, requestData, dto, customizedData, config) {
                                // get serialized data Url for get request.
                                url = getSerializedUrl(getRequestUrl(url), requestData);

                                return $http.get(url, config)
                                    .then(
                                        angular.bind(this, promisecb.success, dto, requestData, customizedData),
                                        angular.bind(this, promisecb.failed)
                                    );
                            };
                            break;

                        case "POST":
                            this["postRequest"] = function(url, requestData, dto, customizedData, config) {
                                return $http.post(getRequestUrl(url), getRequestData(requestData), config)
                                    .then(
                                        angular.bind(this, promisecb.success, dto, requestData, customizedData),
                                        angular.bind(this, promisecb.failed)
                                    );
                            };
                            break;
                    };
                };
            };
            //
            // invoke shortcut to create base http request helper methods
            // -----------------------------------------------------------
            registerMultipleMethods.call(this, ['GET', 'POST']);
        };
        return BaseHttpRequest;
    }
]);