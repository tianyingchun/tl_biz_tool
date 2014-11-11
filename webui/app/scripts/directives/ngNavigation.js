app.directive('ngNavigation', ['$log', 'navigationConfig', '$location', function($log, navigationConfig, $location){
	// Runs during compile
	return {
		// name: '',
		// priority: 1,
		// terminal: true,
		scope: {
			'close-others': '=?',
			// categories: navigationConfig.categories
		}, // {} = isolate, true = child, false/undefined = no change
		controller: function($scope, $element, $attrs, $transclude) {
			$scope.categories = navigationConfig.categories;
			var current = $location.path();

			if (current !== "") {
				current = current.split('/')[1];
				angular.forEach($scope.categories, function (category) {
					var isFound = false;
					category.isOpen = false;
					angular.forEach(category.subCategories, function (sub) {
						if (sub.path == current) {
							isFound = true;
							sub.active = true;
						}
					})
					if (isFound) {
						category.isOpen = true;
					}
				})
			}
		},
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		restrict: 'EA', // E = Element, A = Attribute, C = Class, M = Comment
		// template: '',
		templateUrl: 'template/ngNavigation.html',
		// replace: true,
		// transclude: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		link: function($scope, iElm, iAttrs, controller) {
			
			$scope.click = function (item) {
				angular.forEach($scope.categories, function (category) {
					angular.forEach(category.subCategories, function (sub) {
						sub.active = false;
					})
				})
				item.active = true;
				$location.path(item.path);
			}
		}
	};
}]);

app.run(['$templateCache', function($templateCache){
	$templateCache.put("template/ngNavigation.html", 
		"<div class=\"panel panel-default\">"+
			"<div class=\"panel-body text-center\">"+
                "<accordion close-others={{close-others}}>"+
                    "<accordion-group data-ng-repeat=\"category in categories\" heading=\"{{category.name}}\" is-open=\"category.isOpen\" >"+
                        "<ul class=\"nav nav-pills nav-stacked\">"+
                            "<li data-ng-class=\"{'active':sub.active}\" data-ng-repeat=\"sub in category.subCategories\" ng-click=\"click(sub)\"><a>{{sub.name}}</a></li>"+
                        "</ul>"+
                    "</accordion-group>"+
                "</accordion>"+              
            "</div>"+
        "</div>"
	);
}])