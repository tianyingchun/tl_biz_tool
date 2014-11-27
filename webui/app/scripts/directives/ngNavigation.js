app.directive('ngNavigation', ['$log', '$location', 'FileService', 'Session', function($log, $location, FileService, Session){
	// Runs during compile
	return {
		// name: '',
		// priority: 1,
		// terminal: true,
		scope: {
			'close-others': '=?',
			'categories': '='
			// categories: navigationConfig.categories
		}, // {} = isolate, true = child, false/undefined = no change
		controller: function($scope, $element, $attrs, $transclude) {
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
		replace: true,
		// transclude: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		link: function($scope, iElm, iAttrs, controller) {
			$scope.setContent = function (category) {
				Session.currentCategory = angular.copy(category);
				if (category.path) {
					if (!category.subCategories) {
						FileService.readJson(category.path).then(function (obj) {
							Session.currentCategory.subCategories = angular.copy(obj);
							category.subCategories = obj;
						})
					}
				}
			}

			$scope.click = function (key, item, $event) {
				Session.currentCategory = angular.copy(this.value);
				angular.forEach($scope.categories, function (category) {
					angular.forEach(category.subCategories, function (sub) {
						sub.active = false;
					})
				})
				item.active = true;
				if (Session.currentModule.type === 'config') {
					var path = 'configuration/' + key;
					$location.path(path);
				} else {
					$location.path(item.path);
				}
				$event.stopPropagation();
			}
		}
	};
}]);

app.run(['$templateCache', function($templateCache){
	$templateCache.put("template/ngNavigation.html",
		"<div class=\"panel panel-default\">"+
			"<div class=\"panel-body text-center\">"+
                "<accordion close-others={{close-others}}>"+
                    "<accordion-group data-ng-repeat=\"(key, value) in categories\" heading=\"{{value.title}}\" is-open=\"value.isOpen\" ng-click=\"setContent(value)\" >"+
                        "<ul class=\"nav nav-pills nav-stacked\">"+
                            "<li data-ng-class=\"{'active':subValue.active}\" data-ng-repeat=\"(subKey, subValue) in value.subCategories\" ng-click=\"click(subKey, subValue, $event)\"><a>{{subValue.title}}</a></li>"+
                        "</ul>"+
                    "</accordion-group>"+
                "</accordion>"+
            "</div>"+
        "</div>"
	);
}])



