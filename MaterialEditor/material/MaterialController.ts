module RW.TextureEditor {

    export interface MaterialScope extends ng.IScope {
        material: BABYLON.StandardMaterial;
        sectionNames: string[];
        materialSections: { [section: string]: MaterialDefinitionSection };
        updateTexture(type): void;
    }

    export class FrenselDefinition {
        public leftColor: HexToBabylon;
        public rightColor: HexToBabylon;

        private _propertyInMaterial;

        public frenselVariable: BABYLON.FresnelParameters;

        constructor(name: string, _material: BABYLON.StandardMaterial) {
            this._propertyInMaterial = name + 'FresnelParameters';
            if (_material[this._propertyInMaterial]) {
                this.frenselVariable = _material[this._propertyInMaterial];
            } else {
                this.frenselVariable = new BABYLON.FresnelParameters();
                this.frenselVariable.isEnabled = false;
                _material[this._propertyInMaterial] = this.frenselVariable;
            }
            this.leftColor = new HexToBabylon("left", _material[this._propertyInMaterial]),
            this.rightColor = new HexToBabylon("right", _material[this._propertyInMaterial])
            
        }
    }

    export class MaterialDefinitionSection {
        public color: HexToBabylon;
        public frensel: FrenselDefinition;
        public texture: TextureDefinition;
        constructor(public name: string, private _material : BABYLON.StandardMaterial, public hasColor, public hasTexture, public hasFrensel) {
            if (hasColor) {
                this.color = new HexToBabylon(name, _material);
            }
            if (hasTexture) {
                this.texture = new TextureDefinition(name, _material);
            }
            if (hasFrensel) {
                this.frensel = new FrenselDefinition(name, _material);
            }
        }
    }

    export class HexToBabylon {
        public babylonColor: BABYLON.Color3;
        private _hex: string;
        constructor(public propertyName: string, private _variable: any) {
            this.propertyName += "Color";
            this._setBabylonColor(_variable[this.propertyName]);
        }

        //angular getter/setter
        public hex(hex?: string) {
            if (hex) {
                this._hex = hex;
                this.babylonColor = this.convertStringToBabylonArray(this._hex);
                if (this.babylonColor) {
                    this._variable[this.propertyName] = this.babylonColor;
                }
            } else {
                return this._hex;
            }
        }

        private _setBabylonColor(color: BABYLON.Color3) {
            this.babylonColor = color;
            var hex = "#";
            ['r', 'g', 'b'].forEach((channel) => {
                var c = color[channel] * 255;
                hex = hex + ((c < 16) ? "0" + c.toString(16) : "" + c.toString(16));
            });
            
            this._hex = hex;
        }

        private convertStringToBabylonArray(hex: string): BABYLON.Color3 {
            //http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb

            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function (m, r, g, b) {
                return r + r + g + g + b + b;
            });

            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? BABYLON.Color3.FromArray([
                parseInt(result[1], 16) / 255,
                parseInt(result[2], 16) / 255,
                parseInt(result[3], 16) / 255
            ]) : null;
        }
    }
        
    export class MaterialController {

        public static $inject = [
            '$scope',
            'canvasService',
            'materialService'
        ];
        
        constructor(
            private $scope: MaterialScope,
            private canvasService: CanvasService,
            private materialService:MaterialService
            ) {
            //todo will this work??
            $scope.material = this.canvasService.getMaterial();

            $scope.sectionNames = this.materialService.getMaterialSectionsArray();
            $scope.materialSections = this.materialService.getMaterialSections();

            $scope.updateTexture = (type) => {
                $scope.$apply(() => {
                    $scope.materialSections[type].texture.canvasUpdated();
                });
            }

            $scope.$on("objectChanged", () => {
                console.log("changed");
                this.materialService.initMaterialSections();
                $scope.material = this.canvasService.getMaterial();
                $scope.sectionNames = this.materialService.getMaterialSectionsArray();
                $scope.materialSections = this.materialService.getMaterialSections();
            });
        }
    }
}