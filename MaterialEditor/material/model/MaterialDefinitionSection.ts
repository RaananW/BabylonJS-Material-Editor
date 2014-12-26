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

        public exportToJavascript(sceneVarName:string, materialName:string, materialVarName:string) : string {
            var strings: Array<string> = [];
            
            if (this.hasColor) {
                var colorArray = this.color.babylonColor.asArray();
                strings.push(materialVarName + "." + this.color.propertyName + " = new BABYLON.Color3(" + colorArray[0] + ", " + colorArray[1] + ", " + colorArray[2] + ")");
            } 
            if (this.hasFrensel && this.frensel.frenselVariable.isEnabled) {
                strings.push("//Frensel Parameters ");
                strings.push(this.frensel.exportAsJavascript(materialVarName));
            }
            if (this.hasTexture && this.texture.enabled()) {
                strings.push("//Texture Parameters ");
                strings.push(this.texture.exportAsJavascript(sceneVarName, materialVarName));
            }

            if (strings.length != 0) {
                strings.unshift("\n");
                strings.unshift("// " + this.name + " definitions");
                strings.unshift("\n");
            }

            return strings.join(";\n");
        }
    }
} 