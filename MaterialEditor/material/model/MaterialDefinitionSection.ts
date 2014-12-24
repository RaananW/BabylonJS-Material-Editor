module RW.TextureEditor {
    export class MaterialDefinitionSection {
        public color: HexToBabylon;
        public frensel: FrenselDefinition;
        public texture: TextureDefinition;
        constructor(public name: string, private _material: BABYLON.StandardMaterial, public hasColor, public hasTexture, public hasFrensel) {
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
} 