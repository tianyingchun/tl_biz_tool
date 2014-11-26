app.controller('HeaderCtrl', ['$scope', 'appModules', function($scope, appModules) {

    $scope.modules = appModules.modules;
    $scope.currentModule = {
        selected: ""
    };

    $scope.click = function (item) {
    	$scope.$emit("navigationChange", item);
    }
}])
