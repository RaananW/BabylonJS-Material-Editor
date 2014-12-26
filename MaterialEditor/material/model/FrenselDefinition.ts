module RW.TextureEditor {
    export class FrenselDefinition {
        public leftColor: HexToBabylon;
        public rightColor: HexToBabylon;

        private _propertyInMaterial;

        public frenselVariable: BABYLON.FresnelParameters;

        constructor(name: string, _material: BABYLON.Material) {
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
} 