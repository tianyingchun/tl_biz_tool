var utility = require("../../helpers/utility");
var exception = require("../../helpers/exception");
var _ = require('underscore'),
    http = require('http'),
    fs = require("fs-extra");

// product module config.
var module_product_extract_cfg = fs.readJsonSync("../module_config.json").module_product_extract.configs;

function PictureSpiderService() {
    // the product http absolute url.
    this.url = "";

    // current product id.
    this.productId = 0;

    /**
     * start to crawl all pictures of speicifced product url.
     * @return {[type]} [description]
     */
    this.start = function(httpUrl) {
        this.url = httpUrl;
        
        // current product id.
        this.productId = utility.extractProductId(this.url);

        // download product pictures
        var product_description_url = module_product_extract_cfg.product_description_url.value.replace("{pid}", this.productId);
        // run picture spider.
        var _this = this;

        return utility.downloadPicture(this.productId, product_description_url).then(function(result) {
            // flush cached result to client.
            return result;

        }, function(err) {
            return err;
        });
    };
};
module.exports = function() {
    return new PictureSpiderService();
};
