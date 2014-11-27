app.controller('NavCtrl', ['$scope', '$rootScope', 'FileService', function($scope, $rootScope, FileService) {

    $scope.categories = {
        "system_config": {
            "title": "系统相关配置",
            "description": "归纳所有与系统相关的配置参数",
            "path": "./system_config.json"
        },
        "product_config": {
            "title": "产品相关配置",
            "description": "归纳所有与产品相关的配置参数",
            "path": "./product_config.json"
        },
        "picture_config": {
            "title": "图片相关配置",
            "description": "归纳所有与图片相关的配置参数",
            "path": "./picture_config.json"
        },
        "hotcontext_config": {
            "title": "系统热启动配置",
            "description": "系统与系统及时修改生效的参数配置方案",
            "path": "./context_config.json"
        }
    };
    // $rootScope.$on("navigationChange", function($event, data) {
    //     var path = data.path;
    //     if (path.indexOf(".json")) {
    //         var promise = FileService.readJson(path);
    //         promise.then(function(result) {
    //             $scope.currenctModule = result;
    //         })
    //     }
    // });
}])
