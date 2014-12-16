var utility = require("../../../helpers/utility");
var exception = require("../../../helpers/exception");
var logger = require("../../../helpers/log");
var Q = require("q");
// data provider singleton.
var dataProvider = require("../../../dataProvider");

// picture configurations.
var pictureCfg = dataProvider.getConfig("picture");

function PictureSpiderService() {
    /**
     * start to crawl all pictures of speicifced product url.
     * @return {promise}
     */
    this.crawlPictures = function(httpUrl, destDir) {
        // current product id.
        this.productId = utility.extractProductId(httpUrl);

        var picture_source_url = dataProvider.getConfigNode(pictureCfg, "crawl_config", "picture_source_url");

        if (!picture_source_url) {
            logger.error("can't fetch picture source url from picture_config.json!");
            var deferred = Q.defer();
            deferred.reject("can't fetch picture source url from picture_config.json!");
            return deferred.promise();
        } else {
            // download product pictures
            picture_source_url = picture_source_url.replace("{pid}", this.productId);
            // run picture spider.

            return utility.downloadPicture(this.productId, picture_source_url, destDir).then(function(result) {
                // flush cached result to client.
                return result;

            }, function(err) {
                return err;
            });
        }
    };
};
module.exports = PictureSpiderService;
