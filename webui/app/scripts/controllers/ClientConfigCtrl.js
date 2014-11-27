app.controller('ClientConfigCtrl', ['$scope', 'configService', 'Session', '$routeParams', function ($scope, configService, Session, $routeParams) {

    // $scope.$emit("changeSpinnerStatus", true);

    var config = $routeParams.config;
    $scope.configData = Session.currentCategory.subCategories[config];

    angular.forEach($scope.configData.configs, function (config) {
        if (config.api) {
            var url = config.api.url;
            configService.getConfigData(url).then(function (resp) {
                var items = resp.data;
                config.items = items;
                for (var i = 0; i < items.length; i++) {
                    if (config.value == items[i][config.api.valueTextNode]) {
                        config.index = i;
                        break;
                    }
                }
            })
        }
    })

    // var promise = configService.getClientConfigData(configPath.client);
    // promise.then(function (data) {
    // 	console.log(data);

    // 	var keys = Object.keys(data);
    // 	angular.forEach(keys, function (key) {
    // 		var configKeys = Object.keys(data[key].configs);
    // 		async.eachSeries(configKeys, function (configKey, callback) {
    // 			if(data[key].configs[configKey].api) {
    // 				var url = data[key].configs[configKey].api.url;
    // 				configService.getConfigData(url).then(function (resp) {
    // 					var items = resp.data;
    // 					data[key].configs[configKey].items = items;
    // 					for (var i = 0; i < items.length; i++) {
    // 						if (data[key].configs[configKey].value == items[i][data[key].configs[configKey].api.valueTextNode]) {
    // 							data[key].configs[configKey].index = i;
    // 							break;
    // 						}
    // 					};
    // 					callback();
    // 				});
    // 			}
    // 		}, function (err) {
    // 			if (!err) {
    // 				$scope.configData = data;
    // 				$scope.$emit("changeSpinnerStatus", false);
    // 			}
    // 		})
    // 	})
    // }, function (data) {
    // 	console.log(data);
    // });

    //    this.saveConfig = function (argument) {
    //    	console.log(configPath.client);
    //    	var data = angular.copy($scope.configData);
    //    	var keys = Object.keys(data);
    // 	angular.forEach(keys, function (key) {
    // 		var configKeys = Object.keys(data[key].configs);
    // 		angular.forEach(configKeys, function (configKey) {
    // 			var config = data[key].configs[configKey];
    // 			var items = config.items;
    // 			if (items) {
    // 				if (config.index >= 0) {
    // 					config.value = items[config.index][config.api.valueTextNode];
    // 					delete config.index;
    // 				}
    // 				delete config.items;
    // 			} 
    // 		});
    // 	});

    //    	configService.saveClientConfigData(configPath.client, data);
    //    }

}])
