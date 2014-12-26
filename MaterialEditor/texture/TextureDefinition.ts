
module RW.TextureEditor {
    export class TextureDefinition {

        private _isEnabled: boolean;
        public init: boolean;
        public numberOfImages: number;
        public babylonTextureType: BabylonTextureType;
        public propertyInMaterial: string;
        public canvasId: string;

        private _isMirror: boolean;

        public textureVariable: BABYLON.Texture;

        constructor(public name: string, private _material: BABYLON.Material, private _connectedMesh : BABYLON.AbstractMesh) {
            this.propertyInMaterial = this.name.toLowerCase() + "Texture";
            this.canvasId = this.name + "Canvas";
            this.numberOfImages = 1;
            if (this._material[this.propertyInMaterial]) {
                if (this._material[this.propertyInMaterial] instanceof BABYLON.MirrorTexture) {
                    this.babylonTextureType = BabylonTextureType.MIRROR;
                } else if (this._material[this.propertyInMaterial] instanceof BABYLON.VideoTexture) {
                    this.babylonTextureType = BabylonTextureType.MIRROR;
                } else if (this._material[this.propertyInMaterial] instanceof BABYLON.CubeTexture) {
                    this.babylonTextureType = BabylonTextureType.CUBE;
                } else {
                    this.babylonTextureType = BabylonTextureType.NORMAL;
                }
                this.enabled(true);
                this.initFromMaterial();
            } else {
                this.babylonTextureType = BabylonTextureType.NORMAL;
                this.enabled(false);
                this.init = false;
                //clean canvas
                var canvasElement = <HTMLCanvasElement> document.getElementById(this.canvasId + "-0");
                if (canvasElement) {
                    var context = canvasElement.getContext("2d");
                    context.clearRect(0, 0, canvasElement.width, canvasElement.height);
                }
            }
        }

        private initTexture() {
            if (this.textureVariable) {
                this.textureVariable.dispose();
            }
            var canvasElement = <HTMLCanvasElement> document.getElementById(this.canvasId + "-0");
            var base64 = canvasElement.toDataURL();
            this.textureVariable = new BABYLON.Texture(base64, this._material.getScene(), false, undefined, undefined, undefined, undefined, base64, false);
            if (this.name != "reflection") {
                this.coordinatesMode(CoordinatesMode.EXPLICIT);
            } else {
                this.coordinatesMode(CoordinatesMode.PLANAR);
            }
            //this.babylonTextureType = BabylonTextureType.NORMAL;
            this.init = true;
        }

        private initFromMaterial() {
            this.textureVariable = this._material[this.propertyInMaterial];
            this.init = true;
        }

        public coordinatesMode(mode: CoordinatesMode) {
            if (angular.isDefined(mode)) {
                this.textureVariable.coordinatesMode = mode;
                if (mode === CoordinatesMode.CUBIC) {
                    this.numberOfImages = 6;
                } else {
                    this.numberOfImages = 1;
                }
            } else {
                return this.textureVariable ? this.textureVariable.coordinatesMode : 0;
            }
        }

        public mirrorEnabled(enabled: boolean) {
            if (angular.isDefined(enabled)) {
                if (enabled) {
                    if (this.name != "reflection") {
                        throw new Error("wrong texture for mirror! Should be reflection!");
                    }
                    this.babylonTextureType = BabylonTextureType.MIRROR;
                    //create the mirror
                    this.textureVariable = new BABYLON.MirrorTexture("mirrorTex", 512, this._material.getScene());
                    this.textureVariable['renderList'] = this._material.getScene().meshes;
                    //calculate plane
                    var pointsArray: Array<BABYLON.Vector3> = [];
                    var meshWorldMatrix = this._connectedMesh.computeWorldMatrix();
                    var verticesPos = this._connectedMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
                    for (var i = 0; i < 3; i++) {
                        pointsArray.push(BABYLON.Vector3.TransformCoordinates(BABYLON.Vector3.FromArray(verticesPos, i * 3), meshWorldMatrix));
                    }
                    this.textureVariable['mirrorPlane'] = BABYLON.Plane.FromPoints(pointsArray[0], pointsArray[1], pointsArray[2]);
                    this.init = true;
                    if (!this._isEnabled) {
                        this.enabled(true);
                    }
                } else {
                    this.babylonTextureType = BabylonTextureType.NORMAL;
                    this._material[this.propertyInMaterial] = null;
                    this.init = false;
                }
            } else {
                return this._isEnabled && this.babylonTextureType == BabylonTextureType.MIRROR;
            }
        }

        public enabled(enabled?: boolean) {
            if (angular.isDefined(enabled)) {
                if (enabled) {
                    if (this.textureVariable)
                        this._material[this.propertyInMaterial] = this.textureVariable;
                    this._isEnabled = true;
                } else {
                    this._material[this.propertyInMaterial] = null;
                    this._isEnabled = false;
                }

            } else {
                return this._isEnabled;
            }
        }

        public canvasUpdated() {
            this.initTexture();
            if (this._isEnabled) {
                this._material[this.propertyInMaterial] = this.textureVariable;
            }
        }

        //TODO implement video support etc'. At the moment only dynamic is supported.

        /*public setBabylonTextureType(type: BabylonTextureType) {
            this.babylonTextureType = type;
            if (type === BabylonTextureType.CUBE) {
                this.coordinatesMode(CoordinatesMode.CUBIC);
            }
        }*/

        public exportAsJavascript(sceneVarName:string, materialVarName:string) : string {
            var strings: Array<string> = [];
            var varName = materialVarName + "_" + this.name + "Texture";

            //init the variable
            if (this.babylonTextureType == BabylonTextureType.MIRROR) {
                strings.push("var " + varName + " = new BABYLON.MirrorTexture('MirrorTexture', 512," + sceneVarName + " )");
                var plane: BABYLON.Plane = this.textureVariable['mirrorPlane'];
                var array = plane.asArray();
                strings.push(varName + ".mirrorPlane = new BABYLON.Plane(" + array[0] + "," + array[1] + "," + array[2] + "," + array[3] + ")");
                strings.push("// Change the render list to fit your needs. The scene's meshes is being used per default");
                strings.push(varName + ".renderList = " + sceneVarName + ".meshes");
            } else {
                var extension = this.textureVariable.hasAlpha ? ".png" : ".jpg";
                strings.push("var " + varName + " = new BABYLON.Texture('"+ materialVarName+ "_" + this.name + extension +"', " + sceneVarName + ")");
            }
            //uvw stuff
            ["uScale", "vScale", "coordinatesMode", "uOffset", "vOffset", "uAngle", "vAngle", "level", "coordinatesIndex", "hasAlpha", "getAlphaFromRGB"].forEach((param) => {
                strings.push(varName + "." + param + " = " + this.textureVariable[param]);
            });
            strings.push("");
            strings.push(materialVarName + "."+this.propertyInMaterial+ " = " + varName);
            return strings.join(";\n");
        }

        //for ng-repeat
        public getCanvasNumber = () => {
            return new Array(this.numberOfImages);
        }
    }
} 