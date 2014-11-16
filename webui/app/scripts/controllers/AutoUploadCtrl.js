    app.controller("AutoUploadCtrl", ["$scope", "$log", "FileService", "ProductService", "ngDialog", "regexRules", "statusEnum",
    function ($scope, $log, FileService, ProductService, ngDialog, regexRules, statusEnum) {

        $scope.list = [];
        this.uploadFile = function() {
            helper.file_upload.click();
            helper.file_upload.change(function() {
                var path = $(this).val();
                $(this).val('');
                $log.log(path);

                var promise = FileService.readFile(path);
                promise.then(function(file) {
                    var results = file.trim().split('\n');
                    angular.forEach(results, function(item) {
                        item = item.trim();
                        var temp = {};
                        if (regexRules.url.test(item)){ 
                            temp.url = item;
                            $scope.list.push(temp);
                        }
                    })
                })
            })
        };

        $scope.list = [{url: "www.baidu.com"},{url: "www.baidu.com"}];
        
        this.handle = function (item) {
            if (item.url && item.url.length > 0) {
                $scope.$emit('changeSpinnerStatus', true);
                item.status = statusEnum.PROCESSING;

                var promise = ProductService.uploadProduct(item);
                promise.then(function (results) {
                    item.success = true;
                    item.status = statusEnum.PROCESS_SUCCESS;
                }, function (err) {
                    item.error = true;
                    item.errorMessage = err;
                    item.status = statusEnum.PROCESS_FAILED;
                }).finally(function () {
                    $scope.$emit('changeSpinnerStatus', false);
                })
            }
        };  

        this.doBatch = function() {
            $scope.doingBatch = true;
            if ($scope.list.length > 0) {
                $log.info("start do a batch");
                var list = $scope.list;
                $scope.$emit('changeSpinnerStatus', true);
                async.eachSeries(list, function (item, callback) {
                    var promise = ProductService.uploadProduct(item);
                    promise.then(function (results) {
                        item.success = true;
                        item.status = statusEnum.PROCESS_SUCCESS;
                        callback();
                    }, function (err) {
                        item.error = true;
                        item.errorMessage = err;
                        item.status = statusEnum.PROCESS_FAILED;
                        callback();
                    })
                }, function (err) {
                    $scope.doingBatch = false;
                    $scope.$emit('changeSpinnerStatus', false);
                    $log.error(err);
                })
            } else {
                $log.info("nothing to do!");
                ngDialog.open({
                    template: '<p>没用可以处理的地址了!</p>',
                    plain: true
                });
                $scope.doingBatch = false;
            }
        }


    }
])