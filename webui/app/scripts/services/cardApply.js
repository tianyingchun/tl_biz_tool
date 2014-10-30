(function() {
    function CardApplyService($log, BaseHttpRequest) {

            // each service must be defined this key used to flag current request belong to.
            this.logAPIUniqueKey = "[CardApplyService]";

            // inherits base http request infrustrature.
            BaseHttpRequest.call(this);

            //
            // customized dto: inviterDto.
            // --------------------------------------------------
            //  dto inviter
            this.inviterDto = function(result) {
                return {
                    code: result.code,
                    message: result.message,
                    mobile: result.data.phone,
                    name: result.data.name
                };
            };

            // dto EligibilityDto
            this.EligibilityDto = function(result) {
                return {
                    code: result.code,
                    message: result.message,
                    circulation: result.data.testCapacity
                };
            };
        }
        //
        // Expose service request apis to consumer.
    angular.extend(CardApplyService.prototype, {
        // 根据邀请人的ID 获取邀请人的信息（手机号码）
        getInviterInfo: function(cid, sucess_cb, failed_cb) {
            var promise = this.remoteRequest("/h5/op_get_inviter_phone.json", {
                operationType: "op_get_inviter_phone.json",
                inviterUID: cid
            }, this.inviterDto);
            promise.then(sucess_cb, failed_cb || sucess_cb);
        },
        // 校验当前用户是否有资格申请 E90 信用卡
        verifyIfHasEligibility: function(latlon, sucess_cb, failed_cb) {
            var promise = this.remoteRequest("/h5/op_hyk_verify_eligibility.json", {
                operationType: "op_hyk_verify_eligibility.json",
                latlon: latlon
            }, this.EligibilityDto);
            promise.then(sucess_cb, failed_cb || sucess_cb);
        },
        //校验用户身份信息
        verifyIdentityInfo: function(data, success_cb, failed_cb) {
            var cfg = {
                operationType: "op_hyk_verify_identity.json"
            };
            angular.extend(cfg, data);
            var promise = this.remoteRequest("/h5/op_hyk_verify_identity.json", cfg);
            promise.then(success_cb, failed_cb || success_cb);
        },
        // 当身份证照片上传成功之后，同时讲身份证的返回PATH 保存到服务器
        saveUploadedIDImageUrl: function(idNum, positiveIDImageUrl, negativeIDImageUrl, success_cb, failed_cb) {
            var cfg = {
                operationType: "/h5/op_hyk_upload_identity_image.json"
            };
            angular.extend(cfg, {
                identityNum: idNum,
                pathPositive: positiveIDImageUrl,
                pathReverse: negativeIDImageUrl
            });
            var promise = this.remoteRequest("/h5/op_hyk_upload_identity_image.json", cfg);
            promise.then(success_cb, failed_cb || success_cb);
        },
        //提交OTP 验证码同时带上用户 邮寄地址信息.
        submitApplicationInfo: function(idNum, mobile, smsCode, addressInfo, success_cb, failed_cb) {
            var cfg = {
                operationType: "/h5/op_hyk_submit_applicant_info.json",
                identityNum: idNum,
                phone: mobile,
                smsCode: smsCode
            };
            angular.extend(cfg, addressInfo);
            var promise = this.remoteRequest("/h5/op_hyk_submit_applicant_info.json", cfg);
            promise.then(success_cb, failed_cb || success_cb);
        }

    });

    // expose service contract.
    app.service('CardApplyService', ['$log', 'httpRequest', CardApplyService]);

})(app);
