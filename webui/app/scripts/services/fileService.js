(function(app){
	app.factory('FileService', ['$q', function($q){
		var FileService = {};

		if (window.require === undefined) {
			return FileService;
		}

		var fs = require('fs-extra');

		FileService.readFile = function (path) {
			var defered = $q.defer();
			fs.readFile(path, 'utf8', function (err, file) {
				if (err) {
					return defered.reject(err);
				}
				return defered.resolve(file);
			});
			return defered.promise;
		};

		FileService.readJson = function (path) {
			var defered = $q.defer();
			fs.readJson(path, function (err, file) {
				if (err) {
					return defered.reject(err);
				}
				return defered.resolve(file);
			});
			return defered.promise;
		};

		FileService.writeJson = function (path, obj) {
			var defered = $q.defer();
			fs.writeJson(path, obj, function (err, file) {
				if (err) {
					return defered.reject(err);
				}
				return defered.resolve(file);
			});
			return defered.promise;
		};

		return FileService;
	}])
})(app);