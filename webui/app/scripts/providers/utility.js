app.factory("utility", ["$log", "$window",
    function($log, $window) {

        /**
         * try to decode url components.
         * @param  {string} value encoded url comonents.
         */
        function tryDecodeURIComponent(value) {
            try {
                return decodeURIComponent(value);
            } catch (e) {
                // Ignore any invalid uri component
            }
        }

        /**
         *  format string e.g  stringFormat("my name is {0}, sex is: {1}","tian","male")
         * @param  {array like} str the source string that will be replace by regex .
         */
        function stringFormat() {
                // use this string as the format,Note {x},x start from 1,2,3
                // walk through each argument passed in
                for (var fmt = arguments[0], ndx = 1; ndx < arguments.length; ++ndx) {
                    // replace {1} with argument[1], {2} with argument[2], etc.
                    fmt = fmt.replace(new RegExp('\\{' + (ndx - 1) + '\\}', "g"), angular.toJson(arguments[ndx]));
                }
                // return the formatted string
                return fmt;
            }
            /**
             * parseParams("a=1&b=2&a=3") ==> {a: "3", b: "2"}
             * @param  {string} str query string
             */
        function parseParams(str) {
            return str.split('&').reduce(function(params, param) {
                var paramSplit = param.split('=').map(function(value) {
                    return decodeURIComponent(value.replace('+', ' '));
                });
                params[paramSplit[0]] = paramSplit[1];
                return params;
            }, {});
        };
        /**
         * parse objet to query string
         * @param  {object} obj {name:'ssss', password:''}
         */
        function toQueryString(obj) {
            var parts = [];
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
                }
            }
            return parts.join("&");
        };
        // http request success converter.
        function httpRespDataConverter(data, status, headers, config) {
            if (status == 200) {
                return {
                    code: data.code,
                    message: data.message,
                    data: data.data
                };
            } else {
                return {
                    code: status,
                    message: "HTTP 接口访问错误 [code]: " + status,
                    data: data.data
                };
            }
        };
        /**
         * the short to generate javascirpt object namespace.
         * utitlity.ns(scope,"basic.info", {name:xxxx});===> return scope.basic.info={name:xxx};
         * @param  {object} scope object or null.
         * @param  {string} nsStr "parant.child"
         *
         */
        function namespace(scope, nsStr, val) {
            var container = scope || $window;
            // Break the name at periods and create the object hierarchy we need   
            var parts = nsStr.split('.');
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                // If there is no property of container with this name, create   
                // an empty object.   
                if (!container[part]) {
                    container[part] = (i == parts.length - 1) ? val : {};
                } else if (typeof container[part] != "object") {
                    if (i == parts.length - 1) {
                        container[part] = val;
                    }
                    // If there is already a property, make sure it is an object   
                    $log.warn(part + " already exists and is not an object");
                }
                container = container[part];
            }
            return container;
        };
        /**
         * TRACKING service utitlity for index.html live release version.
         */
        function tracking(eventId) {
            $log.info("tracking id: ", eventId);
            if (typeof Agent != "undefined" && Agent) {
                Agent.clickEvent(eventId);
            }
        };
        return {
            tryDecodeURIComponent: tryDecodeURIComponent,
            stringFormat: stringFormat,
            parseParams: parseParams,
            toQueryString: toQueryString,
            httpRespDataConverter: httpRespDataConverter,
            ns: namespace
        };
    }
]);