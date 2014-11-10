app.controller("AutoUploadCtrl", ["$scope", "FileService", function ($scope, FileService) {

	$scope.list = [];

	this.uploadFile = function () {
		helper.file_upload.click();
		helper.file_upload.change(function () {
			var path = $(this).val();
			$(this).val('');
			console.log(path);

			var promise = FileService.readFile(path);
			promise.then(function (file) {
				console.log(file);
				var results = file.trim().split('\n');
				angular.forEach(results, function (item) {
					var temp = {};
					temp.url = item;
					$scope.list.push(temp);
				})
			})
		})
	};

	this.doBatch = function (arguments) {
		
	}

	
}])