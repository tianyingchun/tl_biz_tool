app.directive("dialog", ["$log", "$sce",
    function($log, $sce) {
        return {
            scope: {
                shown: '=shown',
                config: "="
            },
            restrict: "AE",
            replace: true,
            template:'<div class="ui-dialog modal" data-shown="showDialog" data-config="dialogConfig">'+
                        '<div class="modal-dialog {{config.classes}}">'+
                            '<div class="modal-content">'+
                                '<div class="modal-header" ng-show="showTitle">'+
                                    '<button type="button" class="close" data-dismiss="modal">'+
                                        '<span data-ng-click="close(\'close\')">×</span>'+
                                    '</button>'+
                                    '<h4 class="modal-title">{{config.title||\'默认标题\'}}</h4>'+
                                '</div>'+
                                '<div class="modal-body" data-ng-bind-html="config.body">{{config.body||""}}</div>'+
                                '<div class="modal-footer" ng-show="showFooter">'+
                                    '<button data-ng-repeat="button in config.buttons" class="{{button.classes||\'btn-danger\' }} btn ui-dialog-btn-cancel" data-ng-click="buttonTap(button)">{{button.txt}}</button>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>',
            // templateUrl: appConfig.getTemplateUrl("app/views/components/dialog.html"),
            controller: ["$scope",
                function($scope) {
                    // do some initialization.
                    $scope.showTitle = true;
                    $scope.showFooter = true;
                    $scope.showDialog = false;
                    // default dialog config.
                    $scope.dialogConfig = {
                        title: "默认标题",
                        body: "默认弹窗内容",
                        classes: '',
                        buttons: [{
                            txt: "确定",
                            classes: "btn-primary",
                            action: "confirm"
                        }, {
                            txt: "取消",
                            classes: "btn-danger",
                            action: "cancel"
                        }],
                        onDialogShownChanged: null,
                        onBodyEventTrackerFn: null,
                        callbackFn: null
                    }
                }
            ],
            link: function(scope, elem, attrs) {
                var showDialog = function(isShow) {
                    if (isShow) {
                        elem.addClass("show").removeClass("hide");
                    } else {
                        elem.addClass("hide").removeClass("show");
                    }
                    // initlized events.
                    var dialogShownChanged = scope.config && scope.config.onDialogShownChanged;
                    if (angular.isFunction(dialogShownChanged)) {
                        dialogShownChanged.call(scope, isShow);
                    }
                    // $log.debug("current dialog is shown: ", isShow);
                };
                // allow us tracking all click events bubble from dialog-body.
                angular.element(document.querySelector("div.modal-body")).bind("click", function(e) {
                    var bodyEventTrackerFn = scope.config.onBodyEventTrackerFn;
                    if (angular.isFunction(bodyEventTrackerFn)) {
                        bodyEventTrackerFn.call(scope, e);
                    }
                });

                // dialog action button tapped callback function.
                var sendCallback = function(type, result) {
                    var fb = scope.config.callbackFn;
                    if (angular.isFunction(fb)) {
                        $log.debug("dialog callback handler!");
                        fb.call(scope, type, result);
                    }
                };
                // dialog action button tapped handler.
                scope.buttonTap = function(button) {
                    $log.debug("dialog button tapped!", button);
                    sendCallback(button.action || 'default', 1);
                };

                scope.$watch("shown", function(newVal) {
                    $log.debug("show dialog: ", newVal)
                    showDialog(newVal || false);
                });

                scope.$watch("config", function(newValue, oldValue) {
                    scope.config = newValue;
                });

                // allow us have ability to update existed body content.
                scope.setBodyContent = function(bodyHtml) {
                    scope.config.body = $sce.trustAsHtml(bodyHtml);
                };
                // allow us have ability to update exited buttons 
                scope.setFooterButtons = function(buttonsCfg) {
                    scope.config.buttons = buttonsCfg;
                };
                // directly close dialog.
                scope.close = function() {
                    scope.shown = false;
                };

                elem.bind("$destroy", function() {
                    // do some desctory logics.
                    $log.debug("destroy dialog....");
                });
            }
        };
    }
]);


/**
 * the autosuggest dialog directive used to automatically show provice dropdownlist dialog, and then we can choose
 * city->area.
 *
 * depandancy, directives/dialog.js, the basic infrastures in controllers/MainCtrl.js
 * usage:
 *
 *  <input type="text" data-province-auto-suggest data-province-target="company.homeProvince" data-address-target="company.address" data-city-target="company.homeCity" data-area-target="company.homeArea" data-ng-model="company.address" class="ui-text-box" name="companyProvince" required placeholder="请选择省市">
 */
