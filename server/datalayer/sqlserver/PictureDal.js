var logger = require('../../helpers/log');
var dataProvider = require("../../dataProvider");
var PictureModel = dataProvider.getModel("Picture");
var baseDal = require("../baseDal");

function PictureDal() {
	/**
	 * 添加新图片记录到数据库并返回当前带当前图片ID 的实体
	 * @param  {picture} picture picture entity
	 * @return {promise}
	 */
	this.insertPicture = function(picture) {
		var sql = "INSERT INTO Picture(MimeType ,PictureBinary,SeoFilename ,IsNew) VALUES ({0},{1},{2},{3});SELECT SCOPE_IDENTITY() AS Id;";
		return baseDal.executeEntity(PictureModel, [sql, picture.MimeType, ["VarBinary", picture.PictureBinary], picture.SeoFilename, picture.IsNew])
			.then(function success(newPicture) {
				if (newPicture != null) {
					picture.Id = newPicture.Id;
				}
				return picture;
			});
	};
	/**
	 * 根据图片ID查询图片实体
	 * @param  {number} pictureId 图片实体的ID
	 * @return {promise}
	 */
	this.getPictureById = function(pictureId) {
		var sql = "SELECT Id, PictureBinary , MimeType ,SeoFilename ,IsNew FROM Picture WHERE Id={0}";
		return baseDal.executeEntity(PictureModel, [sql, pictureId]);
	};

	/**
	 * Update picture to databse.
	 * @param  {object} picture picture entity instance.
	 * @return  promise object.
	 */
	this.updatePicture = function(picture) {
		var sql = "UPDATE Picture SET MimeType={0},PictureBinary={1},SeoFilename={2},IsNew={3} WHERE Id={4}";
		return baseDal.executeNoneQuery([sql, picture.MimeType, ["VarBinary", picture.PictureBinary], picture.SeoFilename, picture.IsNew, picture.Id]);
	};
	/**
	 * 获取指定产品下的所有图片
	 * @param  {number} productId 产品的唯一ID
	 * @return promise object.
	 */
	this.getAllPicturesByProductId = function(productId) {
		var sql = "SELECT Id,PictureBinary,MimeType,SeoFilename,IsNew FROM Picture WHERE id IN (SELECT PictureId FROM Product_Picture_Mapping WHERE ProductId={0})";
		return baseDal.executeList(PictureModel, [sql, productId]);
	};

	/**
	 * 删除指定的图片
	 * @param  {number} pictureId 图片ID
	 * @return promise object.
	 */
	this.deletePicture = function(pictureId) {
		var sql = "DELETE FROM  Picture WHERE Id ={0}";
		return baseDal.executeNoneQuery([sql, pictureId]);
	};
};


module.exports = PictureDal;