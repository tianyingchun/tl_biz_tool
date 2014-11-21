var async = require('async');
var logger = require('../../helpers/log');
var utility = require('../../helpers/utility');
var dataProvider = require("../../dataProvider");

var ProductModel = dataProvider.getModel("Product");
var ProductVariantModel = dataProvider.getModel("ProductVariant");
var baseDal = require("../baseDal");
// product attributes dal
var productAttribtsDal = dataProvider.getDataAccess("ProductAttributeDal");

var ProductAttributeModel = dataProvider.getModel("ProductAttribute");

// client product configurations.
var clientProductCfg = dataProvider.getConfig("product").autoupload_config.configs;


function ProductDal() {
    /**
     * 获取指定产品的信息
     * @param  {number} productId 获取指定产品的信息
     */
    this.getProduct = function(productId) {
        var sqlStr = "SELECT Id,Name,ShortDescription,FullDescription,AdminComment,ProductTemplateId,ShowOnHomePage,MetaKeywords,MetaDescription,MetaTitle,AllowCustomerReviews,ApprovedRatingSum,NotApprovedRatingSum,ApprovedTotalReviews,NotApprovedTotalReviews,SubjectToAcl,Published,Deleted,CreatedOnUtc,UpdatedOnUtc FROM  dbo.Product WHERE id={0}";
        return baseDal.executeList(ProductModel, [sql, productId]);
    };

    /**
     * 根据Product sku获取ProductVariant 对象
     * @param  {string} sku 产品唯一的SKU 编号
     */
    this.getProductVariantBySku = function(sku) {
        var sql = "SELECT Id,ProductId,Name,Sku,[Description],AdminComment,ManufacturerPartNumber," +
            " Gtin,IsGiftCard,GiftCardTypeId,RequireOtherProducts,RequiredProductVariantIds," +
            " AutomaticallyAddRequiredProductVariants,IsDownload,DownloadId,UnlimitedDownloads," +
            " MaxNumberOfDownloads,DownloadExpirationDays,DownloadActivationTypeId,HasSampleDownload," +
            " WithDeliveryFee,SampleDownloadId,HasUserAgreement,UserAgreementText,IsRecurring,RecurringCycleLength," +
            " RecurringCyclePeriodId,RecurringTotalCycles,IsShipEnabled,IsFreeShipping," +
            " AdditionalShippingCharge,IsTaxExempt,TaxCategoryId,ManageInventoryMethodId," +
            " StockQuantity,DisplayStockQuantity,MinStockQuantity,LowStockActivityId,NotifyAdminForQuantityBelow," +
            " BackorderModeId,AllowBackInStockSubscriptions,OrderMinimumQuantity,OrderMaximumQuantity,AllowedQuantities,DisableBuyButton,DisableWishlistButton," +
            " CallForPrice,Price,OldPrice,ProductCost,SpecialPrice,SpecialPriceStartDateTimeUtc," +
            " SpecialPriceEndDateTimeUtc,CustomerEntersPrice,MinimumCustomerEnteredPrice,MaximumCustomerEnteredPrice," +
            " [Weight],[Length],Width,Height,PictureId,AvailableStartDateTimeUtc,AvailableEndDateTimeUtc," +
            " Published,Deleted,DisplayOrder,CreatedOnUtc,UpdatedOnUtc,AvailableForPreOrder,SourceUrl,SourceInfoComment" +
            " FROM dbo.ProductVariant  WHERE Deleted=0 AND Published=1 AND Sku={0}";
        return baseDal.executeEntity(ProductVariantModel, [sql, sku])
    };
    /**
     * 根据Product variant id获取ProductVariant 对象
     * @param  {number} productVariantId 产品variantId
     */
    this.getProductVariantByVariantId = function(productVariantId) {
        var sql = "SELECT Id,ProductId,Name,Sku,[Description],AdminComment,ManufacturerPartNumber," +
            " Gtin,IsGiftCard,GiftCardTypeId,RequireOtherProducts,RequiredProductVariantIds," +
            " AutomaticallyAddRequiredProductVariants,IsDownload,DownloadId,UnlimitedDownloads," +
            " MaxNumberOfDownloads,DownloadExpirationDays,DownloadActivationTypeId,HasSampleDownload," +
            " WithDeliveryFee,SampleDownloadId,HasUserAgreement,UserAgreementText,IsRecurring,RecurringCycleLength," +
            " RecurringCyclePeriodId,RecurringTotalCycles,IsShipEnabled,IsFreeShipping," +
            " AdditionalShippingCharge,IsTaxExempt,TaxCategoryId,ManageInventoryMethodId," +
            " StockQuantity,DisplayStockQuantity,MinStockQuantity,LowStockActivityId,NotifyAdminForQuantityBelow," +
            " BackorderModeId,AllowBackInStockSubscriptions,OrderMinimumQuantity,OrderMaximumQuantity,AllowedQuantities,DisableBuyButton,DisableWishlistButton," +
            " CallForPrice,Price,OldPrice,ProductCost,SpecialPrice,SpecialPriceStartDateTimeUtc," +
            " SpecialPriceEndDateTimeUtc,CustomerEntersPrice,MinimumCustomerEnteredPrice,MaximumCustomerEnteredPrice," +
            " [Weight],[Length],Width,Height,PictureId,AvailableStartDateTimeUtc,AvailableEndDateTimeUtc," +
            " Published,Deleted,DisplayOrder,CreatedOnUtc,UpdatedOnUtc,AvailableForPreOrder,SourceUrl,SourceInfoComment" +
            " FROM dbo.ProductVariant  WHERE Deleted=0 AND Published=1 AND Id={0}";
        return baseDal.executeEntity(ProductVariantModel, [sql, productVariantId]);
    };
    /**
     * 添加新产品信息到数据库
     * @param {object} product 产品实例
     */
    this.addNewProduct = function(product, productVariant) {
        var deferred = Q.defer();
        // 1.  step1. insert product basic information.
        insertProduct(product).then(function(newProduct) {

            if (newProduct.Id) {
                async.series(
                    [
                        function(callback) {
                            var default_manufacturerids = clientProductCfg.defaultManufacturerId.value;

                            logger.debug("default_manufacturerids: ", default_manufacturerids);

                            // step2. add product to manufactuer.
                            addProductIntoManufacturer(newProduct.Id, default_manufacturerids).then(function() {
                                callback();
                            }, function(err) {
                                callback(err);
                            });
                        },
                        function(callback) {
                            // step3. add product variant.
                            insertProductVariant(newProduct, productVariant).then(function(newProductVariant) {
                                // add tier price.
                                insertProductVariantTierPrice(newProductVariant).then(function() {
                                    // add tier product variant attributes.
                                    insertProductVariantAttributes(newProductVariant).then(function() {
                                        callback();
                                    }, function(err) {
                                        callback(err);
                                    });
                                }, function(err) {
                                    callback(err);
                                });
                            }, function(err) {
                                callback(err);
                            });
                        }
                    ],
                    function(err, results) {
                        logger.debug("addNewProduct async series completed!");
                        deferred.resove("success");
                    });

            } else {
                deferred.reject("failed,can't find the new uploaded product id !");
            }
        });
        return deferred.promise;
    };

    //
    // helper methods.
    // -----------------------------------------------------------------
    // 
    function insertProduct(product) {
        var preFix = "Need To Refine :";
        //Short Description.
        product.ShortDescription = preFix + product.ShortDescription;
        //Insert Product
        var sql = "INSERT INTO Product ( Name , ShortDescription ,  FullDescription , AdminComment , ProductTemplateId ," +
            " ShowOnHomePage , MetaKeywords , MetaDescription , MetaTitle ," +
            " AllowCustomerReviews , ApprovedRatingSum , NotApprovedRatingSum ," +
            " ApprovedTotalReviews , NotApprovedTotalReviews ,SubjectToAcl, Published , Deleted , CreatedOnUtc , UpdatedOnUtc )" +
            " VALUES  ( {0},{1},{2},{3},{4},{5},{6},{7},{8},{9},{10},{11},{12},{13},{14},{15},{16},{17},{18} );SELECT SCOPE_IDENTITY() AS Id;";

        return base.executeEntity(ProductModel, [sql, product.Name, product.ShortDescription, product.FullDescription, product.AdminComment, product.ProductTemplateId,
            product.ShowOnHomePage, product.MetaKeywords, product.MetaDescription, product.MetaTitle,
            product.AllowCustomerReviews, product.ApprovedRatingSum, product.NotApprovedRatingSum,
            product.ApprovedTotalReviews, product.NotApprovedTotalReviews, product.SubjectToAcl, product.Published, product.Deleted, product.CreatedOnUtc, product.UpdatedOnUtc
        ]).then(function success(newProduct) {
            if (newProduct != null) {
                product.Id = newProduct.Id;
            }
            return product;
        });
    };
    /**
     * 添加当前产品到执行的 manufacturer.
     * @param {number} productId             产品ID
     * @param {number} defaultManufacturerId 指定的品牌ID
     */
    function addProductIntoManufacturer(productId, defaultManufacturerId) {
        var sql = "INSERT INTO Product_Manufacturer_Mapping  ( ProductId , ManufacturerId , IsFeaturedProduct , DisplayOrder)" +
            "VALUES({0},{1},{2},{3});";
        return baseDal.executeNoneQuery([sql, productId, defaultManufacturerId, false, 0]);
    };
    /**
     * 添加ProductVariant 子产品信息
     * @param  {object} product ProductModel instance.
     * @param  {object} variant ProductVariantModel instance.
     * @return {promise}promise with parameter
     */
    function insertProductVariant(product, variant) {
        var preFix = "Need To Refine :";
        variant.ProductId = product.Id;
        variant.Name = preFix + product.Name;
        variant.Description = preFix + variant.Description;
        //InsertProductVariant
        var sql = "INSERT INTO dbo.ProductVariant ( ProductId , Name ,  Sku ,  [Description] ,  AdminComment ," +
            " ManufacturerPartNumber ,   Gtin ,  IsGiftCard ,   GiftCardTypeId ," +
            " RequireOtherProducts ,  RequiredProductVariantIds , AutomaticallyAddRequiredProductVariants ," +
            " IsDownload , DownloadId ,  UnlimitedDownloads , MaxNumberOfDownloads ," +
            " DownloadExpirationDays , DownloadActivationTypeId , HasSampleDownload , SampleDownloadId ," +
            " HasUserAgreement ,  UserAgreementText , IsRecurring ,  RecurringCycleLength ," +
            " RecurringCyclePeriodId , RecurringTotalCycles , IsShipEnabled , IsFreeShipping , AdditionalShippingCharge ," +
            " WithDeliveryFee , IsTaxExempt ,  TaxCategoryId , ManageInventoryMethodId , StockQuantity ," +
            " DisplayStockAvailability , DisplayStockQuantity ,  MinStockQuantity , LowStockActivityId ," +
            " NotifyAdminForQuantityBelow , BackorderModeId , AllowBackInStockSubscriptions ," +
            " OrderMinimumQuantity , OrderMaximumQuantity ,AllowedQuantities, DisableBuyButton , DisableWishlistButton , CallForPrice ," +
            " Price ,  OldPrice , ProductCost ,  SpecialPrice , SpecialPriceStartDateTimeUtc , SpecialPriceEndDateTimeUtc ," +
            " CustomerEntersPrice ,  MinimumCustomerEnteredPrice , MaximumCustomerEnteredPrice , [Weight] ,[Length] ," +
            " Width , Height , PictureId ,  AvailableStartDateTimeUtc , AvailableEndDateTimeUtc ," +
            " Published ,  Deleted , DisplayOrder , CreatedOnUtc , UpdatedOnUtc ,  AvailableForPreOrder , SourceUrl , SourceInfoComment" +
            ") VALUES  ({0},{1},{2},{3},{4},{5},{6},{7},{8},{9},{10},{11},{12},{13},{14},{15},{16},{17},{18},{19},{20}," +
            "{21},{22},{23},{24},{25},{26},{27},{28},{29},{30},{31}," +
            "{32},{33},{34},{35},{36},{37},{38},{39},{40},{41},{42},{43},{44},{45},{46},{47},{48},{49},{50},{51}," +
            "{52},{53},{54},{55},{56},{57},{58},{59},{60},{61},{62},{63},{64},{65},{66},{67},{68},{69},{70});SELECT SCOPE_IDENTITY() AS Id;";
        return baseDal.executeEntity(ProductVariantModel, [sql, variant.ProductId, variant.Name, variant.Sku, variant.Description, variant.AdminComment,
            variant.ManufacturerPartNumber, variant.Gtin, variant.IsGiftCard, variant.GiftCardTypeId,
            variant.RequireOtherProducts, variant.RequiredProductVariantIds, variant.AutomaticallyAddRequiredProductVariants,
            variant.IsDownload, variant.DownloadId, variant.UnlimitedDownloads, variant.MaxNumberOfDownloads,
            variant.DownloadExpirationDays, variant.DownloadActivationTypeId, variant.HasSampleDownload, variant.SampleDownloadId,
            variant.HasUserAgreement, variant.UserAgreementText, variant.IsRecurring, variant.RecurringCycleLength,
            variant.RecurringCyclePeriodId, variant.RecurringTotalCycles, variant.IsShipEnabled, variant.IsFreeShipping, variant.AdditionalShippingCharge, variant.WithDeliveryFee,
            variant.IsTaxExempt, variant.TaxCategoryId, variant.ManageInventoryMethodId, variant.StockQuantity,
            variant.DisplayStockAvailability, variant.DisplayStockQuantity, variant.MinStockQuantity, variant.LowStockActivityId,
            variant.NotifyAdminForQuantityBelow, variant.BackorderModeId, variant.AllowBackInStockSubscriptions,
            variant.OrderMinimumQuantity, variant.OrderMaximumQuantity, variant.AllowedQuantities, variant.DisableBuyButton, variant.DisableWishlistButton, variant.CallForPrice,
            variant.Price, variant.OldPrice, variant.ProductCost, variant.SpecialPrice, variant.SpecialPriceStartDateTimeUtc, variant.SpecialPriceEndDateTimeUtc,
            variant.CustomerEntersPrice, variant.MinimumCustomerEnteredPrice, variant.MaximumCustomerEnteredPrice, variant.Weight, variant.Length,
            variant.Width, variant.Height, variant.PictureId, variant.AvailableStartDateTimeUtc, variant.AvailableEndDateTimeUtc,
            variant.Published, variant.Deleted, variant.DisplayOrder, variant.CreatedOnUtc, variant.UpdatedOnUtc, variant.AvailableForPreOrder, variant.SourceUrl, variant.SourceInfoComment
        ]).then(function(newVariant) {
            if (newVariant != null) {
                variant.Id = newVariant.Id;
            }
            return variant;
        });
    };
    /**
     * 添加产品的Tier Price 给ProductVariant
     * @param  {object} newVariant ProductVariantModel instance.
     */
    function insertProductVariantTierPrice(newVariant) {
        var sqlTierPrice = "INSERT INTO dbo.TierPrice" +
            "(ProductVariantId ,CustomerRoleId,Quantity,Price) " +
            "VALUES({0},{1},{2},{3})";
        var sql = [];
        for (var i = 0; i < newVariant.TierPrices.length; i++) {
            var item = newVariant.TierPrices[i];
            sql.push(utility.stringFormatSql.apply(this, [sqlTierPrice, newVariant.Id, null, item.Quantity, item.Price]));
        };
        return baseDal.executeNoneQuery([sql.join(";")]);
    };
    /**
     * 添加ProductVariant 的attributes 信息,e.g. colorList, sizeList.
     * @param  {object} newVariant ProductVariantModel instance.
     */
    function insertProductVariantAttributes(newVariant) {
        var sqlStr = "INSERT INTO dbo.ProductVariant_ProductAttribute_Mapping " +
            "(ProductVariantId , ProductAttributeId ,TextPrompt,IsRequired ,AttributeControlTypeId , DisplayOrder)" +
            " VALUES ({0},{1},{2},{3},{4},{5}); SELECT SCOPE_IDENTITY() AS Id; ";
        var deferred = Q.defer();

        productAttribtsDal.getAttributControlTypeIds().then(function(paIds) {
            // { "color": 40, "size": 1, "other": 1 }
            var productAttributeIds = paIds;
            // all attributs. {"color": [  { "title": "Black", "value": "000" }],"size"...}
            var productAttribts = newVariant.ProductAttribts;

            var productAttribtsKeys = Object.keys(productAttribts);

            async.eachSeries(productAttribtsKeys, function(key, callback) {
                var controlTypeId = productAttributeIds[key.toLowerCase()] || productAttributeIds["other"];
                var promptText = utility.capitalize(key);
                var _productAttribute = new ProductAttributeModel(promptText, "auto created by tool");
                // create product attribute item.
                productAttribtsDal.autoCreatedIfNotExist(_productAttribute).then(function success(newProductAttribute) {
                    // 执行DB EXEC.
                    // 
                    var PVAMapping = require("../models/PVAMapping");
                    // add new record to [ProductVariant_ProductAttribute_Mapping]
                    baseDal.executeEntity(PVAMapping, [sqlStr, newVariant.Id, newProductAttribute.Id, promptText, true, controlTypeId, 0]).then(function(pvaMapping) {

                        // color:[{ "title": "Black", "value": "000" }]
                        var sql = [];

                        var _productVariantAttribute_values_sql = "INSERT INTO dbo.ProductVariantAttributeValue( ProductVariantAttributeId , Name , ColorSquaresRgb ,  PriceAdjustment , WeightAdjustment , IsPreSelected , DisplayOrder)VALUES  ({0},{1},{2},{3},{4},{5},{6})";

                        for (var i = 0; i < productAttribts[key].length; i++) {
                            // color|size...
                            var _productVariantOption = productAttribts[key][i];
                            // speical deal with color option.
                            var colorSqureRgb = key.toLowerCase() == "color" ? "#" + _productVariantOption.value : "";
                            sql.push(utility.stringFormatSql(_productVariantAttribute_values_sql, pvaMapping.Id, _productVariantOption.title, colorSqureRgb, 0, 0, false, 0));
                        }
                        baseDal.executeNoneQuery([sql.join(";")]).then(function() {
                            callback();
                        }, function(err) {
                            logger.error("insert ProductVariantAttributeValue table error: ", err);
                            callback();
                        });
                    }, function(err) {
                        logger.error("PVAMapping error: ", err);
                        callback();
                    });
                }, function(err) {
                    logger.error("autoCreatedIfNotExist error: ", err);
                    callback();
                });
            }, function finnaly(err, results) {
                // 
                deferred.resolve(results);
            });
        }, function(err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
}
module.exports = ProductDal;
