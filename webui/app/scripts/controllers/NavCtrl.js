app.controller('NavCtrl', ['$scope', '$rootScope', 'FileService', 'Session', 'navigationConfig',
    function($scope, $rootScope, FileService, Session, navigationConfig) {

        var navigationConfig = navigationConfig;

        $scope.categories = null;
        if (Session.currentModule) {
            getCategories(Session.currentModule);
        }

        $rootScope.$on("navigationChange", function($event, data) {
            getCategories(data);
        });

        //get categories through currenct module.
        function getCategories(data) {
            if (data.type === 'config') {
                var path = data.path;
                if (path && path.indexOf(".json")) {
                    var promise = FileService.readJson(path);
                    promise.then(function(result) {
                        $scope.categories = result;
                    })
                }

            } else if (data.type === 'normal') {
                $scope.categories = navigationConfig[data.value].categories;
            }
        }
    }
])