app.directive("provinceAutoSuggest", ["$log", "dialogDefaultCfg", "UtilityService", function($log, dialogCfg, utilityService) {
    return {
        restrict: 'AC',
        scope: {
            provinceBindingTarget: '=provinceTarget',
            cityBindingTarget: '=cityTarget',
            areaBindingTarget: '=areaTarget',
            addressBindingTarget: '=addressTarget',
            postCodeBidingTarget: '=postCodeTarget'
        },
        controller: ["$scope", "$log", "UtilityService", function(scope, $log, utilityService) {
            scope.panes = {
                "province": {
                    step: "step1",
                    buttons: [{
                        txt: "取消",
                        classes: "btn-info",
                        action: "cancel"
                    }, {
                        txt: "下一步",
                        classes: "btn-info",
                        action: "step2"
                    }]
                },
                "city": {
                    step: "step2",
                    buttons: [{
                        txt: "上一步",
                        classes: "btn-info",
                        action: "step1"
                    }, {
                        txt: "下一步",
                        classes: "btn-info",
                        action: "step3"
                    }]
                },
                "area": {
                    step: "step3",
                    buttons: [{
                        txt: "上一步",
                        classes: "btn-info",
                        action: "step2"
                    }, {
                        txt: "确定",
                        classes: "btn-info",
                        action: "confirm"
                    }]
                }
            };
            var _currentPane = {
                lastItem: null,
                step: "step1"
            };
            // save current pane binding target value.
            scope.setCurrentPane = function(lastTapedItem, step, postCode) {
                _currentPane.lastItem = lastTapedItem;
                _currentPane.step = step;
                switch (step) {
                    case "step1":
                        scope.provinceBindingTarget = lastTapedItem && lastTapedItem.text() || "";
                        break;
                    case "step2":
                        scope.cityBindingTarget = lastTapedItem && lastTapedItem.text() || "";
                        break;
                    case "step3":
                        scope.areaBindingTarget = lastTapedItem && lastTapedItem.text() || "";
                        break;
                }
                scope.postCodeBidingTarget = postCode || "";
                scope.addressBindingTarget = [scope.provinceBindingTarget || "", scope.cityBindingTarget || "", scope.areaBindingTarget || ""].join("");
            };
            scope.getCurrentPane = function() {
                return _currentPane;
            };
            scope.showDialogUI = function(step) {
                switch (step) {
                    case "step1":
                        scope.showDilaog(scope.panes["province"], dialogShownChanged, bodyEventCapture, actionButtonCallback);
                        break;
                    case "step2":
                        scope.showDilaog(scope.panes["city"], dialogShownChanged, bodyEventCapture, actionButtonCallback);
                        break;
                    case "step3":
                        scope.showDilaog(scope.panes["area"], dialogShownChanged, bodyEventCapture, actionButtonCallback);
                        break;
                }
            };
            // while the dialog has been shown, we always load province data.
            var dialogShownChanged = function(isShown) {
                if (isShown) {
                    loadingProvinceData(this);
                }
            };
            // step helper methods. 'loading province data.'
            var loadingProvinceData = function(dialogScope) {
                dialogScope.setFooterButtons(scope.panes["province"].buttons);

                // we need to makesure that the dialog has been shown, and then to get data from server.
                //DOTO,这里每次DATA CHANGE 的时候都会触发 dataConfigChangedFn 事件，这里需要有机制处理.
                utilityService.getProvinceData(function(provinces) {
                    $log.info("allProvinces: ", provinces);
                    var provinceHtml = generateHtml(provinces, "step1");
                    dialogScope.setBodyContent(provinceHtml);
                });
            };
            // step helper methods. 'loading city data.'
            var loadingCityData = function(dialogScope) {

                // the next step available while someof item has been selected. 
                if (scope.provinceBindingTarget) {
                    // set footer buttons.
                    dialogScope.setFooterButtons(scope.panes["city"].buttons);
                    utilityService.getCityData(scope.provinceBindingTarget, function(cities) {
                        var citiesHtml = generateHtml(cities, "step2");
                        dialogScope.setBodyContent(citiesHtml);
                    });
                }
            };
            // step helper methods. 'loading area data.'
            var loadingAreaData = function(dialogScope) {
                if (scope.cityBindingTarget) {
                    dialogScope.setFooterButtons(scope.panes["area"].buttons);
                    utilityService.getAreaData(scope.provinceBindingTarget, scope.cityBindingTarget, function(areas) {
                        var areasHtml = generateHtml(areas, "step3");
                        dialogScope.setBodyContent(areasHtml);
                    });
                }
            };
            // dialog body content event listener.
            var bodyEventCapture = function(event) {
                var target = event.target;
                if (target.tagName.toLowerCase() == "li") {
                    var $li = angular.element(event.target);
                    // var _currentPane = scope.getCurrentPane();
                    // if (_currentPane.lastItem) {
                    //     _currentPane.lastItem.removeClass("selected");
                    // }
                    // make sure exist selected item has been removed.
                    // TOTO perfomance issue here.
                    var $allLi = $li.parent().find("li");
                    for (var i = 0; i < $allLi.length; i++) {
                        var $item = angular.element($allLi[i]);
                        $item.removeClass("selected");
                    };
                    scope.setCurrentPane($li.addClass("selected"), $li[0].dataset["step"], $li[0].dataset["postCode"]);
                }
            };
            // generated the province,city area, data html.
            var generateHtml = function(source, step) {
                var result = ["<div class='dropdown-items'><ul class='list-unstyled'>"];
                // get binding text                
                var currentSelectedTxt = getBindingText(step);
                var attachSelected = true;
                if (source && source.length) {
                    for (var i = 0; i < source.length; i++) {
                        var item = source[i];

                        // post code.
                        var postCode = item["postCode"] ? " data-post-code='" + item["postCode"] + "'" : "";
                        if (attachSelected && item["key"] == currentSelectedTxt) {
                            attachSelected = false;
                            var lastItemHtml = "<li data-step='" + step + "' " + postCode + " class='selected'>" + item["key"] + "</li>";
                            result.push(lastItemHtml);
                        } else {
                            result.push("<li data-step='" + step + "' " + postCode + ">" + item["key"] + "</li>");
                        }
                    };
                }
                // else {
                //     result.push("<li class='selected'>暂无相关选择项，保留为空</li>");
                // }
                result.push("</ul></div>");

                return result.join("");
            };
            var getBindingText = function(step) {
                var find = "";
                switch (step) {
                    case "step1":
                        find = scope.provinceBindingTarget || "";
                        break;
                    case "step2":
                        find = scope.cityBindingTarget || "";
                        break;
                    case "step3":
                        find = scope.areaBindingTarget || "";
                        break;
                }
                return find;

            };
            //now we must make user provider province, city, area all fields must be required.
            //so if one of them is empty, just simple remove all selected options.
            var clearSelectedValue = function() {
                scope.provinceBindingTarget = "";
                scope.cityBindingTarget = "";
                scope.areaBindingTarget = "";
                scope.postCodeBidingTarget = "";
                scope.addressBindingTarget = "";
            };
            var actionButtonCallback = function(action, result) {
                $log.info("action button tapped: ", action, result);
                switch (action) {
                    case "cancel":
                        clearSelectedValue();
                        this.close();
                        break;
                    case "step1":
                        loadingProvinceData(this);
                        break;
                    case "step2":
                        loadingCityData(this);
                        break;
                    case "step3":
                        loadingAreaData(this);
                        break;
                    case "confirm":
                        if (scope.areaBindingTarget) {
                            this.close();
                        }
                        break;
                }
            };
        }],
        link: function(scope, element, attrs) {
            // diabled the input mobile keyboards pop.
            // element.bind("mousedown touchstart", function($event) {
            //     $event.preventDefault();
            //     $event.stopPropagation();
            // });
            element.bind("click", function($event) {
                // default show province dialog ui.
                scope.showDialogUI("step1");
                scope.$apply();
            });

            scope.showDilaog = showAlertDialog;

            function showAlertDialog(stepCfg, dialogShownChanged, bodyEventTrackerFn, callback) {

                // default dialog configuration.
                var _dialogCfg = angular.extend({}, dialogCfg, {
                    body: "数据加载中...",
                    classes: "province-auto-suggest",
                    onDialogShownChanged: dialogShownChanged,
                    onBodyEventTrackerFn: bodyEventTrackerFn,
                    callbackFn: callback
                });

                angular.extend(_dialogCfg, stepCfg);

                scope.$emit("showDialog", _dialogCfg);
            };

            scope.$on('$destroy', function() {
                // scope.
            });
        }
    };
}]);

