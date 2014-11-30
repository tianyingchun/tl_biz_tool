app.directive('ngNavigation', ['$log', '$location', 'FileService', 'Session', function($log, $location, FileService, Session) {
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
            $scope.setContent = function(category) {
                Session.currentCategory = category;
                if (Session.currentModule.type === 'config') {

                    if (category.path && !category.subCategories || category.needRefresh) {
                        FileService.readJson(category.path).then(function(obj) {
                            category.subCategories = obj;
                            category.needRefresh = false;
                        })
                    }
                } else if (Session.currentModule.type === 'normal') {

                }
            }

            $scope.click = function(key, item, $event) {
                Session.currentCategory = this.category;
                if (Session.currentCategory === true) {
                    $scope.setContent(this.category);
                }

                angular.forEach($scope.categories, function(category) {
                    angular.forEach(category.subCategories, function(sub) {
                        sub.active = false;
                    })
                })
                item.active = true;


                if (Session.currentModule.type === 'config') {
                    var firstParameterInRouter = Session.currentCategory.path.split('/').pop().split('.')[0];
                    var path = 'configuration/'
                    if (firstParameterInRouter) {
                        path += firstParameterInRouter + '/';
                    }
                    path += key;
                    $location.path(path);
                } else if (Session.currentModule.type === 'normal') {
                    $location.path(item.path);
                }
                $event.stopPropagation();
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

        }
    };
}]);

app.run(['$templateCache', function($templateCache) {
    $templateCache.put("template/ngNavigation.html",
        "<div class=\"panel panel-default\">" +
            "<div class=\"panel-body text-center\">" +
                "<accordion close-others={{close-others}}>" +
                    "<accordion-group data-ng-repeat=\"(key, category) in categories\" heading=\"{{category.title}}\" is-open=\"category.isOpen\" ng-click=\"setContent(category)\" >" +
                        "<ul class=\"nav nav-pills nav-stacked\">" +
                            "<li data-ng-class=\"{'active':subCategory.active}\" data-ng-repeat=\"(subKey, subCategory) in category.subCategories\" ng-click=\"click(subKey, subCategory, $event)\"><a>{{subCategory.title}}</a></li>" +
                        "</ul>" +
                    "</accordion-group>" +
                "</accordion>" +
            "</div>" +
        "</div>"
    );
}])
