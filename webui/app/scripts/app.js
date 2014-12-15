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

        var $container   = $(".container-fluid");
        var $left        = $('#left');
        var $split       = $('#split');
        var $right       = $('#right');
        var $header      = $('#header');
        var $footer      = $('#footer');
        var $footerSplit = $('#footerSplit');

        $split.mousedown(function(event) {
            if (event.which == 1){
                $(document).on("selectstart dragstart", function () {
                    console.log("container");
                    return false;
                })
                var clientWidth = $container.width();
                var id = null;
                $(document).on("mousemove", function(e) {
                    clearTimeout(id);
                    id = setTimeout(function () {
                        var leftWidth = (e.pageX) / clientWidth * 100 + '%';
                        var rightWidth = (clientWidth - e.pageX) / clientWidth * 100 + '%';
                        $left.css({width: leftWidth});
                        $split.css({left: leftWidth});
                        $right.css({left: leftWidth, width: rightWidth});
                    }, 10);
                })
            }
        });

        $footerSplit.mousedown(function (event) {
           if (event.which == 1){
                $(document).on("selectstart dragstart", function () {
                    console.log("footer");
                    return false;
                })
                var clientHeight = window.innerHeight;
                var id = null;
                $(document).on("mousemove", function(e) {
                    clearTimeout(id);
                    id = setTimeout(function () {
                        var pageY = e.pageY;
                        if (e.pageY > clientHeight) {
                            pageY = clientHeight;
                        }
                        var containerHeight = pageY - 63;
                        var footerHeight = clientHeight - pageY;
                        $container.height(containerHeight);
                        $left.height(containerHeight);
                        $split.height(containerHeight);
                        $right.height(containerHeight);

                        $footer.height(footerHeight);
                        $footerSplit.css({bottom: footerHeight + 'px'});
                    }, 10);
                })
            } 
        })
        $(document).mouseup(function() {

            $(this).off("mousemove selectstart dragstart");
        });

        $(window).on("load resize", function(e) {
            // alwasy clear frequent resize event trigger.
            clearTimeout(resizeTimeoutId);
            var $window = $(this);
            resizeTimeoutId = setTimeout(function() {
                var height = $container.height() - $footer.height();
                $left.height(height);
                $split.height(height);
                $right.height(height);
            }, 10);

        });
    });

})(window)
