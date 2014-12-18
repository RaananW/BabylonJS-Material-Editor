module RW.TextureEditor {

    export enum TextureType {
        DIFFUSE,
        BUMP,
        SPECULAR,
        REFLECTION,
        OPACITY,
        EMISSIVE,
        AMBIENT
    }

    export enum BabylonTextureType {
        DYNAMIC,
        BASE,
        VIDEO,
        CUBE
    }

    export interface TextureDefinition {
        canvasId: string;
        type: TextureType;
        title: string;
        isSet?: boolean;
        vOffset?: number;
        uOffset?: number;

    }

    export enum CoordinatesMode {
        //(0 = explicit, 1 spherical, 2 = planar, 3 = cubic, 4 = projection, 5 = skybox)
        EXPLICIT,
        SPHERICAL,
        PLANAR,
        CUBIC,
        PROJECTION//,
        //SKYBOX
    }

    export class TextureDefinitionImpl implements TextureDefinition {
        public isEnabled: boolean;
        public hasAlpha: boolean;
        public getAlphaFromRGB: boolean;
        public vOffset: number;
        public uOffset: number;
        public vScale: number;
        public uScale: number;
        public coordinatesMode: CoordinatesMode;
        public coordinatesIndex: number;
        public uAng: number;
        public vAng: number;
        public wAng: number;
        public wrapU: boolean;
        public wrapV: boolean;

        public level;

        public numberOfImages: number;

        public babylonTextureType: BabylonTextureType;

        public propertyInMaterial: string;
        constructor(public canvasId: string, public type: TextureType, public title: string) {
            this.propertyInMaterial = this.title.toLowerCase() + "Texture";
            //this.title += " Texture";
            this.isEnabled = false;
            this.hasAlpha = false;
            this.getAlphaFromRGB = false;
            this.uOffset = 0;
            this.vOffset = 0;
            this.vScale = 1;
            this.uScale = 1;
            if (type != TextureType.REFLECTION) {
                this.setCoordinatesMode(CoordinatesMode.EXPLICIT);
                this.level = 1;
            } else {
                this.setCoordinatesMode(CoordinatesMode.PLANAR);
                this.level = 0.5;
            }
            this.coordinatesIndex = 0;
            this.wrapU = false;
            this.wrapV = false;
            this.babylonTextureType = BabylonTextureType.DYNAMIC;
        }

        public setCoordinatesMode(mode: CoordinatesMode) {
            this.coordinatesMode = mode;
            if (mode === CoordinatesMode.CUBIC /*|| mode === CoordinatesMode.SKYBOX*/) {
                this.numberOfImages = 6;
            } else {
                this.numberOfImages = 1;
            }
        }

        public setBabylonTextureType(type: BabylonTextureType) {
            this.babylonTextureType = type;
            if (type === BabylonTextureType.CUBE) {
                this.setCoordinatesMode(CoordinatesMode.CUBIC);
            }
        }

        //for ng-repeat
        public getCanvasNumber = () => {
            return new Array(this.numberOfImages);
        }
    }

    export interface TextureScope extends ng.IScope {
        textures: Array<TextureDefinitionImpl>;
    }

    export class TextureController {

        public static $inject = [
            '$scope',
            'textureService',
            'canvasService'
        ];

        public textures;

        constructor(
            private $scope: TextureScope,
            private textureService: TextureService,
            private canvasService: CanvasService
            ) {
            $scope.textures = []

            $scope.textures.push(new TextureDefinitionImpl('diffuseCanvas', TextureType.DIFFUSE, 'Diffuse'));
            $scope.textures.push(new TextureDefinitionImpl('bumpCanvas', TextureType.BUMP, 'Bump'));
            $scope.textures.push(new TextureDefinitionImpl('specularCanvas', TextureType.SPECULAR, 'Specular'));
            $scope.textures.push(new TextureDefinitionImpl('reflectionCanvas', TextureType.REFLECTION, 'Reflection'));
            $scope.textures.push(new TextureDefinitionImpl('opacityCanvas', TextureType.OPACITY, 'Opacity'));
            $scope.textures.push(new TextureDefinitionImpl('emissiveCanvas', TextureType.EMISSIVE, 'Emissive'));
            $scope.textures.push(new TextureDefinitionImpl('ambientCanvas', TextureType.AMBIENT, 'Ambient'));

            $scope["updateTexture"] = (type) => {
                var texture = this.$scope.textures.filter((tex) => {
                    return tex.type === type;
                })[0];
                if (texture)
                    this.textureService.changeTexture(texture);
            }
        }
    }
}