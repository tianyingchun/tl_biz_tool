app.factory('configService', ['FileService', 'CatalogService', function (FileService, CatalogService) {
    var configService = {};

    configService.getConfigJson = function (path) {
        return FileService.readJson(path);
    };
    configService.saveConfigJson = function (path, data) {
        return FileService.writeJson(path, data);
    };
    configService.getConfigDataByAPI = function (url) {
        return CatalogService.getConfigData(url);
    }
    return configService;

}])
