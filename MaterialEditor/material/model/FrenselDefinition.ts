module RW.TextureEditor {
    export class FrenselDefinition {
        public leftColor: HexToBabylon;
        public rightColor: HexToBabylon;

        private _propertyInMaterial;

        public frenselVariable: BABYLON.FresnelParameters;

        constructor(private name: string, _material: BABYLON.Material) {
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

        public exportAsJavascript(materialVarName: string) : string {
            var strings: Array<string> = [];
            var varName = materialVarName + "_" + this.name + "Fresnel";
            strings.push("var " + varName + " = new BABYLON.FresnelParameters()");
            strings.push(varName + ".isEnabled = true");
            strings.push(varName + ".bias = " + this.frenselVariable.bias);
            strings.push(varName + ".power = " + this.frenselVariable.power);
            var colorArray = this.frenselVariable.leftColor.asArray();
            strings.push(varName + "." + "leftColor" + " = new BABYLON.Color3(" + colorArray[0] + ", " + colorArray[1] + ", " + colorArray[2] + ")");
            colorArray = this.frenselVariable.rightColor.asArray();
            strings.push(varName + "." + "rightColor" + " = new BABYLON.Color3(" + colorArray[0] + ", " + colorArray[1] + ", " + colorArray[2] + ")");
            strings.push(materialVarName + "." + this._propertyInMaterial + " = " + varName);

            return strings.join(";\n");
        }
    }
} 