/**
 * The outer root controller for capturing all events,databindings for other child controller.
 */
app.controller("MainCtrl", ["$scope", "$log", "appModules",
    function($scope, $log, appModules) {










        //
        // the default value that indicating if the spinner shown.
        // ------------------------------------------------------
        var spinnerTimer;

        // default spinner message.
        $scope.message = "加载中...";

        // while route change start automatically show spinner loading.
        $scope.$on("$routeChangeStart", function() {
            // alwasy disable spinner first.
            $scope.spinnerCounter = 0;
            // set spinner counter ++;
            $scope.spinnerCounter++;
            $log.debug("scope view content is loading");
        });

        // auto hide spinner while view content loaded.
        $scope.$on('$viewContentLoaded', function() {
            //Here your view content is fully loaded !!
            $scope.spinnerCounter--;
            $log.debug("scope view content loaded");
        });

        // received child controller scope emmit events.
        // change the spinner show/hide .
        $scope.$on("changeSpinnerStatus", function($event, status, message) {
            // show spinner, spinner counter++;
            if (status === true) {
                $scope.message = message || "加载中...";
                $scope.spinnerCounter++;
            } else {
                $scope.spinnerCounter--;
            }
            // stop event bubble.
            $event.stopPropagation();
        });

        // API: change skins theme for spinner.
        $scope.$on("changeSpinnerSkin", function($event, skin) {
            $scope.skin = skin;
            $event.stopPropagation();
        });
    }
]);
