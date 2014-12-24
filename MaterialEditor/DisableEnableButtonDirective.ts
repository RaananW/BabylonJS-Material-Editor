module RW.TextureEditor {

    export var disableEnableButton = [function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
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
                //hack due to angulars changing the model later than the click. TODO - find a better way of doing that...
                element.bind('click', function () {
                    if (!ngModel.$modelValue) {
                        element.html("Enabled");
                        element.addClass('btn-success');
                        element.removeClass('btn-danger');
                    } else {
                        element.html("Disabled");
                        element.addClass('btn-danger');
                        element.removeClass('btn-success');
                    }
                });
            }
        }
    }]
}
