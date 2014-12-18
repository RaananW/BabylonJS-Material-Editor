module RW.TextureEditor {
    export class TextureService {
        public static $inject = [
            '$rootScope',
            'canvasService'
        ]

        private _material: BABYLON.StandardMaterial;

        //needed due to babylon resetting the canvas when initialized.
        private _setTextures: { [id: number]: BABYLON.Texture };
        
        constructor(private $rootScope: TextureEditorRootScope, private canvasService:CanvasService) {
            this._material = $rootScope.material;
            this._material.backFaceCulling = true;
            $rootScope.texturedObject.material = this._material;
            this._setTextures = {};
        }

        public changeTexture(textureDef: TextureDefinitionImpl) {
            //TODO cube processing

            var texture: BABYLON.Texture;
            if (this._setTextures[textureDef.type]) {
                texture = this._setTextures[textureDef.type];
            } else {
                var canvasElement = document.getElementById(textureDef.canvasId + "-0");
                texture = new BABYLON.DynamicTexture(textureDef.title, canvasElement, this.$rootScope.scene, false);
            }

            this._setTextures[textureDef.type] = texture;

            if (!textureDef.isEnabled) {
                //not disposing, the texture will simply be reenabled
                this._material[textureDef.propertyInMaterial] = null;
                return;
            } 

            for (var property in textureDef) {
                if (textureDef.hasOwnProperty(property) && texture.hasOwnProperty(property)) {
                    texture[property] = textureDef[property];
                }
            }

            this.canvasService.updateTexture(textureDef.propertyInMaterial, texture);
        }
    }
} 