/**
 * some costomized form field validators.
 */
app.directive("idcardValidate", ["$log", "utility", "UtilityService", "regexRules", function($log, utility, utilityService, regexRules) {
    return {
        require: "ngModel",
        link: function(scope, elm, attrs, ctrl) {
            var bingdingTo = attrs["idcardValidate"];
            ctrl.$parsers.unshift(function(viewValue) {
                scope.idCardValid = (viewValue && regexRules["idcard"].test(viewValue)) ? 'valid' : undefined;
                if (scope.idCardValid) {
                    ctrl.$setValidity('idCard', true);
                    scope.loadingIdCardOrg = true;
                    utilityService.getIdCardOrgInfo(viewValue, function(result) {
                        $log.info("fethched id card org: ", result);
                        scope.loadingIdCardOrg = false;
                        utility.ns(scope, bingdingTo, result.idCardOrg);
                    });
                    return viewValue;
                } else {
                    ctrl.$setValidity('idCard', false);
                    return undefined;
                }
            });
        }
    };
}]);

// app.directive("passwordValidate", function() {
//     return {
//         require: "ngModel",
//         link: function(scope, elm, attrs, ctrl) {
//             ctrl.$parsers.unshift(function(viewValue) {
//                 scope.pwdValidLength = (viewValue && viewValue.length >= 8 ? 'valid' : undefined);
//                 scope.pwdHasLetter = (viewValue && /[A-z]/.test(viewValue)) ? 'valid' : undefined;
//                 scope.pwdHasNumber = (viewValue && /\d/.test(viewValue)) ? 'valid' : undefined;

//                 if (scope.pwdValidLength && scope.pwdHasLetter && scope.pwdHasNumber) {
//                     ctrl.$setValidity('pwd', true);
//                     return viewValue;
//                 } else {
//                     ctrl.$setValidity('pwd', false);
//                     return undefined;
//                 }
//             });
//         }
//     };
// })
