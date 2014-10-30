(function(app) {
    /**
     * OTP verification service.
     */
    function OtpVerificationService($log, BaseHttpRequest) {
        // each service must be defined this key used to flag current request belong to.
        this.logAPIUniqueKey = "[OtpVerification]";

        // inherits base http request infrustrature.
        BaseHttpRequest.call(this);

    };
    // Expose service request apis to consumer.
    angular.extend(OtpVerificationService.prototype, {
        // 根据用户提供的手机号码 发送短信验证码到用户手机。
        grabOtpCode: function(phoneNumber, success_cb, failed_cb) {
            var promise = this.remoteRequest("/h5/op_hyk_send_apply_sms.json", {
                operationType: "op_hyk_send_apply_sms.json",
                phone: phoneNumber
            });
            promise.then(success_cb, failed_cb || success_cb);
        }
    });
    app.service("OtpVerificationService", ["$log", "httpRequest", OtpVerificationService]);
})(app);
