app.controller("AutoUploadCtrl", ["$scope", "$log", "FileService", "ProductService", "ngDialog", "regexRules", "statusEnum", "$filter", "CatalogService",
    function ($scope, $log, FileService, ProductService, ngDialog, regexRules, statusEnum, $filter, CatalogService) {

        $scope.$emit("changeSpinnerStatus", true);
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
                    item.displayName = allCategories[item.ParentCategoryId].Name + ' -> ' + item.Name.trim();
                    temp = allCategories[item.ParentCategoryId];
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

        var list = [];
        this.uploadFile = function () {
            helper.file_upload.click();
            helper.file_upload.change(function () {
                var path = $(this).val();
                $(this).val('');
                $log.log(path);

                var promise = FileService.readFile(path);
                promise.then(function (file) {
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
                                return;
                            }
                            temp.url = item;
                            list.push(temp);
                        }
                    })
                    $scope.list = angular.copy(list);
                })
            })
        };

        $scope.list = angular.copy(list);
        $scope.doFilter = function () {
            $scope.list = $filter('filter')(list, $scope.searchFilter);
        };


        this.selectCategory = function (category, productURL) {
            var productURL = productURL;
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
            dialog.then(function (data) {
                // for selected product url
                if (productURL) {
                    productURL.categories = data;
                } else { // select categor for all product url
                    angular.forEach($scope.list, function (item) {
                        item.categories = data;
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


        this.handle = function (item) {
            if (item.url && item.url.length > 0) {
                $scope.$emit('changeSpinnerStatus', true);
                item.status = statusEnum.PROCESSING;

                var promise = uploadProduct(item);
                if (promise === null) {
                    // tell user need to select category
                    
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
            if ($scope.list.length > 0) {
                $log.info("start do a batch");
                var list = $scope.list;
                $scope.$emit('changeSpinnerStatus', true);
                async.eachSeries(list, function (item, callback) {
                    var promise = uploadProduct(item);
                    if (promise === null) {
                        callback();
                        return;
                    }
                    promise.then(function (results) {
                        item.success = true;
                        item.status = statusEnum.PROCESS_SUCCESS;
                        callback();
                    }, function (err) {
                        item.error = true;
                        item.errorMessage = err.data.message;
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
        };

    }
])
