var async = require('async');
var Q = require("q");
var _ = require("underscore");
var logger = require('../../helpers/log');
var utility = require('../../helpers/utility');
var dataProvider = require("../../dataProvider");
var ProductModel = dataProvider.getModel("Product");
var ProductVariantModel = dataProvider.getModel("ProductVariant");
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
        var sql = "SELECT Id,Name,ShortDescription,FullDescription,AdminComment,ProductTemplateId,ShowOnHomePage,MetaKeywords,MetaDescription,MetaTitle,AllowCustomerReviews,ApprovedRatingSum,NotApprovedRatingSum,ApprovedTotalReviews,NotApprovedTotalReviews,SubjectToAcl,Published,Deleted,CreatedOnUtc,UpdatedOnUtc FROM  Product WHERE id={0}";
        return baseDal.executeEntity(ProductModel, [sql, productId]);
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
                // 2. add product variant.
                insertProductVariant(newProduct, productVariant).then(function(newProductVariant) {

                    // push new message to queue
                    resultMessagesObj.pushNewMessage("addNewProductVariant", {
                        productVariantId: newProductVariant.Id
                    });

                    var productRelatedTasks = [];
                    // task: add product variant tier price.
                    productRelatedTasks.push(function(callback) {
                        insertProductVariantTierPrice(newProductVariant).then(function(result) {
                            callback(null, result);
                        }, function(err) {
                            callback(err);
                        });
                    });
                    // task: add product variant attributes.
                    productRelatedTasks.push(function(callback) {
                        insertProductVariantAttributes(newProductVariant).then(function(result) {
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
                }, function(err) {
                    logger.error("insertProductVariant error:", err);
                    deferred.reject(err);
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
     * 添加ProductVariant 子产品信息
     * @param  {object} product ProductModel instance.
     * @param  {object} variant ProductVariantModel instance.
     * @return {promise}promise with parameter
     */
    function insertProductVariant(product, variant) {
        var preFix = "";
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
            variant.OrderMinimumQuantity, variant.OrderMaximumQuantity, variant.AllowedQuantities, variant.DisableBuyButton, variant.DisableWishlistButton, variant.CallForPrice, ["Decimal", variant.Price],
            ["Decimal", variant.OldPrice],
            ["Decimal", variant.ProductCost],
            ["Decimal", variant.SpecialPrice], variant.SpecialPriceStartDateTimeUtc, variant.SpecialPriceEndDateTimeUtc,
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

        var deferred = Q.defer();

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
                    var replaceRegex = new RegExp('\\{' + j + '\\}', "g");
                    _tmp = _tmp.replace(replaceRegex, "{" + (i * seed + j) + "}");
                };
                sql.push(_tmp);
            }
            params.push(newVariant.Id, null, item.Quantity, ["Decimal", item.Price]);
        };
        params.unshift(sql.join(";"));

        baseDal.executeNoneQuery(params).then(function(affectedRows) {

            deferred.resolve("insertProductVariantTierPrice success variantId: `" + newVariant.Id + "`");

        }, function(err) {

            deferred.reject(err);

        });
        return deferred.promise;
    };
    /**
     * 添加ProductVariant 的attributes 信息,e.g. colorList, sizeList.
     * @param  {object} newVariant ProductVariantModel instance.
     */
    function insertProductVariantAttributes(newVariant) {
        // product attributes dal, can be invoid instance cache.
        var productAttribtsDal = dataProvider.getDataAccess("ProductAttributeDal");

        var deferred = Q.defer();

        // outscope result messages.
        var resultMessagesObj;

        var pVAMappingSql = "INSERT INTO dbo.ProductVariant_ProductAttribute_Mapping " +
            "(ProductVariantId , ProductAttributeId ,TextPrompt,IsRequired ,AttributeControlTypeId , DisplayOrder)" +
            " VALUES ({0},{1},{2},{3},{4},{5}); SELECT SCOPE_IDENTITY() AS Id; ";

        productAttribtsDal.getAttributControlTypeIds().then(function(paIds) {
            // { "color": 40, "size": 1, "other": 1 }
            var productAttributeIds = paIds;
            // all attributs. {"color": [  { "title": "Black", "value": "000" }],"size"...}
            var productAttribts = newVariant.ProductAttribts;

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

                        productAttribtsDal.addProductVariantAttributeValues(pvaMapping.Id, key, attributeAttribtsValues).then(function(execResult) {
                            resultMessages.push(execResult);
                            callback(null);
                        }, function(err) {
                            callback(err);
                        });

                    }, function(err) {
                        logger.error("Inoke Insert ProductVariant_ProductAttribute_Mapping Error: ", err);
                        callback("Inoke Insert ProductVariant_ProductAttribute_Mapping failed!");
                    });
                }, function(err) {
                    logger.error("Invoke AutoCreatedIfNotExist Error: ", err);
                    callback("Insert ProductVariant Attribute AutoCreatedIfNotExist() failed!" + key);
                });
            }, function finnaly(err) {
                if (err) {
                    deferred.reject(err);
                } else {
                    logger.debug("InsertProductVariantAttributes finished!");
                    resultMessagesObj = baseDal.buildResultMessages("InsertProductVariantAttributes", resultMessages);
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