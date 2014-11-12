'use strict';

/**
 * @ngdoc overview
 * @name Paf_E90
 * @description
 * # Paf_E90
 *
 * Main module of the application.
 */
var app = angular.module('tl_biz_tools', [
    // 'ngAnimate',
    // 'ngCookies',
    // 'ngResource',
    'ngRoute',
    // 'ngSanitize',
    // 'ngTouch', // the ng touch event has some conflict with ng-quick-date.js about event.
    // 'ngQuickDate',
    // 'ngUpload',
    // 'ui.bootstrap.tabs'
    "ui.bootstrap",
    "ngDialog"
]);

(function (window) {
    window.helper = {};

    helper.file_upload = $("#file_upload");
    helper.fr = new FileReader();
})(window)
