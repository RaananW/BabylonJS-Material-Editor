module RW.TextureEditor {

    export var disableEnableButton = [function () {
        return {
            require: 'ngModel',
            priority: 1,
            link: function (scope, element, attrs, ngModel:ng.INgModelController) {
                if (ngModel.$modelValue) {
                    element.html("Enabled");
                    element.addClass('btn-success');
                } else {
                    element.html("Disabled");
                    element.addClass('btn-danger');
                }
                element.bind('mouseenter', function () {
                    if (ngModel.$modelValue) {
                        element.html("Disable");
                        element.addClass('btn-danger');
                        element.removeClass('btn-success');
                    } else {
                        element.html("Enable");
                        element.addClass('btn-success');
                        element.removeClass('btn-danger');
                    }
                });
                element.bind('mouseleave', function () {
                    if (ngModel.$modelValue) {
                        element.html("Enabled");
                        element.addClass('btn-success');
                        element.removeClass('btn-danger');
                    } else {
                        element.html("Disabled");
                        element.addClass('btn-danger');
                        element.removeClass('btn-success');
                    }
                });

                ngModel.$render = () => {
                    if (ngModel.$modelValue) {
                        element.html("Enabled");
                        element.addClass('btn-success');
                        element.removeClass('btn-danger');
                    } else {
                        element.html("Disabled");
                        element.addClass('btn-danger');
                        element.removeClass('btn-success');
                    }
                }
            }
        }
    }]
}
