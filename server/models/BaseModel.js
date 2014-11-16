function BaseModel(constructorName) {
	// protected variable indicates current constructor name.
	this._constructorName = constructorName;
};
BaseModel.prototype = {
	constructor: BaseModel
};
module.exports = BaseModel;