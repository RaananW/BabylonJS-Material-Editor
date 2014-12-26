module RW.TextureEditor {
    export class MaterialDefinitionSection {
        public color: HexToBabylon;
        public frensel: FrenselDefinition;
        public texture: TextureDefinition;
        constructor(public name: string, private _object: BABYLON.AbstractMesh, public hasColor, public hasTexture, public hasFrensel) {
            if (hasColor) {
                this.color = new HexToBabylon(name, _object.material);
            }
            if (hasTexture) {
                this.texture = new TextureDefinition(name, _object.material, _object);
            }
            if (hasFrensel) {
                this.frensel = new FrenselDefinition(name, _object.material);
            }
        }
    }
} 