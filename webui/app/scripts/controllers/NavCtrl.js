app.controller('NavCtrl', ['$scope', '$rootScope', 'FileService', 'Session', function ($scope, $rootScope, FileService, Session) {

    $scope.categories = null;
    if (Session.currentModule) {
        getCategories(Session.currentModule);
    }

    $rootScope.$on("navigationChange", function ($event, data) {
        getCategories(data);
    });

    function getCategories(data) {
        var path = data.path;
        if (path.indexOf(".json")) {
            var promise = FileService.readJson(path);
            promise.then(function (result) {
                $scope.categories = result;
            })
        }
    }
}])
