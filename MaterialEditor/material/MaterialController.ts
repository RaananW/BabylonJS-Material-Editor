module RW.TextureEditor {

    export interface MaterialScope extends ng.IScope {
        material: BABYLON.StandardMaterial;
        colors: { [id: string]: HexToBabylon };
        frenselTypes: Array<String>;
        frensels;
        updateColor: (property: string) => void;
    }

    export class HexToBabylon {
        public babylonColor: BABYLON.Color3;
        public hex: string;
        constructor(public propertyName:string, private variable:any) {

            this.setBabylonColor(variable[propertyName]);
        }

        public setHex(hex: string) {
            this.hex = hex;
            this.babylonColor = this.convertStringToBabylonArray(hex);
        }

        public setBabylonColor(color: BABYLON.Color3) {
            this.babylonColor = color;
            var hex = "#";
            ['r', 'g', 'b'].forEach((channel) => {
                var c = color[channel] * 255;
                hex = hex + ((c < 16) ? "0" + c.toString(16) : "" + c.toString(16));
            });
            
            this.hex = hex;
        }

        public updateColor() {
            this.babylonColor = this.convertStringToBabylonArray(this.hex);
            if (this.babylonColor) {
                this.variable[this.propertyName] = this.babylonColor;
            }
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
            'canvasService'
        ];
        
        constructor(
            private $scope: MaterialScope,
            private canvasService: CanvasService
            ) {
            //todo will this work??
            $scope.material = this.canvasService.getMaterial();
            $scope.colors = {};

            ["diffuseColor", "specularColor", "emissiveColor", "ambientColor"].forEach((property) => {
                $scope.colors[property] = new HexToBabylon(property, $scope.material);
            });

            $scope.frenselTypes = [];
            $scope.frensels = {};

            ["diffuse", "emissive", "reflection", "opacity"].forEach((type) => {
                $scope.frenselTypes.push(type);
                $scope.frensels[type] = {
                    left: new HexToBabylon("leftColor", $scope.material[type + 'FresnelParameters']),
                    right: new HexToBabylon("rightColor", $scope.material[type + 'FresnelParameters'])
                };
            });
        }

        public updateColor(property: string) {
            this.$scope.colors[property].updateColor();
        }

        public updateFrenselColor(property: string, scopeProperty:string) {
            this.$scope.frensels[scopeProperty][property].updateColor();
        }
    }
}