app.controller("PictureCtrl", ["$scope", "$log", "PictureService", "statusEnum", "FileService", "regexRules", "DialogService",
    function ($scope, $log, PictureService, statusEnum, FileService, regexRules, DialogService) {

        // $scope.$emit("changeSpinnerStatus", true);
        $scope.list = [];
        this.uploadFile = function () {
            helper.file_upload.click();
            var scope = $scope;
            helper.file_upload.change(function () {
                var self = this;
                // not in angular $scope. so need use $apply to exec this callback
                $scope.$apply(function () {
                    var path = $(self).val();
                    $(self).val('');

                    var promise = FileService.readFile(path);
                    promise.then(function (file) {
                        var list = [];
                        var results = file.trim().split('\n');
                        angular.forEach(results, function (item) {
                            item = item.trim();
                            var temp = {};
                            if (regexRules.url.test(item)) {
                                var hasFound = false;
                                for (var i = 0; i < list.length; i++) {
                                    if (list[i].url === item) {
                                        hasFound = true;
                                        break;
                                    }
                                };
                                if (hasFound) {
                                    // return;
                                }
                                temp.url = item;
                                list.push(temp);
                            }
                        })
                        scope.list = scope.list.concat(list);
                    })
                })
            })
        };

        /**
         * /
         * @param  {[type]} picture [description]
         * @return {[type]}         [description]
         */
        function extractPicture(picture) {
        	var data = {
        		url: picture.url
        	}
			initStatus(picture);
        	var promise = PictureService.extractPicture(data);
        	return promise;
        };

        this.remove = function (index) {
            if (index > -1) {
                $scope.list.splice(index, 1);
            }
        };

        function initStatus(item) {
        	item.status = statusEnum.PROCESSING;
        	item.error = false;
        	item.errorMessage = null;
        	item.success = false;
        }

        this.handle = function (item) {
            if (item.url && item.url.length > 0) {
                $scope.$emit('changeSpinnerStatus', true);

                var promise = extractPicture(item);
                promise.then(function (results) {
                    item.success = true;
                    item.status = statusEnum.PROCESS_SUCCESS;
                }, function (err) {
                    item.error = true;
                    item.errorMessage = err.message;
                    item.status = statusEnum.PROCESS_FAILED;
                }).finally(function () {
                    $scope.$emit('changeSpinnerStatus', false);
                })
            }
        };

        var stopBatchFlag = false;
        this.doBatch = function () {
            $scope.doingBatch = true;
            if ($scope.finalList && $scope.finalList.length > 0) {
                $log.info("start do a batch");
                stopBatchFlag = false;
                var list = $scope.finalList;
                async.eachSeries(list, function (item, callback) {
                	if (stopBatchFlag === true) {
                		callback("停止批处理");
                		return;
                	}
                	if (item.status === statusEnum.PROCESS_SUCCESS) {
                		callback();
                		return;
                	}
                    var promise = extractPicture(item);
                    promise.then(function (results) {
                        item.success = true;
                        item.status = statusEnum.PROCESS_SUCCESS;
                        callback();
                    }, function (err) {
                        item.error = true;
                        item.errorMessage = err.message;
                        item.status = statusEnum.PROCESS_FAILED;
                        callback();
                    })
                }, function (err) {
                    $scope.doingBatch = false;
                    $log.error(err);
                })
            } else {
                $log.info("nothing to do!");
                DialogService.showAlertDialog("没有可以处理的产品!");
                $scope.doingBatch = false;
            }
        };

        this.stopBatch = function () {
        	stopBatchFlag = true;
        };

    }
]);
