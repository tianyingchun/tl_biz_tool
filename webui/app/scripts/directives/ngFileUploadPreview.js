 app.directive('ngFilePreview', ["$log",
     function($log) {
         return {
             restrict: 'AC',
             scope: {
                 progress: '=progress',
                 previewImgSrc: '=ngFilePreview',
                 resizedWidth: "@",
                 resizedHeight: "@"
             },
             controller: ["$scope", "megaPixImageReader", function($scope, fileReader) {
                 // initialize progress equals 0
                 $scope.progress = 0;
                 $scope.resizedWidth = $scope.resizedWidth || 480;
                 $scope.resizedHeight = $scope.resizedHeight || 360;

                 $scope.getFile = function() {
                     $scope.progress = 0;
                     fileReader.readAsDataUrl($scope.file, $scope)
                         .then(function(result) {
                             $scope.previewImgSrc = result;
                             $scope.progress = 0;
                         });
                 };
                 $scope.$on("fileProgress", function(e, progress) {
                     $scope.progress = (progress.loaded / progress.total) * 100;
                 });
             }],
             link: function(scope, element, attrs) {
                 // find corresponding preview databinding name.
                 // only support single input[type='file'].
                 var $file = element.find("input");
                 $file.bind("change", function(e) {
                     scope.file = (e.srcElement || e.target).files[0];
                     scope.getFile();
                 });
             }
         };
     }
 ]);
