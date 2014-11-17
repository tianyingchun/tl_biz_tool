app.controller('ClientConfigCtrl', ['$scope', 'configService', 'configPath', '$http', function($scope, configService, configPath, $http) {

	var promise = configService.getClientConfigData(configPath.client);
	console.log(configPath.client);
	promise.then(function (data) {
		console.log(data);
		
		var keys = Object.keys(data);
		angular.forEach(keys, function (key) {
			var configKeys = Object.keys(data[key].configs);
			async.eachSeries(configKeys, function (configKey, callback) {
				if(data[key].configs[configKey].api) {
					$http.get('./mockdata.json').then(function (resp) {
						data[key].configs[configKey].items = resp.data.info;
						callback();
					});
				}
			}, function (err) {
				if (!err) {
					$scope.configData = data;
				}
			})
		})
	}, function (data) {
		console.log(data);
	});

    this.saveConfig = function (argument) {
    	console.log(configPath.client);
    	var data = angular.copy($scope.configData);
    	var keys = Object.keys(data);
		angular.forEach(keys, function (key) {
			var configKeys = Object.keys(data[key].configs);
			angular.forEach(configKeys, function (configKey) {
				if (data[key].configs[configKey].items) {
					delete data[key].configs[configKey].items;
				} 
			});
		});

    	configService.saveClientConfigData(configPath.client, $scope.configData);
    }

}])
