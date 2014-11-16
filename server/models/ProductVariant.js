var util = require('util');
var BaseModel = require("./BaseModel");

function ProductVariant(productId, name, sku, description, price, oldPrice, sourcePrice, costPrice, sourceUrl, sourceInfoComment, productAttribts, specAttribts) {
    BaseModel.call(this, "ProductVariant");
    /// <summary>
    /// Gets or sets the productVariant identifier
    /// </summary>
    this.Id = "";
    /// <summary>
    /// Gets or sets the product identifier
    /// </summary>
    this.ProductId = productId;

    /// <summary>
    /// Gets or sets the name
    /// </summary>
    this.Name = name;

    /// <summary>
    /// Gets or sets the SKU
    /// </summary>
    this.Sku = sku;

    /// <summary>
    /// Gets or sets the description
    /// </summary>
    this.Description = description;

    /// <summary>
    /// Gets or sets the admin comment
    /// </summary>
    this.AdminComment = "";

    /// <summary>
    /// Gets or sets the manufacturer part number
    /// </summary>
    this.ManufacturerPartNumber = "CG" + this.Sku;

    /// <summary>
    /// Gets or sets the Global Trade Item Number (GTIN). These identifiers include UPC (in North America), EAN (in Europe), JAN (in Japan), and ISBN (for books).
    /// </summary>
    this.Gtin = "";

    /// <summary>
    /// Gets or sets a value indicating whether the product variant is gift card
    /// </summary>
    this.IsGiftCard = false;

    /// <summary>
    /// Gets or sets the gift card type identifier
    /// </summary>
    this.GiftCardTypeId = 0;

    /// <summary>
    /// Gets or sets a value indicating whether the product variant requires that other product variants are added to the cart (Product X requires Product Y)
    /// </summary>
    this.RequireOtherProducts = false;

    /// <summary>
    /// Gets or sets a required product variant identifiers (comma separated)
    /// </summary>
    this.RequiredProductVariantIds = "";

    /// <summary>
    /// Gets or sets a value indicating whether required product variants are automatically added to the cart
    /// </summary>
    this.AutomaticallyAddRequiredProductVariants = false;

    /// <summary>
    /// Gets or sets a value indicating whether the product variant is download
    /// </summary>
    this.IsDownload = false;

    /// <summary>
    /// Gets or sets the download identifier
    /// </summary>
    this.DownloadId = 0;

    /// <summary>
    /// Gets or sets a value indicating whether this downloadable product can be downloaded unlimited number of times
    /// </summary>
    this.UnlimitedDownloads = false;

    /// <summary>
    /// Gets or sets the maximum number of downloads
    /// </summary>
    this.MaxNumberOfDownloads = 0;

    /// <summary>
    /// Gets or sets the number of days during customers keeps access to the file.
    /// </summary>
    this.DownloadExpirationDays = null;

    /// <summary>
    /// Gets or sets the download activation type
    /// </summary>
    this.DownloadActivationTypeId = 1;

    /// <summary>
    /// Gets or sets a value indicating whether the product variant has a sample download file
    /// </summary>
    this.HasSampleDownload = false;

    /// <summary>
    /// Gets or sets the sample download identifier
    /// </summary>
    this.SampleDownloadId = 0;

    /// <summary>
    /// Gets or sets a value indicating whether the product has user agreement
    /// </summary>
    this.HasUserAgreement = false;

    /// <summary>
    /// Gets or sets the text of license agreement
    /// </summary>
    this.UserAgreementText = null;

    /// <summary>
    /// Gets or sets a value indicating whether the product variant is recurring
    /// </summary>
    this.IsRecurring = false;

    /// <summary>
    /// Gets or sets the cycle length
    /// </summary>
    this.RecurringCycleLength = 0;

    /// <summary>
    /// Gets or sets the cycle period
    /// </summary>
    this.RecurringCyclePeriodId = 0;

    /// <summary>
    /// Gets or sets the total cycles
    /// </summary>
    this.RecurringTotalCycles = 0;

    /// <summary>
    /// Gets or sets a value indicating whether the entity is ship enabled
    /// </summary>
    this.IsShipEnabled = 1;

    /// <summary>
    /// Gets or sets a value indicating whether the entity is free shipping
    /// </summary>
    this.IsFreeShipping = true;
    /// <summary>
    /// False 当前产品的卖价没有包含我们邮寄出去的费用（不提供免邮服务），default=True 指当前产品卖价已经包含了邮寄出去的费用（提供免邮服务）
    /// 目前暂定为<=20RMB 的成本的产品 不提供免邮服务.
    /// </summary>
    this.WithDeliveryFee = true;
    /// <summary>
    /// Gets or sets the additional shipping charge
    /// </summary>
    this.AdditionalShippingCharge = 0;

    /// <summary>
    /// Gets or sets a value indicating whether the product variant is marked as tax exempt
    /// </summary>
    this.IsTaxExempt = false;

    /// <summary>
    /// Gets or sets the tax category identifier
    /// </summary>
    this.TaxCategoryId = 0;

    /// <summary>
    /// Gets or sets a value indicating how to manage inventory
    /// </summary>
    this.ManageInventoryMethodId = 1;

    /// <summary>
    /// Gets or sets the stock quantity
    /// </summary>
    this.StockQuantity = 1000;

    /// <summary>
    /// Gets or sets a value indicating whether to display stock availability
    /// </summary>
    this.DisplayStockAvailability = true;

    /// <summary>
    /// Gets or sets a value indicating whether to display stock quantity
    /// </summary>
    this.DisplayStockQuantity = false;

    /// <summary>
    /// Gets or sets the minimum stock quantity
    /// </summary>
    this.MinStockQuantity = 1;

    /// <summary>
    /// Gets or sets the low stock activity identifier
    /// </summary>
    this.LowStockActivityId = 0;

    /// <summary>
    /// Gets or sets the quantity when admin should be notified
    /// </summary>
    this.NotifyAdminForQuantityBelow = 0;

    /// <summary>
    /// Gets or sets a value backorder mode identifier
    /// </summary>
    this.BackorderModeId = 0;

    /// <summary>
    /// Gets or sets a value indicating whether to back in stock subscriptions are allowed
    /// </summary>
    this.AllowBackInStockSubscriptions = true;

    /// <summary>
    /// Gets or sets the order minimum quantity
    /// </summary>
    this.OrderMinimumQuantity = 1;

    /// <summary>
    /// Gets or sets the order maximum quantity
    /// </summary>
    this.OrderMaximumQuantity = 1000;

    this.AllowedQuantities = null;
    /// <summary>
    /// Gets or sets a value indicating whether to disable buy (Add to cart) button
    /// </summary>
    this.DisableBuyButton = false;

    /// <summary>
    /// Gets or sets a value indicating whether to disable "Add to wishlist" button
    /// </summary>
    this.DisableWishlistButton = false;

    /// <summary>
    /// Gets or sets a value indicating whether this item is available for Pre-Order
    /// </summary>
    this.AvailableForPreOrder = false;

    /// <summary>
    /// Gets or sets a value indicating whether to show "Call for Pricing" or "Call for quote" instead of price
    /// </summary>
    this.CallForPrice = false;

    /// <summary>
    /// Gets or sets the price
    /// </summary>
    this.Price = price;

    /// <summary>
    /// Gets or sets the old price
    /// </summary>
    this.OldPrice = oldPrice;

    /// <summary>
    /// 产品抓取的时候ALIBABA来源的单件产品的价格
    /// </summary>
    this.SourcePrice = sourcePrice;
    /// <summary>
    /// Gets or sets the product cost
    /// </summary>
    this.ProductCost = costPrice;

    /// <summary>
    /// Gets or sets the product special price
    /// </summary>
    this.SpecialPrice = null;

    /// <summary>
    /// Gets or sets the start date and time of the special price
    /// </summary>
    this.SpecialPriceStartDateTimeUtc = null;

    /// <summary>
    /// Gets or sets the end date and time of the special price
    /// </summary>
    this.SpecialPriceEndDateTimeUtc = null;

    /// <summary>
    /// Gets or sets a value indicating whether a customer enters price
    /// </summary>
    this.CustomerEntersPrice = false;

    /// <summary>
    /// Gets or sets the minimum price entered by a customer
    /// </summary>
    this.MinimumCustomerEnteredPrice = 0;

    /// <summary>
    /// Gets or sets the maximum price entered by a customer
    /// </summary>
    this.MaximumCustomerEnteredPrice = 0;

    /// <summary>
    /// Gets or sets the weight
    /// </summary>
    this.Weight = 1.00;

    /// <summary>
    /// Gets or sets the length
    /// </summary>
    this.Length = 0;

    /// <summary>
    /// Gets or sets the width
    /// </summary>
    this.Width = 0;

    /// <summary>
    /// Gets or sets the height
    /// </summary>
    this.Height = 0;

    /// <summary>
    /// Gets or sets the picture identifier
    /// </summary>
    this.PictureId = 0;

    /// <summary>
    /// Gets or sets the available start date and time
    /// </summary>
    this.AvailableStartDateTimeUtc = null;

    /// <summary>
    /// Gets or sets the available end date and time
    /// </summary>
    this.AvailableEndDateTimeUtc = null;

    /// <summary>
    /// Gets or sets a value indicating whether the entity is published
    /// </summary>
    this.Published = true;

    /// <summary>
    /// Gets or sets a value indicating whether the entity has been deleted
    /// </summary>
    this.Deleted = false;

    /// <summary>
    /// Gets or sets the display order
    /// </summary>
    this.DisplayOrder = 1;

    /// <summary>
    /// Gets or sets the date and time of instance creation
    /// </summary>
    this.CreatedOnUtc = new Date();

    /// <summary>
    /// Gets or sets the date and time of instance update
    /// </summary>
    this.UpdatedOnUtc = new Date();

    /// <summary>
    /// Gets or sets the Product source url
    /// </summary>
    this.SourceUrl = sourceUrl;

    /// <summary>
    /// Gets or sets the product source provider factory's information
    /// </summary>
    this.SourceInfoComment = sourceInfoComment;
    /// <summary>
    /// Gets or set the product Colors list
    /// [{title:'', value:''}]
    /// </summary>
    this.ProductAttribts = productAttribts || [];

    /// <summary>
    /// Gets or set the product specification list
    /// [{title:'', value:''}]
    /// </summary>
    this.SpecAttribts = specAttribts || [];

    /// <summary>
    /// Gets or set the product variant tiePrices.
    /// refs TierPriceModel.
    /// </summary>
    this.TierPrices = [];
};

util.inherits(ProductVariant, BaseModel);

module.exports = ProductVariant;