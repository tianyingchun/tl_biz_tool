function BaseModel(modelName) {
	// protected variable indicates current constructor name.
	this._modelName = modelName;
	// all child constructor must be have this property.
	this.Id = 0;
};
BaseModel.prototype = {
	constructor: BaseModel
};
module.exports = BaseModel;