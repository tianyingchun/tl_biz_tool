app.factory('configService', ['FileService', 'CatalogService', function(FileService, CatalogService){
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
	configService.getConfigData = function (url) {
		return CatalogService.getConfigData(url);
	}
	return configService;
		
}])