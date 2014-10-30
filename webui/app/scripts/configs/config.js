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

        // +share page: #/share/data (cid: customer id);
        // + home page: #/home/cid, #card-apply/cid   
        // + card apply closed: #/card-apply-closed/:data
        // + id card form filled page: #/identity-card-from    ----cache key: idcard-form
        // + id card two picture upload: #/identity-card-pics  
        // + post office delivery address: #/address   -----cache key:   address
        // + opt mobile message validation: #opt-varify
        // + payment method form: #payment-password
        // + apply card success page: #card-apply-success

        $routeProvider 
            // we need to put root matcher the last line.
            .when('/', {
                templateUrl: appConfig.getTemplateUrl('app/views/upload-products.html'),
                controller: 'UploadProductCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    }
]);
