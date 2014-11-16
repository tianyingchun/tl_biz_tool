var sql = require('mssql');
var config = require('../config')();
var logger = require('../helpers/log');
var utility = require('../helpers/utility');
var CatalogModel = require("../models/Catalog");
var baseDal = require("./baseDal");

function catalogDal() {
	// 返回所有的分类
	this.getAllCatagory = function() {
		var sql = "SELECT Id,Name,ParentCategoryId,DisplayOrder FROM Category";
		return baseDal.executeList(CatalogModel, [sql]);
	};

	//添加当前产品到指定的产品分类
	this.insertProductCatagoryMapping = function(productId, categoryId) {
		var sql = "INSERT INTO dbo.Product_Category_Mapping  ( ProductId , CategoryId , IsFeaturedProduct , DisplayOrder)" +
			"VALUES({0},{1},{2},{3});";
		return baseDal.executeNoneQuery([sql, productId, categoryId, false, 0]);
	};
	/**
	 *  获取特定分类下的产品列表,categoryId==-1 查询所有的产品
	 * @param  {number} categoryId 分类的ID
	 */
	this.getAllProductsByCategoryId = function(categoryId) {
		var sql = "SELECT Id,ProductId,Name,Sku,Price,OldPrice,WithDeliveryFee,ProductCost as SourcePrice,[Weight],IsFreeShipping,SourceUrl,StockQuantity,UpdatedOnUtc,CreatedOnUtc,Published FROM dbo.ProductVariant where ProductId IN (SELECT ProductId FROM dbo.Product p INNER JOIN  [dbo].[Product_Category_Mapping] pm ON p.Id=pm.ProductId WHERE pm.CategoryId={0} And p.Deleted=0)";
		var params = [sql, categoryId];
		if (categoryId == -1) {
			params = [sql];
			sql = "SELECT Id,ProductId,Name,Sku,Price,OldPrice,WithDeliveryFee,ProductCost as SourcePrice,[Weight],IsFreeShipping,SourceUrl,StockQuantity,UpdatedOnUtc,CreatedOnUtc,Published FROM dbo.ProductVariant where ProductId IN (SELECT ProductId FROM dbo.Product p INNER JOIN  [dbo].[Product_Category_Mapping] pm ON p.Id=pm.ProductId WHERE p.Deleted=0)";
		}
		return baseDal.executeList(CatalogModel, params);
	};
	/**
	 * 删除当前产品所有的分类映射关系
	 * @param  {number} productId 产品的唯一ID
	 */
	this.removeProductCategroyMappings = function(productId) {
		var sql = "DELETE FROM dbo.Product_Category_Mapping WHERE ProductId = {0}";
		return baseDal.executeNoneQuery([sql, productId]);
	};

	this.removeALLPublishedProductsByCategoryId = function(categoryId) {
		var sql = "DELETE FROM dbo.Product_Category_Mapping WHERE ProductId IN (SELECT Id FROM product WHERE id IN ( SELECT ProductId FROM dbo.Product_Category_Mapping WHERE CategoryId={0}) AND Published=1";
		sql += ") AND dbo.Product_Category_Mapping.CategoryId ={0}";
		return baseDal.executeNoneQuery([sql, categoryId]);
	};

};


module.exports = catalogDal;