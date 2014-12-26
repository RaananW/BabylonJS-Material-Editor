module RW.TextureEditor {
    export class MaterialDefinitionSection {
        public color: HexToBabylon;
        public fresnel: FresnelDefinition;
        public texture: TextureDefinition;
        constructor(public name: string, private _object: BABYLON.AbstractMesh, public hasColor, public hasTexture, public hasFresnel) {
            if (hasColor) {
                this.color = new HexToBabylon(name, _object.material);
            }
            if (hasTexture) {
                this.texture = new TextureDefinition(name, _object.material, _object);
            }
            if (hasFresnel) {
                this.fresnel = new FresnelDefinition(name, _object.material);
            }
        }

        public exportToJavascript(sceneVarName:string, materialName:string, materialVarName:string) : string {
            var strings: Array<string> = [];
            
            if (this.hasColor) {
                var colorArray = this.color.babylonColor.asArray();
                strings.push(materialVarName + "." + this.color.propertyName + " = new BABYLON.Color3(" + colorArray[0] + ", " + colorArray[1] + ", " + colorArray[2] + ")");
            } 
            if (this.hasFresnel && this.fresnel.fresnelVariable.isEnabled) {
                strings.push("//Fresnel Parameters ");
                strings.push(this.fresnel.exportAsJavascript(materialVarName));
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