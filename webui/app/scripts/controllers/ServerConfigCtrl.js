app.controller('ServerConfigCtrl', ['$scope', 'configService', 'configPath',function($scope, configService, configPath) {
	
	var promise = configService.getServerConfigData(configPath.server);
	promise.then(function (data) {
		console.log(data);
		$scope.configData = data;
	}, function (data) {
		console.log(data);
	});

    this.saveConfig = function (argument) {
    	console.log($scope.configData);
    	configService.saveServerConfigData(configPath.client, $scope.configData);
    }
}])
