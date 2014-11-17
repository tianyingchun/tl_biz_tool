app.controller('ServerConfigCtrl', ['$scope', 'configService', 'configPath',function($scope, configService, configPath) {
	
	var promise = configService.getServerConfigData(configPath.server);
	promise.then(function (data) {
		console.log(data);
		$scope.configData = data;
	}, function (data) {
		console.log(data);
	});

    this.saveConfig = function (argument) {
    	configService.saveServerConfigData(configPath.server, $scope.configData);
    }
}])