/**
 * Iframe dialog used to show all the agreements information from outside.
 */
app.directive("iframDialog", ["$log", "dialogDefaultCfg", function($log, dialogCfg) {
    return {
        restrict: 'AC',
        scope: {
            linkKey: "@iframDialog"
        },
        controller: ["$scope", "$log", "agreements", function(scope, $log, agreements) {
            scope.showIFrameDialog = function() {
                var iframeUrl = agreements[scope.linkKey];

                $log.info("iframeUrl: ", iframeUrl);

                var iframe = '<iframe name="aggreement-iframe" src="' + iframeUrl + '" border="0" style="border:none;">';

                if (iframeUrl) {
                    // default dialog configuration.
                    var _dialogCfg = angular.extend({}, dialogCfg, {
                        body: iframe,
                        title: "协议内容",
                        classes: "aggreement-iframe-dialog",
                        callbackFn: actionTapCallback
                    });
                    scope.$emit("showDialog", _dialogCfg);
                    scope.$apply();
                }
            };
            scope.$on('$destroy', function() {
                // scope.
            });

            function actionTapCallback(action, result) {
                switch (action) {
                    case "cancel":
                        clearSelectedValue();
                        this.close();
                        break;
                    case "confirm":
                        if (scope.areaBindingTarget) {
                            this.close();
                        }
                        break;
                }
            }
        }],
        link: function(scope, element, attrs) {
            element.bind("click", function($event) {
                scope.showIFrameDialog();
                $event.stopPropagation();
                $event.preventDefault();
            });
        }
    };
}]);
