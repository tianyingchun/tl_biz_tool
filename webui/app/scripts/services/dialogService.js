app.factory('DialogService', ['ngDialog', function (ngDialog) {
    return {
        showAlertDialog: function (msg) {
            var content = '<p style="font-size:17px;margin-top:13px;font-weight:bold;">%s</p>';
            if (msg) {
                content = content.replace('%s', msg);
            }
            ngDialog.open({
                template: content,
                plain: true
            })
        },

        showConfirmDialog: function (argument) {
            // body...
        }
    };
}])
