var async = require('async');
var Q = require("q");
var _ = require("underscore");
var logger = require('../../helpers/log');
var utility = require('../../helpers/utility');
var dataProvider = require("../../dataProvider");
var ProductModel = dataProvider.getModel("Product");
var baseDal = require("../baseDal");

var SpecificationAttributeModel = dataProvider.getModel("SpecificationAttribute");
var SpecificationAttributeOptionModel = dataProvider.getModel("SpecificationAttributeOption");
var Product_SpecificationAttribute_MappingModel = dataProvider.getModel("Product_SpecificationAttribute_Mapping");
var ProductAttributeModel = dataProvider.getModel("ProductAttribute");
var ProductPictureModel = dataProvider.getModel("ProductPicture");

function ProductDal() {
    /**
     * 获取指定产品的信息
     * @param  {number} productId 获取指定产品的信息
     */
    this.getProduct = function(productId) {
        var sql = "Id,ProductTypeId,ParentGroupedProductId,VisibleIndividually,Name,ShortDescription,FullDescription,ProductTemplateId,VendorId,ShowOnHomePage,MetaKeywords,MetaDescription,MetaTitle,AllowCustomerReviews,ApprovedRatingSum,NotApprovedRatingSum,ApprovedTotalReviews,NotApprovedTotalReviews,SubjectToAcl,LimitedToStores,Sku,ManufacturerPartNumber,Gtin,IsGiftCard,GiftCardTypeId,RequireOtherProducts,RequiredProductIds,AutomaticallyAddRequiredProducts,IsDownload,DownloadId,UnlimitedDownloads,MaxNumberOfDownloads,DownloadExpirationDays,DownloadActivationTypeId,HasSampleDownload,SampleDownloadId,HasUserAgreement,UserAgreementText,IsRecurring,RecurringCycleLength,RecurringCyclePeriodId,RecurringTotalCycles,IsRental,RentalPriceLength,RentalPricePeriodId,IsShipEnabled,IsFreeShipping,ShipSeparately,AdditionalShippingCharge,DeliveryDateId,IsTaxExempt,TaxCategoryId,IsTelecommunicationsOrBroadcastingOrElectronicServices,ManageInventoryMethodId,UseMultipleWarehouses,WarehouseId,StockQuantity,DisplayStockAvailability,DisplayStockQuantity,MinStockQuantity,LowStockActivityId,NotifyAdminForQuantityBelow,BackorderModeId,AllowBackInStockSubscriptions,OrderMinimumQuantity,OrderMaximumQuantity,AllowedQuantities,AllowAddingOnlyExistingAttributeCombinations,DisableBuyButton,DisableWishlistButton,AvailableForPreOrder,PreOrderAvailabilityStartDateTimeUtc,CallForPrice,Price,OldPrice,SourcePrice,ProductCost,SpecialPrice,SpecialPriceStartDateTimeUtc,SpecialPriceEndDateTimeUtc,CustomerEntersPrice,MinimumCustomerEnteredPrice,MaximumCustomerEnteredPrice,HasTierPrices,HasDiscountsApplied,Weight,Length,Width,Height,AvailableStartDateTimeUtc,AvailableEndDateTimeUtc,DisplayOrder,Published,Deleted,CreatedOnUtc,UpdatedOnUtc,SourceUrl,SourceInfoComment FROM  Product WHERE id={0}";
        return baseDal.executeEntity(ProductModel, [sql, productId]);
    };

    /**
     * 根据Product sku获取Product 对象
     * @param  {string} sku 产品唯一的SKU 编号
     */
    this.getProductBySku = function(sku) {
        var sql = "Id,ProductTypeId,ParentGroupedProductId,VisibleIndividually,Name,ShortDescription,FullDescription,ProductTemplateId,VendorId,ShowOnHomePage,MetaKeywords,MetaDescription,MetaTitle,AllowCustomerReviews,ApprovedRatingSum,NotApprovedRatingSum,ApprovedTotalReviews,NotApprovedTotalReviews,SubjectToAcl,LimitedToStores,Sku,ManufacturerPartNumber,Gtin,IsGiftCard,GiftCardTypeId,RequireOtherProducts,RequiredProductIds,AutomaticallyAddRequiredProducts,IsDownload,DownloadId,UnlimitedDownloads,MaxNumberOfDownloads,DownloadExpirationDays,DownloadActivationTypeId,HasSampleDownload,SampleDownloadId,HasUserAgreement,UserAgreementText,IsRecurring,RecurringCycleLength,RecurringCyclePeriodId,RecurringTotalCycles,IsRental,RentalPriceLength,RentalPricePeriodId,IsShipEnabled,IsFreeShipping,ShipSeparately,AdditionalShippingCharge,DeliveryDateId,IsTaxExempt,TaxCategoryId,IsTelecommunicationsOrBroadcastingOrElectronicServices,ManageInventoryMethodId,UseMultipleWarehouses,WarehouseId,StockQuantity,DisplayStockAvailability,DisplayStockQuantity,MinStockQuantity,LowStockActivityId,NotifyAdminForQuantityBelow,BackorderModeId,AllowBackInStockSubscriptions,OrderMinimumQuantity,OrderMaximumQuantity,AllowedQuantities,AllowAddingOnlyExistingAttributeCombinations,DisableBuyButton,DisableWishlistButton,AvailableForPreOrder,PreOrderAvailabilityStartDateTimeUtc,CallForPrice,Price,OldPrice,SourcePrice,ProductCost,SpecialPrice,SpecialPriceStartDateTimeUtc,SpecialPriceEndDateTimeUtc,CustomerEntersPrice,MinimumCustomerEnteredPrice,MaximumCustomerEnteredPrice,HasTierPrices,HasDiscountsApplied,Weight,Length,Width,Height,AvailableStartDateTimeUtc,AvailableEndDateTimeUtc,DisplayOrder,Published,Deleted,CreatedOnUtc,UpdatedOnUtc,SourceUrl,SourceInfoComment" +
            " FROM dbo.Product WHERE Sku={0}";
        return baseDal.executeEntity(ProductModel, [sql, sku])
    };
    /**
     * add product picture mappings.
     * @param {array} pictures [{pictureId:1111, displayOrder:0}]  required, passed target picture id, auto add all pictures mapping for this product
     */
    this.addProductPictureMappings = function(productId, pictures) {
        var checkExistRecordSql = "SELECT * FROM Product_Picture_Mapping WHERE ProductId ={0} AND PictureId={1} ";
        var insertRecordSql = "INSERT INTO dbo.Product_Picture_Mapping( ProductId ,PictureId ,DisplayOrder) VALUES  ( {0},{1},{2}) ";
        var deferred = Q.defer();

        // finnaly sql command string.
        var sql = "IF NOT EXISTS (" + checkExistRecordSql + ") BEGIN " + insertRecordSql + " END ";

        var finalSql = [];
        var params = [];
        var seed = 3;
        if (_.isArray(pictures)) {
            for (var i = 0; i < pictures.length; i++) {
                var picture = pictures[i];
                if (i == 0) {
                    finalSql.push(sql);
                } else {
                    var _tmp = sql;
                    for (var j = 0; j < seed; j++) {
                        var replaceRegex = new RegExp('\\{' + j + '\\}', "g");
                        _tmp = _tmp.replace(replaceRegex, "{" + (i * seed + j) + "}");
                    };
                    finalSql.push(_tmp);
                }
                params.push(productId, picture.pictureId, picture.displayOrder);
            }
            params.unshift(finalSql.join(";"));

            baseDal.executeNoneQuery(params).then(function(result) {

                deferred.resolve({
                    result: "AddProduct Picture Mappings success",
                    productId: productId,
                    Pictures: pictures
                });

            }, function(err) {
                deferred.reject(err);
            });
        } else {
            logger.error("We must give not empty array with parameter in addProductPictureMappings!");

            deferred.reject("We must give not empty array with parameter in addProductPictureMappings()!");
        }
        return deferred.promise;
    };
    /**
     * add product category mappings.
     * @param {array} categoryIds required, passed target category id, auto add all category mapping for this product
     */
    this.addProductCategoryMappings = function(productId, categoryIds) {
        var checkExistRecordSql = "SELECT  * FROM  Product_Category_Mapping WHERE ProductId={0} AND CategoryId = {1} ";
        var insertRecordSql = "INSERT INTO Product_Category_Mapping( ProductId ,CategoryId ,IsFeaturedProduct ,DisplayOrder)VALUES ({0},{1},{2},{3})";

        var deferred = Q.defer();

        // finnaly sql command string.
        var sql = "IF NOT EXISTS (" + checkExistRecordSql + ") BEGIN " + insertRecordSql + " END ";
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
                        var replaceRegex = new RegExp('\\{' + j + '\\}', "g");
                        _tmp = _tmp.replace(replaceRegex, "{" + (i * seed + j) + "}");
                    };
                    finalSql.push(_tmp);
                }
                params.push(productId, categoryId, false, 0);
            };
            params.unshift(finalSql.join(";"));

            baseDal.executeNoneQuery(params).then(function(result) {

                deferred.resolve("AddProduct Category Mappings success, productId: `" + productId + "`, categoryIds: " + JSON.stringify(categoryIds));

            }, function(err) {
                deferred.reject(err);
            });
        } else {
            logger.error("We must give not empty array with parameter in addProductCategoryMappings!");

            deferred.reject("We must give not empty array with parameter in addProductCategoryMappings()!");
        }
        return deferred.promise;
    };
    /**
     * 添加当前产品到执行的 manufacturer.
     * @param {number} productId             产品ID
     * @param {number} defaultManufacturerId 指定的品牌ID
     */
    this.addProductManufacturerMappings = function(productId, manufacturerIds) {
        var insertRecordSql = "INSERT INTO Product_Manufacturer_Mapping  ( ProductId , ManufacturerId , IsFeaturedProduct , DisplayOrder)" +
            "VALUES({0},{1},{2},{3}) ";
        var checkExistRecordSql = "SELECT  * FROM  Product_Manufacturer_Mapping WHERE ProductId={0} AND ManufacturerId = {1}";
        // finnaly sql command string.
        var sql = "IF NOT EXISTS (" + checkExistRecordSql + ") BEGIN " + insertRecordSql + " END ";

        var deferred = Q.defer();

        var finalSql = [];
        var params = [];
        var seed = 4;

        if (_.isArray(manufacturerIds)) {
            for (var i = 0; i < manufacturerIds.length; i++) {
                var manufacturerId = manufacturerIds[i];
                if (i == 0) {
                    finalSql.push(sql);
                } else {
                    var _tmp = sql;
                    for (var j = 0; j < seed; j++) {
                        var replaceRegex = new RegExp('\\{' + j + '\\}', "g");
                        _tmp = _tmp.replace(replaceRegex, "{" + (i * seed + j) + "}");
                    };
                    finalSql.push(_tmp);
                }
                params.push(productId, manufacturerId, false, 0);
            };
            params.unshift(finalSql.join(";"));

            baseDal.executeNoneQuery(params).then(function(result) {

                deferred.resolve("AddProduct Manufacturer Mappings success, productId: `" + productId + "`, manufactuerIds: " + JSON.stringify(manufacturerIds));

            }, function(err) {
                deferred.reject(err);
            });

        } else {
            deferred.reject("addProductManufacturerMappings accept `manufacturerIds` must be array");
        }
        return deferred.promise;
    };
    /**
     * Get all pictures from given productid.
     * @param  {number} productId product id.
     * @return {promise}
     */
    this.getPicturesByProductId = function(productId) {

        var sql = "SELECT Id, ProductId, PictureId, DisplayOrder FROM dbo.Product_Picture_Mapping WHERE ProductId = {0}";

        return baseDal.executeList(ProductPictureModel, [sql, productId]);
    };
    /**
     * Add specification attributes of current product.
     * @param  {number}   newProduct.Id productId
     * @param  {object}   specificationAttributes
     * [{ "title": "itemtype", "value": "Gloves & Mittens" }, { "title": "patterntype", "value": "Solid" }]
     * @return {promise}
     */
    this.addProductSpecificationAttributes = function(productId, specificationAttributes) {

        var productAutoUploadCfg = dataProvider.getConfigNode("product", "autoupload_config", "specification_attribute_white_list");

        var specAttributeWhiteList = productAutoUploadCfg.split(",");

        logger.debug("specification_attribute_white_list:", productAutoUploadCfg);

        var productSpecificationAttributeDal = dataProvider.getDataAccess("SpecificationAttribute");
        var deferred = Q.defer();

        var resultMessages = [];

        // first update all specification attribute 'AllowFiltering' ==False.
        productSpecificationAttributeDal.updateProductSpecificatinAttributeAllowFiltering2False(productId).then(function(affectedRows) {

            // loop all specificate attributes.
            async.eachSeries(specificationAttributes, function(specAttribute, callback) {

                // get spec attribute name.
                var specAttributeName = specAttribute.title;
                var specificationAttributeModel = new SpecificationAttributeModel(specAttributeName);

                // get specification attribute instance if not auto insert it into database.
                productSpecificationAttributeDal.autoCreatedSpecificationAttributeIfNotExist(specificationAttributeModel)
                    .then(function(newSpecificationAttribute) {
                        // find specification attribute option name.
                        var specificationAttributeOptionName = specAttribute.value;
                        var specificationAttributeOption = new SpecificationAttributeOptionModel(newSpecificationAttribute.Id, specificationAttributeOptionName);

                        productSpecificationAttributeDal.addOrUpdateSpecificationAttributeOption(specificationAttributeOption)
                            .then(function(newSpecificationAttributeOption) {

                                // mapping instance.
                                var allowFiltering = utility.isExistedInArray(specAttributeName, specAttributeWhiteList);
                                var productSpecAttributeMapping = new Product_SpecificationAttribute_MappingModel(productId, newSpecificationAttributeOption.Id, allowFiltering);

                                productSpecificationAttributeDal.addOrUpdateProductSpecificationAttributesMapping(productSpecAttributeMapping)
                                    .then(function(newPSAMapping) {
                                        resultMessages.push(utility.stringFormat("ProductSpecificationAttribute Item Finished -> ProductId: `{0}`,  Name: `{1}`,  SpecificationAttributeOptionName:`{2}`", productId, specAttributeName, specificationAttributeOptionName));
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
            }, function(err) {
                if (err) {
                    deferred.reject(err);
                } else {
                    var finnalyResultMessage = baseDal.buildResultMessages("AddProductSpecificationAttributes", resultMessages).getResult();
                    deferred.resolve(finnalyResultMessage);
                }
            });
        }, function(err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    /**
     * 添加新产品信息到数据库
     * @param {object} product 产品实例
     */
    this.addNewProduct = function(product, productVariant) {
        var deferred = Q.defer();

        // capture all task operation result.
        var resultMessagesObj;
        // 1. insert product basic information.
        insertProduct(product).then(function(newProduct) {

            resultMessagesObj = baseDal.buildResultMessages("addNewProduct", {
                productId: newProduct.Id
            });

            if (newProduct.Id) {

                var productRelatedTasks = [];
                // task: add product variant tier price.
                productRelatedTasks.push(function(callback) {
                    insertProductTierPrice(newProduct).then(function(result) {
                        callback(null, result);
                    }, function(err) {
                        callback(err);
                    });
                });
                // task: add product attributes.
                productRelatedTasks.push(function(callback) {
                    insertProductAttributes(newProduct).then(function(result) {
                        callback(null, result);
                    }, function(err) {
                        callback(err);
                    });
                });
                // run product variant related info tasks.
                async.parallel(productRelatedTasks, function(err, results) {
                    if (err) {
                        logger.error("async.parallel within addNewProduct failed!", err);
                        deferred.reject(err);
                    } else {
                        logger.debug("async.parallel within addNewProduct finished!", results);

                        resultMessagesObj.pushNewMessage("variantTasks", results, "addNewProductVariant");

                        deferred.resolve(resultMessagesObj.getResult());
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
        var preFix = "";
        //Short Description.
        product.ShortDescription = preFix + product.ShortDescription;
        //Insert Product
        var sql = "INSERT INTO Product (ProductTypeId,ParentGroupedProductId,VisibleIndividually,Name,ShortDescription,FullDescription,ProductTemplateId,VendorId,ShowOnHomePage,MetaKeywords,MetaDescription,MetaTitle,AllowCustomerReviews,ApprovedRatingSum,NotApprovedRatingSum,ApprovedTotalReviews,NotApprovedTotalReviews,SubjectToAcl,LimitedToStores,Sku,ManufacturerPartNumber,Gtin,IsGiftCard,GiftCardTypeId,RequireOtherProducts,RequiredProductIds,AutomaticallyAddRequiredProducts,IsDownload,DownloadId,UnlimitedDownloads,MaxNumberOfDownloads,DownloadExpirationDays,DownloadActivationTypeId,HasSampleDownload,SampleDownloadId,HasUserAgreement,UserAgreementText,IsRecurring,RecurringCycleLength,RecurringCyclePeriodId,RecurringTotalCycles,IsRental,RentalPriceLength,RentalPricePeriodId,IsShipEnabled,IsFreeShipping,ShipSeparately,AdditionalShippingCharge,DeliveryDateId,IsTaxExempt,TaxCategoryId,IsTelecommunicationsOrBroadcastingOrElectronicServices,ManageInventoryMethodId,UseMultipleWarehouses,WarehouseId,StockQuantity,DisplayStockAvailability,DisplayStockQuantity,MinStockQuantity,LowStockActivityId,NotifyAdminForQuantityBelow,BackorderModeId,AllowBackInStockSubscriptions,OrderMinimumQuantity,OrderMaximumQuantity,AllowedQuantities,AllowAddingOnlyExistingAttributeCombinations,DisableBuyButton,DisableWishlistButton,AvailableForPreOrder,PreOrderAvailabilityStartDateTimeUtc,CallForPrice,Price,OldPrice,SourcePrice,ProductCost,SpecialPrice,SpecialPriceStartDateTimeUtc,SpecialPriceEndDateTimeUtc,CustomerEntersPrice,MinimumCustomerEnteredPrice,MaximumCustomerEnteredPrice,HasTierPrices,HasDiscountsApplied,Weight,Length,Width,Height,AvailableStartDateTimeUtc,AvailableEndDateTimeUtc,DisplayOrder,Published,Deleted,CreatedOnUtc,UpdatedOnUtc,SourceUrl,SourceInfoComment )" +
            " VALUES  ({0},{1},{2},{3},{4},{5},{6},{7},{8},{9},{10},{11},{12},{13},{14},{15},{16},{17},{18},{19},{20}," +
            "{21},{22},{23},{24},{25},{26},{27},{28},{29},{30},{31}," +
            "{32},{33},{34},{35},{36},{37},{38},{39},{40},{41},{42},{43},{44},{45},{46},{47},{48},{49},{50},{51}," +
            "{52},{53},{54},{55},{56},{57},{58},{59},{60},{61},{62},{63},{64},{65},{66},{67},{68},{69},{70},{71},{72},{73},{74},{75},{76},{77},{78},{79},{80},{81},{82},{83},{84},{85},{86},{87},{88},{89},{90},{91},{92},{93},{94},{95},{96} );SELECT SCOPE_IDENTITY() AS Id;";

        return baseDal.executeEntity(ProductModel, [sql,
            product.ProductTypeId, product.ParentGroupedProductId, product.VisibleIndividually, product.Name,
            product.ShortDescription, product.FullDescription, product.ProductTemplateId, product.VendorId,
            product.ShowOnHomePage, product.MetaKeywords, product.MetaDescription, product.MetaTitle,
            product.AllowCustomerReviews, product.ApprovedRatingSum, product.NotApprovedRatingSum,
            product.ApprovedTotalReviews, product.NotApprovedTotalReviews, product.SubjectToAcl,
            product.LimitedToStores, product.Sku, product.ManufacturerPartNumber, product.Gtin,
            product.IsGiftCard, product.GiftCardTypeId, product.RequireOtherProducts,
            product.RequiredProductIds, product.AutomaticallyAddRequiredProducts, product.IsDownload,
            product.DownloadId, product.UnlimitedDownloads, product.MaxNumberOfDownloads,
            product.DownloadExpirationDays, product.DownloadActivationTypeId,
            product.HasSampleDownload, product.SampleDownloadId, product.HasUserAgreement,
            product.UserAgreementText, product.IsRecurring, product.RecurringCycleLength,
            product.RecurringCyclePeriodId, product.RecurringTotalCycles, product.IsRental,
            product.RentalPriceLength, product.RentalPricePeriodId, product.IsShipEnabled,
            product.IsFreeShipping, product.ShipSeparately, product.AdditionalShippingCharge,
            product.DeliveryDateId, product.IsTaxExempt, product.TaxCategoryId,
            product.IsTelecommunicationsOrBroadcastingOrElectronicServices, product.ManageInventoryMethodId,
            product.UseMultipleWarehouses, product.WarehouseId, product.StockQuantity, product.DisplayStockAvailability,
            product.DisplayStockQuantity, product.MinStockQuantity, product.LowStockActivityId,
            product.NotifyAdminForQuantityBelow, product.BackorderModeId, product.AllowBackInStockSubscriptions,
            product.OrderMinimumQuantity, product.OrderMaximumQuantity, product.AllowedQuantities,
            product.AllowAddingOnlyExistingAttributeCombinations, product.DisableBuyButton, product.DisableWishlistButton,
            product.AvailableForPreOrder, product.PreOrderAvailabilityStartDateTimeUtc, product.CallForPrice, product.Price,
            product.OldPrice, product.SourcePrice, product.ProductCost, product.SpecialPrice,
            product.SpecialPriceStartDateTimeUtc, product.SpecialPriceEndDateTimeUtc, product.CustomerEntersPrice,
            product.MinimumCustomerEnteredPrice, product.MaximumCustomerEnteredPrice, product.HasTierPrices,
            product.HasDiscountsApplied, product.Weight, product.Length, product.Width, product.Height,
            product.AvailableStartDateTimeUtc, product.AvailableEndDateTimeUtc, product.DisplayOrder, product.Published,
            product.Deleted, product.CreatedOnUtc, product.UpdatedOnUtc, product.SourceUrl, product.SourceInfoComment
        ]).then(function success(newProduct) {
            if (newProduct != null) {
                product.Id = newProduct.Id;
            }
            return product;
        });
    };
 
    /**
     * 添加产品的Tier Price 给Product
     * @param  {object} newProduct ProductModel instance.
     */
    function insertProductTierPrice(newProduct) {

        var deferred = Q.defer();

        var sqlTierPrice = "INSERT INTO dbo.TierPrice (ProductId ,StoreId, CustomerRoleId,Quantity,Price) VALUES({0},{1},{2},{3},{4})";

        var tierPrice = newProduct.TierPrices;
        var sql = [];
        var params = [];
        var seed = 5;

        logger.debug("tierPrice:", tierPrice);

        for (var i = 0; i < tierPrice.length; i++) {
            var item = tierPrice[i];
            if (i == 0) {
                sql.push(sqlTierPrice);
            } else {
                var _tmp = sqlTierPrice;
                for (var j = 0; j < seed; j++) {
                    var replaceRegex = new RegExp('\\{' + j + '\\}', "g");
                    _tmp = _tmp.replace(replaceRegex, "{" + (i * seed + j) + "}");
                };
                sql.push(_tmp);
            }
            params.push(newProduct.Id, 0, null, item.Quantity, ["Decimal", item.Price]);
        };
        params.unshift(sql.join(";"));

        baseDal.executeNoneQuery(params).then(function(affectedRows) {

            deferred.resolve("insertProductTierPrice success variantId: `" + newProduct.Id + "`");

        }, function(err) {

            deferred.reject(err);

        });
        return deferred.promise;
    };
    /**
     * 添加Product 的attributes 信息,e.g. colorList, sizeList.
     * @param  {object} newProduct ProductModel instance.
     */
    function insertProductAttributes(newProduct) {
        // product attributes dal, can be invoid instance cache.
        var productAttribtsDal = dataProvider.getDataAccess("ProductAttributeDal");

        var deferred = Q.defer();

        // outscope result messages.
        var resultMessagesObj;

        var pVAMappingSql = "INSERT INTO dbo.Product_ProductAttribute_Mapping " +
            "(ProductId , ProductAttributeId ,TextPrompt,IsRequired ,AttributeControlTypeId , DisplayOrder)" +
            " VALUES ({0},{1},{2},{3},{4},{5}); SELECT SCOPE_IDENTITY() AS Id; ";

        productAttribtsDal.getAttributControlTypeIds().then(function(paIds) {
            // { "color": 40, "size": 1, "other": 1 }
            var productAttributeIds = paIds;
            // all attributs. {"color": [  { "title": "Black", "value": "000" }],"size"...}
            var productAttribts = newProduct.ProductAttribts;

            var productAttribtsKeys = Object.keys(productAttribts);

            var resultMessages = [];

            async.eachSeries(productAttribtsKeys, function(key, callback) {

                // product variant control type id.
                var controlTypeId = productAttributeIds[key.toLowerCase()] || productAttributeIds["other"];
                // color -->Color.
                var promptText = key;

                var _productAttribute = new ProductAttributeModel(promptText, "auto created by tool");
                // create product attribute item.
                productAttribtsDal.autoCreatedIfNotExist(_productAttribute).then(function success(newProductAttribute) {
                    // 执行DB EXEC.
                    logger.debug("current product attribute: ", newProductAttribute);

                    var PVAMapping = dataProvider.getModel("PVAMapping");
                    // add new record to [ProductVariant_ProductAttribute_Mapping]
                    baseDal.executeEntity(PVAMapping, [pVAMappingSql, newVariant.Id, newProductAttribute.Id, promptText, true, controlTypeId, 0]).then(function(pvaMapping) {

                        // product attributes.
                        var attributeAttribtsValues = productAttribts[key];

                        productAttribtsDal.addProductAttributeValues(pvaMapping.Id, key, attributeAttribtsValues).then(function(execResult) {
                            resultMessages.push(execResult);
                            callback(null);
                        }, function(err) {
                            callback(err);
                        });

                    }, function(err) {
                        logger.error("Inoke Insert Product_ProductAttribute_Mapping Error: ", err);
                        callback("Inoke Insert Product_ProductAttribute_Mapping failed!");
                    });
                }, function(err) {
                    logger.error("Invoke AutoCreatedIfNotExist Error: ", err);
                    callback("Insert Product Attribute AutoCreatedIfNotExist() failed!" + key);
                });
            }, function finnaly(err) {
                if (err) {
                    deferred.reject(err);
                } else {
                    logger.debug("InsertProductAttributes finished!");
                    resultMessagesObj = baseDal.buildResultMessages("InsertProductAttributes", resultMessages);
                    deferred.resolve(resultMessagesObj.getResult());
                }
            });
        }, function(err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

}
module.exports = ProductDal;