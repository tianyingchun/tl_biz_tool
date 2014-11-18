(function() {
    function CatalogService($log, BaseHttpRequest) {

            // each service must be defined this key used to flag current request belong to.
            this.logAPIUniqueKey = "[CatalogService]";

            // inherits base http request infrustrature.
            BaseHttpRequest.call(this);

            //
            // --------------------------------------------------
            //  dto
        }
        //
        // Expose service request apis to consumer.
    angular.extend(CatalogService.prototype, {
        //上传产品
        addProducts2Category: function(product, categoryId) {
            var promise = this.postRequest("/catalog/add_products", {
                product: product,
                categoryId: categoryId
            });
            return promise;
        },

        getAllCatalog: function () {
            var promise = this.postRequest("/utility/get_all_categoris", {}, {cache: true});
            return promise;
        }
    });

    // expose service contract.
    app.service('CatalogService', ['$log', 'httpRequest', CatalogService]);

})(app);
