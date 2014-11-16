function BaseModel(modelName) {
	// protected variable indicates current constructor name.
	this._modelName = modelName;
};
BaseModel.prototype = {
	constructor: BaseModel
};
module.exports = BaseModel;