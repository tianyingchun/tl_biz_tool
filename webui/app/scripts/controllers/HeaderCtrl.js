app.controller('HeaderCtrl', ['$scope', 'Session', 'appModules', function($scope, Session, appModules) {
	window.Session = Session;
    $scope.modules = appModules.modules;
    $scope.currentModule = {
        selected: ""
    };

    for (var i = 0; i < $scope.modules.length; i++) {
    	var temp = $scope.modules[i];
    	if (temp.default === true) {
    		$scope.currentModule.selected = temp;
    		Session.currentModule = temp;
    		break;
    	}
    };

    $scope.click = function (item) {
    	Session.currentModule = item;
    	$scope.$emit("navigationChange", item);
    }
}])
