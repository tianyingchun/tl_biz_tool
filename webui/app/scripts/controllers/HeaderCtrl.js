app.controller("HeaderCtrl", ["$scope", "$log", "$sce", "$timeout",
    function($scope, $log, $sce, $timeout) {

        $scope.uploadFile = function () {
            helper.file_upload.click();
            helper.file_upload.on("change", function () {
                var file = this.files[0];
                helper.fr.onloadend = function (e) {
                    var results = e.target.result.split('\n');
                    $scope.$broadcast("fileUploadFinish", results);
                    $scope.$emit("fileUploadFinish", results);
                    helper.fr.abort();
                }
                helper.fr.readAsText(file);
            });
        }
    }]
);