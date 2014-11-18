// <div data-x-spinner="showLoading" data-skin="skin"></div>
app.directive("xSpinner", ["$log", function($log) {
    return {
        restrict: 'AC',
        replace: false,
        scope: {
            status: '=xSpinner',
            skin: '=skin',
            counter: '=counter',
            message: '=message'
        },
        // put the spinner html template into index.html
        // template: ['<div class="loading-wrapper">',
        //         '<div class="loading-wrapper">',
        //             '<div class="loading">',
        //                 '<div class="spinner-animation"></div>',
        //                 '<div class="spinnerLogo"></div>',
        //             '</div>',
        //             '<div class="message" ng-bind="message"></div>',
        //         '</div>',
        //     '</div>'
        // ].join(''),
        link: function($scope, $element, $attrs) {
            $scope.$watch('status', function(newStatus, oldStatus) {
                if (newStatus === true || typeof newStatus === 'undefined') {
                    $scope.show();
                } else {
                    $scope.hide();
                    // directly set counter ==0;
                    $scope.counter = 0;
                }
            });
            $scope.$watch('counter', function(newCounter) {
                if ($scope.counter <= 0 || $scope.counter === undefined) {
                    $scope.counter = 0;
                    $scope.hide();
                } else {
                    $scope.show();
                }
                $log.info("current spinner counter: ", $scope.counter);

            });
            $scope.show = function() {
                $element.removeClass("hide");
            };
            $scope.hide = function() {
                $element.addClass("hide");
            };
            $element.bind("$destroy", function() {
                // do some desctory logics.

            });
        }
    }
}]);
