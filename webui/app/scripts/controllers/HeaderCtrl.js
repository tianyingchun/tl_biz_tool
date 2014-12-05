app.controller('HeaderCtrl', ['$scope', 'Session', 'appModules', '$location', function ($scope, Session, appModules, $location) {
    window.Session = Session;
    $scope.modules = appModules.modules;

    $scope.currentModule = {
        selected: ""
    };

    var path = $location.path();
    if (path && path.length > 1) {
        var value = path.split('/')[1];
        for (var i = 0; i < $scope.modules.length; i++) {
            if ($scope.modules[i].value === value) {
                $scope.modules[i].default = true;
            } else {
                $scope.modules[i].default = false;
            }
        };
    }

    for (var i = 0; i < $scope.modules.length; i++) {
        var temp = $scope.modules[i];
        if (temp.default === true) {
            $scope.currentModule.selected = temp;
            Session.currentModule = temp;
            break;
        }
    };

    $scope.click = function (item) {
        if (angular.equals(Session.currentModule, item)) {
            return;
        }
        Session.currentModule = item;
        $scope.$emit("navigationChange", item);
    }
}])
