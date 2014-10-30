(function() {
    function UtilityService($log, BaseHttpRequest, remoteApi, cacheKeysDefinition, cacheFactory) {
        var cacheFactoryKey = cacheKeysDefinition["cacheFactoryKeys"]["provinceCityArea"];
        var provinceCityAreaKey = cacheKeysDefinition["cacheKeys"]["provinceCityArea"];

        // cache Instance.
        var cache = cacheFactory.get(cacheFactoryKey) || cacheFactory(cacheFactoryKey);
        // each service must be defined this key used to flag current request belong to.
        this.logAPIUniqueKey = "[UtilityService]";
        this.$log = $log;
        this.remoteApi = remoteApi;
        // inherits base http request infrustrature.
        BaseHttpRequest.call(this);

        /**
         * Get province city area source json data from localstorage cache.
         *
         */
        this.getCachePCAData = function() {
            return cache.get(provinceCityAreaKey) || null;
        };
        //
        // customized dto: inviterDto.
        // --------------------------------------------------
        //  dto inviter
        this.idCardOrgDto = function(result, requestData) {
            // the first 6bit number of identitiy card number.
            var idShortCode = requestData.identityNum && requestData.identityNum.substring(0, 6);
            return {
                code: result.code,
                message: result.message,
                idCardOrg: result.data[idShortCode]
            };
        };
        this.pictureUploadDto = function(result) {
            return result;
        };
        this.pcaJsonDto = function(result) {
            var pcaData = result.data.allArea;
            if (result.code == "1000") {
                //cache it if the request success.
                cache.put(provinceCityAreaKey, pcaData);
            }
            return pcaData;
        };
        // dto,get province data result.
        this.pcaProvinceDto = function(pcaData) {
            var result = [];
            if (pcaData) {
                for (var i = 0; i < pcaData.length; i++) {
                    var province = pcaData[i];
                    result.push({
                        key: province["province"]
                    });
                };
            }
            return result;
        };
        this.pcaCityDto = function(provinceName, pcaData) {
            var result = [];
            if (provinceName) {
                // find all cities [{'涪陵区':[]},{}]
                var cities = findCitiesByProvinceKey(pcaData, provinceName);
                for (var i = 0; cities && i < cities.length; i++) {
                    var city = cities[i];
                    result.push({
                        key: city["city"]
                    });
                };
            }
            return result;
        };
        this.pcaAreaDto = function(provinceName, cityName, pcaData) {
            var result = [];
            if (provinceName && cityName) {
                // find all cities [{'涪陵区':[]},{}]
                var cities = findCitiesByProvinceKey(pcaData, provinceName);
                // find all areas by city name key.
                var areas = findAreasByCityName(cities, cityName);
                for (var i = 0; areas && i < areas.length; i++) {
                    var area = areas[i];
                    result.push({
                        key: area["county"],
                        postCode: area["postCode"]
                    });
                };
            }
            return result;
        };

        // helper method for find all cities by province name.
        function findCitiesByProvinceKey(pcaData, provinceKey) {
            var cities = [];
            if (pcaData && pcaData.length) {
                for (var i = 0; i < pcaData.length; i++) {
                    var provinceItem = pcaData[i];
                    if (provinceItem["province"] == provinceKey) {
                        cities = cities.concat(provinceItem["cities"]);
                    }
                };
            }
            return cities;
        };
        // helper method for find all areas by city name.
        function findAreasByCityName(cities, cityName) {
            var areas = [];
            if (cities && cities.length) {
                for (var i = 0; i < cities.length; i++) {
                    var city = cities[i];
                    if (city) {
                        if (city["city"] == cityName) {
                            areas = city["counties"];
                            break;
                        }
                    }
                };
            }
            return areas;
        };
    };
    //
    // Expose service request apis to consumer.
    angular.extend(UtilityService.prototype, {
        // 获取身份证对应的发证机关列表
        getIdCardOrgInfo: function(idNumber, sucess_cb, failed_cb) {
            var promise = this.localRequest("content/idcard_code.json", {
                identityNum: idNumber
            }, this.idCardOrgDto);
            promise.then(sucess_cb, failed_cb || sucess_cb);
        },
        // 获取所有的省列表
        getProvinceData: function(sucess_cb, failed_cb) {
            var self = this;
            this.getProvinceCityAreaData(function(result) {
                // get only pcadata to display.
                result = self.pcaProvinceDto(result);
                sucess_cb(result);

            }, failed_cb);
        },
        getCityData: function(provinceName, sucess_cb, failed_cb) {
            // first check if the PCA data existed in cache media.
            var cachedPCAData = this.getCachePCAData();
            // direct invoke
            sucess_cb(this.pcaCityDto(provinceName, cachedPCAData || null));
        },
        getAreaData: function(provinceName, cityName, sucess_cb, failed_cb) {
            // first check if the PCA data existed in cache media.
            var cachedPCAData = this.getCachePCAData();
            // direct invoke
            sucess_cb(this.pcaAreaDto(provinceName, cityName, cachedPCAData || null));
        },
        getProvinceCityAreaData: function(sucess_cb, failed_cb) {
            // first check if the PCA data existed in cache media.
            var cachedPCAData = this.getCachePCAData();
            if (cachedPCAData != null) {

                this.$log.info("async update province city area data and cache it to localstorage!");
                // asycn update the cache json data.
                this.remoteRequest("/h5/op_hyk_get_support_area.json", {
                    operationType: "op_hyk_get_support_area.json"
                }, this.pcaJsonDto);

                // direct invoke
                sucess_cb(cachedPCAData);

            } else {
                var promise = this.remoteRequest("/h5/op_hyk_get_support_area.json", {
                    operationType: "op_hyk_get_support_area.json"
                }, this.pcaJsonDto);
                promise.then(sucess_cb, failed_cb || sucess_cb);
            }
        },
        //文件身份证正，反面
        uploadIDPicture: function(idCardNumber, positiveIDImage, negativeIDImage, sucess_cb, failed_cb) {
            var promise = this.remoteRequest("/common/op_upload_file.json?servId=hyk_h5_upload_id_card", {
                idNo: idCardNumber,
                positiveIDImage: positiveIDImage,
                negativeIDImage: negativeIDImage
            }, this.pictureUploadDto);
            promise.then(sucess_cb, failed_cb || sucess_cb);
        }

    });

    // expose service contract.
    app.service('UtilityService', ['$log', 'httpRequest', 'remoteApi', 'cacheKeysDefinition', 'localStorageCache', UtilityService]);

})(app);
