app.factory('configService', ['FileService', function(FileService){
	var configService = {};

	configService.getClientConfigData = function (path) {
		return FileService.readJson(path);
	};
	configService.saveClientConfigData = function (path, data) {
		return FileService.writeJson(path, data);
	};
	configService.getServerConfigData = function (path) {
		return FileService.readJson(path);	
	};
	configService.saveServerConfigData = function (path, data) {
		return FileService.writeJson(path, data);	
	};
	return configService;
		
}])