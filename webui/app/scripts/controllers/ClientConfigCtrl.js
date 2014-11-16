app.controller('ClientConfigCtrl', ['$scope', 'configService', 'configPath', function($scope, configService, configPath) {

	var promise = configService.getClientConfigData(configPath.client);
	console.log(configPath.client);
	promise.then(function (data) {
		console.log(data);
		$scope.configData = data;
	}, function (data) {
		console.log(data);
	});

    this.saveConfig = function (argument) {
    	console.log(configPath.client);
    	configService.saveClientConfigData(configPath.client, $scope.configData);
    }

}])
