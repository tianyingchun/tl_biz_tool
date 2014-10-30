(function(app) {

    //service constructor.
    function EncryptService($log, BaseHttpRequest, encryptor) {
        // each service must be defined this key used to flag current request belong to.
        this.logAPIUniqueKey = "[EncryptService]";

        // inherits base http request infrustrature.
        BaseHttpRequest.call(this);

        this.encryptorPwdDto = function(result, requestData, password) {
            if (result.code == "1000") {
                var ts = result.data.timestamp;
                var aPK = result.data.controllerPublicKey;
                var hPK = result.data.securityPublicKey;

                var encryptedPwd = encryptor(ts, aPK, hPK, password);
                result.encryptedPwd = encryptedPwd;
            }
            $log.debug("Encrypt password result: ", result);

            return result;
        };

        angular.extend(EncryptService.prototype, {
            // 加密用户设置的密码  hotfix for p1 service, manaully add appid:"100001", clientId:"e90_h5_apply"
            encryptPassword: function(password, sucess_cb, failed_cb) {
                var promise = this.remoteRequest("/p1/op_query_public_key.json", {
                    operationType: "/p1/op_query_public_key.json",
                    appId: "100001",
                    clientId: "e90_h5_apply"
                }, this.encryptorPwdDto, password);
                promise.then(sucess_cb, failed_cb || sucess_cb);
            }
        });
    };

    app.service("EncryptService", ["$log", "httpRequest", "encryptor", EncryptService]);
})(app);
