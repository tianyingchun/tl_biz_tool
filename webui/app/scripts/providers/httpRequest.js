app.factory("httpRequest", ['$log', '$http', "$q", 'utility', 'remoteApi',

    function($log, $http, $q, utility, remoteApi) {

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

            success: function(defered, dto, requestData, resp) {
                // converted raw data.
                var result = utility.httpRespDataConverter(resp.data, resp.status);
                // customized dto if available.
                if (dto && angular.isFunction(dto)) {
                    // DTO(result, requestData)
                    result = dto.call(this, result, requestData);
                }
                $log.debug(this.logKey(), utility.stringFormat("success -> converted data {0} ", result));

                defered.resolve(result);
            },
            failed: function(defered, resp) {

                var result = utility.httpRespDataConverter(resp.statusText || resp.data, resp.status);

                $log.debug(this.logKey(), utility.stringFormat("failed -> converted data {0}", result));

                defered.reject(result);
            }
        };

        // Expose base http request constructor.
        function BaseHttpRequest() {
            // log key
            this.logKey = function() {
                return this.logAPIUniqueKey || "Not Defined Log Key!";
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
                             * @param  {string} url            api request url.
                             * @param  {object} requestData    {name:'username', password:''}
                             * @param  {object/Function} config required, configJson {dto:fn, headers:{},cache:true}
                             * usage: if config is function, it will use as dto, we can also define dto in config: {dto:fn}
                             * dto:function(result, reqData)();
                             */
                            this["getRequest"] = function(url, requestData, config) {
                                // get serialized data Url for get request.
                                url = getSerializedUrl(getRequestUrl(url), requestData);
                                // customized defered.
                                var defered = $q.defer();

                                // defined dto here.
                                var dto; 

                                if (config) {
                                    if (angular.isFunction(config)) {
                                        dto = config;
                                        config = null;
                                    } else if (angular.isFunction(config.dto)) {
                                        dto = config.dto;
                                        delete config.dto;
                                    }
                                }

                                $http.get(url, config).then(
                                    angular.bind(this, promisecb.success, defered, dto, requestData),
                                    angular.bind(this, promisecb.failed, defered)
                                );
                                return defered.promise;
                            };
                            break;

                        case "POST":

                            this["postRequest"] = function(url, requestData, config) {
                                // customized defered.
                                var defered = $q.defer();
                                //defined dto here.
                                var dto;

                                if (config) {
                                    if (angular.isFunction(config)) {
                                        dto = config;
                                        config = null;
                                    } else if (angular.isFunction(config.dto)) {
                                        dto = config.dto;
                                        delete config.dto;
                                    }
                                }

                                $http.post(getRequestUrl(url), requestData || {}, config)
                                    .then(
                                        angular.bind(this, promisecb.success, defered, dto, requestData),
                                        angular.bind(this, promisecb.failed, defered)
                                    );
                                return defered.promise;
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