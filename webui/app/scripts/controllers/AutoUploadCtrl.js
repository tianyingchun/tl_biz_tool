app.controller("AutoUploadCtrl", ["$scope", "$log", "FileService", "ProductService", "ngDialog",
    function ($scope, $log, FileService, ProductService, ngDialog) {

        $scope.list = [];

        this.uploadFile = function() {
            helper.file_upload.click();
            helper.file_upload.change(function() {
                var path = $(this).val();
                $(this).val('');
                console.log(path);

                var promise = FileService.readFile(path);
                promise.then(function(file) {
                    console.log(file);
                    var results = file.trim().split('\n');
                    angular.forEach(results, function(item) {
                        var temp = {};
                        temp.url = item;
                        $scope.list.push(temp);
                    })
                })
            })
        };

        this.doBatch = function() {
            if ($scope.list.length > 0) {
                $log.info("start do a batch");
                var list = $scope.list;
                
                ProductService.uploadProduct();

            } else {
                $log.info("nothing to do!");
                ngDialog.open({
                    template: '<p>没用可以处理的地址了!</p>',
                    plain: true
                });
            }
        }


    }
])