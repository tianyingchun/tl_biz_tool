// 
// dependancy configs/constants/js -->`appConfig`
// -----------------------------------------------------------
(function(app) {
    var debugModel = true;
    var version = "v1";
    // common configuration.
    app.constant("appConfig", {
        "debugModel": debugModel, // set to false if put it to release/test env
        "version": version,
        getTemplateUrl: function(templateUrl) {
            if (debugModel) {
                return templateUrl;
            }
            return (version ? version + "/" + templateUrl : templateUrl);
        }
    });
})(app);


app.config(["$routeProvider", "$logProvider", "$sceDelegateProvider", "appConfig",
    function($routeProvider, $logProvider, $sceDelegateProvider, appConfig) {
        // sce resource white list.
        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            'http*://**'
        ]);
        
        // default is true
        $logProvider.debugEnabled(appConfig["debugModel"]);

        // page deniftions.

        $routeProvider 
            // we need to put root matcher the last line.
            .when('/', {
                templateUrl: appConfig.getTemplateUrl('app/views/index.html'),
                controller: 'IndexCtrl',
                controllerAs: 'controller'
            })
            .when('/auto-upload', {
                templateUrl: appConfig.getTemplateUrl('app/views/auto-upload.html'),
                controller: 'AutoUploadCtrl',
                controllerAs: 'controller'
            })
            .when('/image-spider', {
                templateUrl: appConfig.getTemplateUrl('app/views/image-spider.html'),
                controller: 'ImageSpiderCtrl',
                controllerAs: 'controller'
            })
            .when('/image-upload', {
                templateUrl: appConfig.getTemplateUrl('app/views/image-upload.html'),
                controller: 'ImageUploadCtrl',
                controllerAs: 'controller'
            })
            .when('/client-config', {
                templateUrl: appConfig.getTemplateUrl('app/views/client-config.html'),
                controller: 'ClientConfigCtrl',
                controllerAs: 'controller'
            })
            .when('/server-config', {
                templateUrl: appConfig.getTemplateUrl('app/views/server-config.html'),
                controller: 'ServerConfigCtrl',
                controllerAs: 'controller'
            })
            .otherwise({
                redirectTo: '/'
            });
    }
]);
