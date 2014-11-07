app.controller("AutoUploadCtrl", ["$scope", function ($scope) {
	// body...
	// 
	$scope.list = [];
	$scope.$on("fileUploadFinish", function (event, results) {
		if (results && results.length > 0) {
			angular.forEach(results, function (item) {
				var temp = {};
				temp.url = item;
				$scope.list.push(temp);
			})
			$scope.$apply();
		}
	})
}])