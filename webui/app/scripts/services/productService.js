(function() {
    function ProductService($log, BaseHttpRequest) {

            // each service must be defined this key used to flag current request belong to.
            this.logAPIUniqueKey = "[ProductService]";

            // inherits base http request infrustrature.
            BaseHttpRequest.call(this);

            //
            // --------------------------------------------------
            //  dto
            this.productBasicInfoDto = function(result) {
                return {
                    code: result.code,
                    message: result.message,
                    mobile: result.data.phone,
                    name: result.data.name
                };
            };
        }
        //
        // Expose service request apis to consumer.
    angular.extend(ProductService.prototype, {
        //上传产品
        uploadProduct: function(product) {
            var promise = this.postRequest("/product/upload_basic_info", product, this.productBasicInfoDto);
            return promise;
        }
    });

    // expose service contract.
    app.service('ProductService', ['$log', 'httpRequest', ProductService]);

})(app);
