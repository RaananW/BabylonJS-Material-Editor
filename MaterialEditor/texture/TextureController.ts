module RW.TextureEditor {

    export interface TextureScope extends ng.IScope {
        textures: Array<TextureDefinition>;
    }

    export class TextureController {

        public static $inject = [
            '$scope',
            'canvasService',
            'materialService'
        ];

        public textures;

        constructor(
            private $scope: TextureScope,
            private canvasService: CanvasService,
            private materialService:MaterialService
            ) {
        }
    }
}