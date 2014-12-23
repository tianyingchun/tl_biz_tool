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
            .when('/configuration/:category/:config', {
                templateUrl: appConfig.getTemplateUrl('app/views/config/configuration.html'),
                controller: 'ConfigCtrl',
                controllerAs: 'controller'
            })
            .when('/product/product-upload', {
                templateUrl: appConfig.getTemplateUrl('app/views/product/upload.html'),
                controller: 'ProductCtrl',
                controllerAs: 'controller'
            })
            .when('/picture/picture-extract', {
                templateUrl: appConfig.getTemplateUrl('app/views/picture/extract.html'),
                controller: 'PictureExtractCtrl',
                controllerAs: 'controller'
            })
            .when('/picture/picture-binding', {
                templateUrl: appConfig.getTemplateUrl('app/views/picture/bind2db.html'),
                controller: 'PictureBindCtrl',
                controllerAs: 'controller'
            })
            .otherwise({
                redirectTo: '/'
            });
    }
]);
