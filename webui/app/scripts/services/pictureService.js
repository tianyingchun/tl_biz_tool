(function () {
    function PictureService($log, BaseHttpRequest) {

        // each service must be defined this key used to flag current request belong to.
        this.logAPIUniqueKey = "[PictureService]";

        // inherits base http request infrustrature.
        BaseHttpRequest.call(this);

        //
        // --------------------------------------------------
        //  dto
    }

    // Expose service request apis to consumer.
    angular.extend(PictureService.prototype, {
        /**
         * 上传图片
         * [addPictures2Product description]
         * @param {array} pictures  picture obj contain url.
         */
        extractPicture: function (picture) {
            var promise = this.postRequest("/picture/auto_extract_product_pictures", picture, {
                timeout: 1000 * 60 * 10
            });
            return promise;
        },

        bindPictureAttr: function (data) {
            var promise = this.postRequest("/picture/auto_sync_product_pictures_2database", data, {
                timeout: 1000 * 60 * 10
            });
            return promise;
        }

    });

    // expose service contract.
    app.service('PictureService', ['$log', 'httpRequest', PictureService]);

})(app);
