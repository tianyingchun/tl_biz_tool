(function() {
    function LocalHelperService($log, BaseHttpRequest) {

            // each service must be defined this key used to flag current request belong to.
            this.logAPIUniqueKey = "[LocalHelperService]";

            // inherits base http request infrustrature.
            BaseHttpRequest.call(this);

            //
            // --------------------------------------------------
            //  dto
        }
        //
        // Expose service request apis to consumer.
    angular.extend(LocalHelperService.prototype, {
        /**
         * 上传图片
         * [addPictures2Product description]
         * @param {array} pictures  picture ids.
         * @param {object} product   [description]
         */
        addPictures2Product: function(pictures, product, sucess_cb, failed_cb) {
            var promise = this.remoteRequest("/picture/add_pictures", {
                pictures: pictures,
                categoryId: categoryId
            });
            promise.then(sucess_cb, failed_cb || sucess_cb);
        }
    });

    // expose service contract.
    app.service('LocalHelperService', ['$log', 'httpRequest', LocalHelperService]);

})(app);
