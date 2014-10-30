(function(app) {
    /**
     * OTP verification service.
     */
    function PaymentSettingService($log, BaseHttpRequest) {
        // each service must be defined this key used to flag current request belong to.
        this.logAPIUniqueKey = "[PaymentSettingService]";

        // inherits base http request infrustrature.
        BaseHttpRequest.call(this);

    };
    // Expose service request apis to consumer.
    angular.extend(PaymentSettingService.prototype, {
        // save user password
        savePaymentPassword: function(otpSessionId, idCardNumber, payPassword, newRegUser, success_cb, failed_cb) {
            var promise = this.remoteRequest("/h5/op_hyk_set_paypwd_and_submit.json", {
                operationType: "/h5/op_hyk_set_paypwd_and_submit.json",
                identityNum: idCardNumber,
                otpSessionId: otpSessionId,
                payPassword: payPassword,
                newRegUser: newRegUser
            });
            promise.then(success_cb, failed_cb || success_cb);
        }
    });
    app.service("PaymentSettingService", ["$log", "httpRequest", PaymentSettingService]);
})(app);
