app.run(['$templateCache', function($templateCache){
	$templateCache.put("template/categoriesSelect.html", 
		"<div class=\"popover-content\">" +
    		"<ul class=\"nav nav-pills nav-stacked\" style='font-size: 12px'>" +
		        "<li>" +
		            "<input class=\"form-control\" ng-click=\"$event.stopPropagation()\" ng-model=\"categoryFilter\">" +
		        "</li>" +
		        "<li ng-repeat='category in categoryList | filter: categoryFilter' ng-click='controller.selectCategory(category,item)'><a href>{{category.displayName}}</a>" +
		        "</li>" +
		   "</ul>" +
		"</div>")
	}
]);
