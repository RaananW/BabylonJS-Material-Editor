
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
                    .controller("TextureController", TextureController)
                    .service("textureService", TextureService)
                    .service("canvasService", CanvasService)
                    .directive("textureImage", textureImage)
                ;

                angular.bootstrap(document, [this.app.name]);
            });
        }
    }

    new AngularStarter('materialEditor').start();
    
}