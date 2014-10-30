var fileReader = function($q, $log) {
    // 此用法在IOS 7.1.1 iphone5s 上会有压缩图片到Canvas 上的BUG
    // 暂时用 providers/megaPixImageReader.js 来替换
    // 
    // var onLoad = function(reader, deferred, scope) {
    //     return function() {
    //         // scope.$apply(function() {
    //         //     deferred.resolve(reader.result);
    //         // });
    //     };
    // };

    var onLoadEnd = function(reader, deferred, scope) {
        return function() {
            function drawRotated(ctx, canvas, tempImg, degrees) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(degrees * Math.PI / 180);
                ctx.drawImage(tempImg, -tempImg.width / 2, -tempImg.width / 2);
                ctx.restore();
            }
            
            var tempImg = new Image();
            tempImg.src = reader.result;
            tempImg.onload = function() {

                var MAX_WIDTH = parseInt(scope.resizedWidth) || 480;
                var MAX_HEIGHT = parseInt(scope.resizedHeight) || 360;
                var tempW = tempImg.width;
                var tempH = tempImg.height;

                if (tempW > tempH) {
                    if (tempW > MAX_WIDTH) {
                        tempH *= MAX_WIDTH / tempW;
                        tempW = MAX_WIDTH;
                    }
                } else {
                    if (tempH > MAX_HEIGHT) {
                        tempW *= MAX_HEIGHT / tempH;
                        tempH = MAX_HEIGHT;
                    }
                }
                var $canvas = angular.element("<canvas>").attr({
                    "width": tempW,
                    "height": tempH
                });
                var canvas = $canvas[0];

                var ctx = canvas.getContext("2d");

                ctx.drawImage(tempImg, 0, 0, tempW, tempH);
                // rotate.
                // drawRotated(ctx, canvas, tempImg, 90);
                var dataURL = canvas.toDataURL("image/jpeg");
                // remove tempory canvas
                $canvas.remove();

                scope.$apply(function() {
                    deferred.resolve(dataURL);
                });
            }
        }
    };

    var onError = function(reader, deferred, scope) {
        return function() {
            scope.$apply(function() {
                deferred.reject(reader.result);
            });
        };
    };

    var onProgress = function(reader, scope) {
        return function(event) {
            scope.$broadcast("fileProgress", {
                total: event.total,
                loaded: event.loaded
            });
        };
    };

    var getReader = function(deferred, scope) {
        var reader = new FileReader();
        // reader.onload = onLoad(reader, deferred, scope);
        // resize picture size.
        reader.onloadend = onLoadEnd(reader, deferred, scope);
        reader.onerror = onError(reader, deferred, scope);
        reader.onprogress = onProgress(reader, scope);
        return reader;
    };

    //
    // compress upload pictures here.
    // ----------------------------------------------



    var readAsDataURL = function(file, scope) {
        var deferred = $q.defer();

        var reader = getReader(deferred, scope);
        if (file) {
            reader.readAsDataURL(file);
        }

        return deferred.promise;
    };

    return {
        readAsDataUrl: readAsDataURL
    };
};

app.factory("fileReader", ["$q", "$log", fileReader]);
