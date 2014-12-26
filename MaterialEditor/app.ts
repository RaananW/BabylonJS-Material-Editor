
module RW.TextureEditor {
    'use strict';

    export class AngularStarter {

        app: ng.IModule;

        constructor(public name: string) {
            
        }

        public start() {
            $(document).ready(() => {
                this.app = angular.module(name, [
                    'ui.bootstrap',
                    'colorpicker.module',
                    'ui.slider'
                ])
                    .controller("CanvasController", CanvasController)
                    .controller("MaterialController", MaterialController)
                    .controller("MaterialExportModalController", MaterialExportModlController)
                    .controller("TextureController", TextureController)
                    .service("materialService", MaterialService)
                    .service("canvasService", CanvasService)
                    .directive("textureImage", textureImage)
                    .directive("disableEnableButton", disableEnableButton)
                ;

                angular.bootstrap(document, [this.app.name]);
            });
        }
    }

    new AngularStarter('materialEditor').start();
    
}