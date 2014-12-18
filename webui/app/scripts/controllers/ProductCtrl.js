app.controller("ProductCtrl", ["$scope", "$log", "FileService", "ProductService", "ngDialog", "regexRules", "statusEnum", "$filter", "CatalogService", "DialogService",
    function($scope, $log, FileService, ProductService, ngDialog, regexRules, statusEnum, $filter, CatalogService, DialogService) {

        $scope.$emit("changeSpinnerStatus", true);
        $scope.list = [];
        var allCategories = {};
        var promise = CatalogService.getAllCategories();
        promise.then(function (result) {

            result = result.data;
            angular.forEach(result, function (item) {
                item.Name = item.Name.trim();
                allCategories[item.Id] = angular.copy(item);
            })

            angular.forEach(result, function (item) {
                var temp = item;
                item.displayName = item.Name;
                while (temp.ParentCategoryId != 0) {
                    item.displayName = allCategories[temp.ParentCategoryId].Name + ' -> ' + item.displayName.trim();
                    temp = allCategories[temp.ParentCategoryId];
                }
            })

            result.sort(function (a, b) {
                if (a.displayName >= b.displayName) {
                    return 1;
                } else {
                    return -1;
                }
            })
            $scope.categoryList = angular.copy(result);

        }).finally(function () {
            $scope.$emit("changeSpinnerStatus", false);
        });

        this.uploadFile = function() {
            helper.file_upload.click();
            var scope = $scope;
            helper.file_upload.change(function () {
                var self = this;
                // not in angular $scope. so need use $apply to exec this callback
                $scope.$apply(function () {
                    var path = $(self).val();
                    $(self).val('');

                    var promise = FileService.readFile(path);
                    promise.then(function(file) {
                        var list = [];
                        var results = file.trim().split('\n');
                        angular.forEach(results, function(item) {
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
                                    return;
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

        this.selectCategory = function(category, product) {
            var category = category;
            var categories = [angular.copy(category)];
            while (category.ParentCategoryId != 0) {
                var temp = allCategories[category.ParentCategoryId];
                categories.push(angular.copy(temp));
                category = temp;
            }

            categories = categories.reverse();
            var dialogScope = $scope.$new();
            dialogScope.categories = categories;

            var dialog = ngDialog.openConfirm({
                scope: dialogScope,
                template: "selectCategory"
            });
            dialog.then(function(data) {
                // for selected product url
                if (product) {
                    product.categories = angular.copy(data);
                } else { // select categor for all product url
                    angular.forEach($scope.list, function (item) {
                        item.categories = angular.copy(data);
                    })
                }

                console.log(category);
            }, function (data) {
                console.log(data)
            })
        };

        this.editCategory = function (item) {
            var product = item;
            if (product.categories && product.categories.length > 0) {
                var dialogScope = $scope.$new();
                dialogScope.categories = product.categories;
                var dialog = ngDialog.openConfirm({
                    scope: dialogScope,
                    template: "selectCategory"
                });

                dialog.then(function (data) {
                    if (product) {
                        product.categories = data;
                    }
                }, function (data) {
                    console.log(data)
                })
            }
        };

        /**
         * /
         * @param  {[type]} product [description]
         * @return {[type]}         [description]
         */
        function uploadProduct(product) {
            if (product.categories && product.categories.length > 0) {
                var categoryIds = [];
                angular.forEach(product.categories, function (item) {
                    if (item.selected === true) {
                        categoryIds.push(item.Id);
                    }
                })

                if (categoryIds.length > 0) {
                    initStatus(product);
                    var data = {
                        url: product.url,
                        categoryIds: categoryIds,
                        manufacturerIds: []
                    }
                    return ProductService.uploadProduct(data);
                } else {
                    console.log("product don't select category");
                    return null;
                }
            } else {
                // TODO: how to deal with none categories product
                console.log("product don't have category!");
                return null;
            }
        };

        this.remove = function (item) {
            var index = $scope.list.indexOf(item);
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

                var promise = uploadProduct(item);
                if (promise === null) {
                    // tell user need to select category
                    DialogService.showAlertDialog("请给产品选择分类再上传!");
                    $scope.$emit('changeSpinnerStatus', false);
                    return;
                }
                promise.then(function (results) {
                    item.success = true;
                    item.status = statusEnum.PROCESS_SUCCESS;
                }, function (err) {
                    item.error = true;
                    item.errorMessage = err.data.message;
                    item.status = statusEnum.PROCESS_FAILED;
                }).finally(function () {
                    $scope.$emit('changeSpinnerStatus', false);
                })
            }
        };

        this.doBatch = function () {
            $scope.doingBatch = true;
            if ($scope.finalList && $scope.finalList.length > 0) {
                $log.info("start do a batch");
                var list = $scope.finalList;
                $scope.$emit('changeSpinnerStatus', true);
                async.eachSeries(list, function (item, callback) {
                    if (item.status === statusEnum.PROCESS_SUCCESS) {
                        callback();
                    }
                    var promise = uploadProduct(item);
                    if (promise === null) {
                        callback();
                        return;
                    }
                    item.status = statusEnum.PROCESSING;
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
                    $scope.$emit('changeSpinnerStatus', false);
                    $log.error(err);
                })
            } else {
                $log.info("nothing to do!");
                DialogService.showAlertDialog("没有可以处理的产品!");
                $scope.doingBatch = false;
            }
        };

    }
])
