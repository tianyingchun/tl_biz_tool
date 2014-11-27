app.directive('configuration', ['$log', function($log){
	// Runs during compile
	return {
		// name: '',
		// priority: 1,
		// terminal: true,
		scope: {
			'source': '=?',
			'close-others': '=?'
			// 'isOpen': '=?'
		}, // {} = isolate, true = child, false/undefined = no change
		controller: function($scope, $element, $attrs, $transclude, $http) {
			$scope.isString = function (value) {
				return angular.isString(value);
			}
			$scope.isObject = function (value) {
				return angular.isObject(value);
			}
			$scope.isTextBox = function (value) {
				if (value === undefined) {
					return true;
				}
				return value == "textbox";
			}
			$scope.isDropdown = function (value) {
				return value == "dropdown";
			}
		},
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		restrict: 'EA', // E = Element, A = Attribute, C = Class, M = Comment
		// template: '',
		templateUrl: 'template/ngConfiguration.html',
		// replace: true,
		// transclude: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		link: function($scope, iElm, iAttrs, controller) {

		}
	};
}]);


app.run(['$templateCache', function($templateCache){
	$templateCache.put("template/ngConfiguration.html", 
		"<div class=\"\">"+
			"<div class=\"text-center\">"+
                "<accordion close-others={{close-others}}>"+
	                "<accordion-group data-ng-repeat=\"(configKey, configValue) in source.configs\" heading=\"{{configValue.title}}\" is-open=true  class='form-horizontal'>"+
	                	// "<div data-ng-repeat=\"(configKey, configValue) in source.configs\" class=\"form-horizontal\">"+
		                	
		                "<div ng-if=\"isDropdown(configValue.type)\">"+
		                	"<label class=\"col-sm-2 control-label\">{{configKey}}</label>"+
		                	"<div class='btn-group pull-left' dropdown>"+
            					"<button class=\"btn btn-primary dropdown-toggle\">{{configValue.items[configValue.index][configValue.api.displayTextNode]}} <span class='caret'></span></button>"+
            					"<ul class='dropdown-menu' role='menu'>"+
            						"<li ng-repeat='item in configValue.items' ng-click='configValue.index=$index'><a href>{{item[configValue.api.displayTextNode]}}</a></li>"+
            					"</ul>"+
            				"</div>"+
		                "</div>"+
		                	
		                "<div ng-if=\"isTextBox(configValue.type)\">"+
			                "<div ng-if=\"!isObject(configValue.value)\" class=\"form-group\">"+
	                		 	"<label class=\"col-sm-2 control-label\">{{configKey}}</label>"+
	                			"<div class=\"col-sm-10\">"+
	                				"<input ng-if=\"isTextBox(configValue.type)\" type=\"text\" ng-model=\"configValue.value\" class=\"form-control\">"+
                				"</div>"+
                			"</div>"+

		                	"<div ng-if=\"isObject(configValue.value)\">"+
		                		"<div data-ng-repeat=\"(key, value) in configValue.value\" class=\"form-group\">"+
                					"<label class=\"col-sm-2 control-label\">{{key}}</label>"+
                					"<div class=\"col-sm-10\"><input type=\"text\" ng-model=\"value\" class=\"form-control\"></div>"+
                				"</div>"+
							"</div>"+
		                "</div>"+	
		                	
                		// "<div ng-if=\"isObject(configValue.value)\">"+
                		// 	// "<accordion-group heading=\"{{configKey}}\" is-open=true>"+
                		// 		"<div data-ng-repeat=\"(key, value) in configValue.value\" class=\"form-group\">"+
                		// 			"<label class=\"col-sm-2 control-label\">{{key}}</label>"+
                		// 			"<div class=\"col-sm-10\"><input type=\"text\" ng-model=\"value\" class=\"form-control\"></div>"+
                		// 		"</div>"+
                		// 	// "</accordion-group>"+
                		// "</div>"+
                		// "<div ng-if=\"!isObject(configValue.value)\" class=\"form-group\">"+
                		//  	"<label class=\"col-sm-2 control-label\">{{configKey}}</label>"+
                		// 	"<div class=\"col-sm-10\">"+
                		// 		"<input ng-if=\"isTextBox(configValue.type)\" type=\"text\" ng-model=\"configValue.value\" class=\"form-control\">"+
                		// 		"<div ng-if=\"isDropdown(configValue.type)\" class='btn-group pull-left' dropdown>"+
                		// 			"<button class=\"btn btn-primary dropdown-toggle\">{{configValue.items[configValue.index][configValue.api.displayTextNode]}} <span class='caret'></span></button>"+
                		// 			"<ul class='dropdown-menu' role='menu'>"+
                		// 				"<li ng-repeat='item in configValue.items' ng-click='configValue.index=$index'><a href>{{item[configValue.api.displayTextNode]}}</a></li>"+
                		// 			"</ul>"+
                		// 		"</div>"+
                		// 	"</div>"+
                		// "</div>"+
	                	// "</div>"+
                    "</accordion-group>"+
                "</accordion>"+
            "</div>"+
        "</div>"
	);
}])