module RW.TextureEditor {

    export var disableEnableButton = [function () {
        return {
            require: 'ngModel',
            priority: 1,
            link: function (scope, element, attrs, ngModel: ng.INgModelController) {
                var render = ngModel.$render;
                function resetButton() {
                    if (ngModel.$modelValue===true || ngModel.$modelValue ===1) {
                        element.html("Enabled");
                        element.addClass('btn-success');
                        element.removeClass('btn-danger');
                    } else {
                        element.html("Disabled");
                        element.addClass('btn-danger');
                        element.removeClass('btn-success');
                    }
                    render();
                }

                element.bind('mouseenter', function () {
                    if (ngModel.$modelValue === true || ngModel.$modelValue === 1) {
                        element.html("Disable");
                        element.addClass('btn-danger');
                        element.removeClass('btn-success');
                    } else {
                        element.html("Enable");
                        element.addClass('btn-success');
                        element.removeClass('btn-danger');
                    }
                });
                element.bind('mouseleave', resetButton);

                ngModel.$render = resetButton;

                resetButton();
            }
        }
    }]
}
