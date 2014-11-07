app.controller("NavCtrl",["$scope", "navigationConfig", "$location", function ($scope, navigationConfig, $location) {
	$scope.categories = navigationConfig.categories;

	$scope.click = function  (item) {
		angular.forEach($scope.categories, function (category) {
			angular.forEach(category.subCategories, function (sub) {
				sub.active = false;
			})
		})
		item.active = true;
		$location.path(item.path);
	}
}]);