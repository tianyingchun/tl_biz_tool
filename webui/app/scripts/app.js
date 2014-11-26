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

(function(window) {
    window.helper = {};

    helper.file_upload = $("#file_upload");
    helper.fr = new FileReader();

    var resizeTimeoutId;

    // hook dom ready.
    var domReady = (enyo && enyo.ready) || (jQuery && jQuery.ready) || function(fn) {
        fn && fn();
    };
    domReady(function() {

        console.log("enyo || jquery dom ready....");

        var $split = $('#split');
        var $left = $('#left');
        var $right = $('#right');
        var $footer = $('#footer');
        var $header = $('#header');

        $split.mousedown(function() {
            $split.on("mousemove", function(e) {
                var width = e.pageX;
            })
        });
        $split.mouseup(function() {
            $split.off("mousemove", function() {
                console.log("release mousemove");
            });
        });
        $(window).on("load resize", function(e) {
            // alwasy clear frequent resize event trigger.
            clearTimeout(resizeTimeoutId);
            var $window = $(this);
            resizeTimeoutId = setTimeout(function() {
                var $left = $('#left');
                var $right = $('#right');
                var height = $window.height() - $header.outerHeight() - $footer.outerHeight() - 8;
                $left.height(height);
                $right.height(height);
                $split.height(height + 2);
            }, 10);

        });
    });

})(window)
