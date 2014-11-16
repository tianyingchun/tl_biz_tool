/**
 * The outer root controller for capturing all events,databindings for other child controller.
 */
app.controller("MainCtrl", ["$scope", "$log", "$sce", "$timeout",
    function($scope, $log, $sce, $timeout) {

        $scope.uploadFile = function () {
            helper.file_upload.click();
            helper.file_upload.on("change", function () {
                var file = this.files[0];
                helper.fr.onloadend = function (e) {
                    var results = e.target.result.split('\n');
                    $scope.$broadcast("fileUploadFinish", results);
                }
                helper.fr.readAsText(file);
            });
        }

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
            $scope.showLoading = false;
            // set spinner counter ++;
            $scope.spinnerCounter++;
            $log.debug("scope view content is loading");
        });

        // auto hide spinner while view content loaded.
        $scope.$on('$viewContentLoaded', function() {
            //Here your view content is fully loaded !!
            $scope.spinnerCounter--;
            // spinnerTimer = $timeout(function() {
            //     $scope.showLoading = false;
            //     // cancel
            //     $timeout.cancel(spinnerTimer);
            // }, 10000);
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
