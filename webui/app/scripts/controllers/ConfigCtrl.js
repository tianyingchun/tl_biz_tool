app.controller('ConfigCtrl', ['$scope', 'configService', 'Session', '$routeParams', '$location', 'ngDialog',

    function($scope, configService, Session, $routeParams, $location, ngDialog) {

        $scope.$emit("changeSpinnerStatus", true);
        var categoryInRouter = $routeParams.categories;
        var configInRouter = $routeParams.config;


        if (Session.currentCategory) {
            $scope.configData = Session.currentCategory.subCategories[configInRouter];
        } else {
            // if no current category, go to default page.
            $location.path('/');
            return;
        }

        //go through all configs, whether one config need get data from service.
        angular.forEach($scope.configData.configs, function(config) {
            if (config.api) {
                var url = config.api.url;
                configService.getConfigDataByAPI(url).then(function(resp) {
                    var items = resp.data;
                    config.items = items;
                    for (var i = 0; i < items.length; i++) {
                        if (angular.equals(config.value, items[i][config.api.valueTextNode])) {
                            config.index = i;
                            break;
                        }
                    }

                    $scope.$emit("changeSpinnerStatus", false);
                })
            } else {
                $scope.$emit("changeSpinnerStatus", false);
            }
        });

        /**
         * save config. first read json from path, than merge value. at last, save to local file.
         * @return {[type]} success : true, failed: false.
         */
        this.saveConfig = function() {
            var path = Session.currentCategory.path;
            var promise = configService.getConfigJson(path)
            promise.then(function(data) {
                angular.forEach($scope.configData.configs, function(config, key) {
                    var temp = data[configInRouter]['configs'];
                    if (temp[key]) {
                        temp[key].value = config.value;
                    }
                });

                configService.saveConfigJson(path, data).then(function() {
                    Session.currentCategory.needRefresh = true;
                    ngDialog.open({
                        template: '<p>保存成功!</p>',
                        plain: true
                    });
                    console.log("Save success!");
                }, function(err) {
                    ngDialog.open({
                        template: '<p>保存失败!</p>',
                        plain: true
                    });
                    console.log(err);
                })

            })
        }
    }
])
