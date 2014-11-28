var async = require('async');
var Q = require("q");
var _ = require("underscore");
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
            " FROM dbo.ProductVariant WHERE Sku={0}";
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
            " FROM dbo.ProductVariant  WHERE Id={0}";
        return baseDal.executeEntity(ProductVariantModel, [sql, productVariantId]);
    };
    /**
     * add product category mappings.
     * @param {array} categoryIds required, passed target category id, auto add all category mapping for this product
     */
    this.addProductCategoryMappings = function(productId, categoryIds) {
        var checkExistRecordSql = "SELECT  * FROM  Product_Category_Mapping WHERE ProductId={0} AND CategoryId = {1}";
        var insertSql = "INSERT INTO Product_Category_Mapping( ProductId ,CategoryId ,IsFeaturedProduct ,DisplayOrder)VALUES ({0},{1},{2},{3})";
        // finnaly sql command string.
        var sql = "IF NOT EXISTS (" + checkExistRecordSql + ") BEGIN " + insertRecordSql + "END";
        var finalSql = [];
        var params = [];
        var seed = 4;
        if (_.isArray(categoryIds)) {
            for (var i = 0; i < categoryIds.length; i++) {
                var categoryId = categoryIds[i];
                if (i == 0) {
                    finalSql.push(sql);
                } else {
                    var _tmp = sql;
                    for (var j = 0; j < seed; j++) {
                        _tmp = _tmp.replace(/"{" + j + "}"/g, "{" + (i * seed + j) + "}");
                    };
                    finalSql.push(_tmp);
                }
                params.push(productId, categoryId, false, 0);
            };
            params.unshift(finalSql.join(";"));

            return baseDal.executeNoneQuery(params);
        } else {
            logger.error("We must give not empty array with parameter in addProductCategoryMappings!");
            
            return baseDal.promise("We must give not empty array with parameter in addProductCategoryMappings()!");
        }
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
                // save all related product information tasks.
                var productRelatedInfoTasks = [];
                // add products to manafactureres
                productRelatedInfoTasks.push(function(callback) {
                    var default_manufacturerids = clientProductCfg.defaultManufacturerId.value;

                    logger.debug("default_manufacturerids: ", default_manufacturerids);

                    addProductIntoManufacturer(newProduct.Id, default_manufacturerids).then(function() {
                        callback(null, "addProductIntoManufacturer->success");
                    }, function(err) {
                        logger.error("addProductIntoManufacturer error:", err);
                        callback(err);
                    });
                });
                // add product specification attributes.
                // productRelatedInfoTasks.push(function(callback) {

                //     insertProductSpecificationAttributes(newProduct).then(function(result) {
                //         callback(null, "insertProductSpecificationAttributes->success");
                //     }, function(err) {
                //         logger.error("insertProductSpecificationAttributes error:", err);
                //         callback(err);
                //     });
                // });
                // add product variant information and its' related information.
                productRelatedInfoTasks.push(function(callback) {
                    // step3. add product variant.
                    insertProductVariant(newProduct, productVariant).then(function(newProductVariant) {
                        // run product variant related info tasks.
                        async.parallel([
                            function(callback) {
                                insertProductVariantTierPrice(newProductVariant).then(function() {
                                    callback(null, "insertProductVariantTierPrice success!");
                                }, function(err) {
                                    callback(err);
                                });
                            },
                            function(callback) {
                                insertProductVariantAttributes(newProductVariant).then(function() {
                                    callback(null, "insertProductVariantAttributes success!");
                                }, function(err) {
                                    callback(err);
                                });
                            }
                        ], function(err, results) {
                            logger.debug("async.parallel within addNewProduct finished!", results);
                            callback();
                        });
                    }, function(err) {
                        logger.error("insertProductVariant error:", err);
                        callback(err);
                    });
                });
                // run all tasks.
                async.parallel(productRelatedInfoTasks, function(err, results) {
                    // if has error here, throw it.
                    if (err) {
                        deferred.reject(err);
                    } else {
                        logger.debug("addNewProduct() all tasks has been done success");
                        deferred.resolve(results);
                    }
                });
            } else {
                deferred.reject(new Error("insertProduct(product) failed,can't find the new uploaded product id !"));
            }
        }, function(err) {
            logger.debug("failed, add new product basic info to `product` table failed !");
            deferred.reject(err);
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

        return baseDal.executeEntity(ProductModel, [sql, product.Name, product.ShortDescription, product.FullDescription, product.AdminComment, product.ProductTemplateId,
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
        var sqlTierPrice = "INSERT INTO dbo.TierPrice (ProductVariantId ,CustomerRoleId,Quantity,Price) VALUES({0},{1},{2},{3})";

        var tierPrice = newVariant.TierPrices;
        var sql = [];
        var params = [];
        var seed = 4;

        logger.debug("tierPrice:", tierPrice);

        for (var i = 0; i < tierPrice.length; i++) {
            var item = tierPrice[i];
            if (i == 0) {
                sql.push(sqlTierPrice);
            } else {
                var _tmp = sqlTierPrice;
                for (var j = 0; j < seed; j++) {
                    _tmp = _tmp.replace("{" + j + "}", "{" + (i * seed + j) + "}");
                };
                sql.push(_tmp);
            }
            params.push(newVariant.Id, null, item.Quantity, item.Price);
        };
        params.unshift(sql.join(";"));

        return baseDal.executeNoneQuery(params);
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
                    logger.debug("current product attribute: ", newProductAttribute);

                    var PVAMapping = dataProvider.getModel("PVAMapping");
                    // add new record to [ProductVariant_ProductAttribute_Mapping]
                    baseDal.executeEntity(PVAMapping, [sqlStr, newVariant.Id, newProductAttribute.Id, promptText, true, controlTypeId, 0]).then(function(pvaMapping) {

                        // color:[{ "title": "Black", "value": "000" }]
                        var _productVariantAttribute_values_sql = "INSERT INTO dbo.ProductVariantAttributeValue( ProductVariantAttributeId , Name , ColorSquaresRgb ,  PriceAdjustment , WeightAdjustment , IsPreSelected , DisplayOrder)VALUES  ({0},{1},{2},{3},{4},{5},{6})";
                        // product attributes.
                        var productAttribtsList = productAttribts[key];
                        var sql = [];
                        var params = [];
                        var seed = 7;

                        for (var i = 0; i < productAttribtsList.length; i++) {
                            // color|size...
                            var _productVariantOption = productAttribtsList[i];
                            // speical deal with color option.
                            var colorSqureRgb = key.toLowerCase() == "color" ? "#" + _productVariantOption.value : "";

                            if (i == 0) {
                                sql.push(_productVariantAttribute_values_sql);
                            } else {
                                var _tmp = _productVariantAttribute_values_sql;
                                for (var j = 0; j < seed; j++) {
                                    _tmp = _tmp.replace("{" + j + "}", "{" + (i * seed + j) + "}");
                                };
                                sql.push(_tmp);
                            }
                            params.push(pvaMapping.Id, _productVariantOption.title, colorSqureRgb, 0, 0, false, 0);
                        };
                        params.unshift(sql.join(";"));

                        baseDal.executeNoneQuery(params).then(function() {
                            callback(null, "Insert ProductVariant Attribute ok!");
                        }, function(err) {
                            logger.error("Invoke Insert ProductVariantAttributeValue table Error: ", err);
                            callback("Insert ProductVariantAttributeValue failed!");
                        });
                    }, function(err) {
                        logger.error("Inoke Insert ProductVariant_ProductAttribute_Mapping Error: ", err);
                        callback("Inoke Insert ProductVariant_ProductAttribute_Mapping failed!");
                    });
                }, function(err) {
                    logger.error("Invoke AutoCreatedIfNotExist Error: ", err);
                    callback("Insert ProductVariant Attribute failed!" + key);
                });
            }, function finnaly(err, results) {
                logger.debug("InsertProductVariantAttributes finished!", results);
                deferred.resolve(results);
            });
        }, function(err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    /**
     * Add specification attributes of current product.
     * @param  {object}   newProduct Product instance.
     * @return {promise}
     */
    function insertProductSpecificationAttributes(newProduct) {

    };
}
module.exports = ProductDal;