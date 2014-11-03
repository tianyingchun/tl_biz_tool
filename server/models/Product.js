function Product(name, fullDescription) {
	/// <summary>
	/// Gets or sets the Id
	/// </summary>
	this.Id = "";
	/// <summary>
	/// Gets or sets the name
	/// </summary>
	this.Name = name;

	/// <summary>
	/// Gets or sets the short description
	/// </summary>
	this.ShortDescription = this.Name;

	/// <summary>
	/// Gets or sets the full description
	/// </summary>
	this.FullDescription = fullDescription;

	/// <summary>
	/// Default value=2
	/// </summary>
	this.ProductTemplateId = 2;

	/// <summary>
	/// Show on hone page default value= false;
	/// </summary>
	this.ShowOnHomePage = false;
	/// <summary>
	/// Gets or sets the meta keywords
	/// </summary>
	this.MetaKeywords = "";

	/// <summary>
	/// Gets or sets the meta description
	/// </summary>
	this.MetaDescription = "";

	/// <summary>
	/// Gets or sets the meta title, now it sample equals product name.
	/// </summary>
	this.MetaTitle = this.Name;

	/// <summary>
	/// Gets or sets a value indicating whether the product allows customer reviews
	/// </summary>
	this.AllowCustomerReviews = true;

	this.ApprovedRatingSum = 0;

	this.NotApprovedRatingSum = 0;

	this.ApprovedTotalReviews = 0;

	this.NotApprovedTotalReviews = 0;

	/// <summary>
	/// Gets or sets a value indicating whether the entity is published
	/// </summary>
	this.Published = false;

	/// <summary>
	/// 访问控制ACL
	/// </summary>
	this.SubjectToAcl = false;
	/// <summary>
	/// Gets or sets a value indicating whether the entity has been deleted
	/// </summary>
	this.Deleted = false;

	/// <summary>
	/// Gets or sets the date and time of product creation
	/// </summary>
	this.CreatedOnUtc = new Date();

	/// <summary>
	/// Gets or sets the date and time of product update
	/// </summary>
	this.UpdatedOnUtc = new Date();
};

module.exports = Product;