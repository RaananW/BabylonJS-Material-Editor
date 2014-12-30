module RW.TextureEditor {
    export class MaterialService {
        public static $inject = [
            '$rootScope',
            'canvasService'
        ]  

        public materialSections: { [section: string]: MaterialDefinitionSection };

        constructor(private $rootScope: TextureEditorRootScope, private canvasService: CanvasService) {
            //this.initMaterialSections();
        }

        public initMaterialSections(object: BABYLON.AbstractMesh, multiMaterialPosition?:number) {
            this.materialSections = {};
            console.log(object.material);
            this.materialSections["diffuse"] = new MaterialDefinitionSection("diffuse", object, true, true, true, multiMaterialPosition);
            this.materialSections["emissive"] = new MaterialDefinitionSection("emissive", object, true, true, true, multiMaterialPosition);
            this.materialSections["ambient"] = new MaterialDefinitionSection("ambient", object, true, true, false, multiMaterialPosition);
            this.materialSections["opacity"] = new MaterialDefinitionSection("opacity", object, false, true, true, multiMaterialPosition);
            this.materialSections["specular"] = new MaterialDefinitionSection("specular", object, true, true, false, multiMaterialPosition);
            this.materialSections["reflection"] = new MaterialDefinitionSection("reflection", object, false, true, true, multiMaterialPosition);
            this.materialSections["bump"] = new MaterialDefinitionSection("bump", object, false, true, false, multiMaterialPosition);
        }

        public getMaterialSectionsArray() : string[] {
            return Object.keys(this.materialSections);
        }

        public getMaterialSections(): { [section: string]: MaterialDefinitionSection } {
            return this.materialSections;
        }

        public exportAsBabylonScene(materialId:string, originalMaterial:BABYLON.StandardMaterial) {
            var material = {
                id: materialId,
                name: materialId,
                alpha: originalMaterial.alpha,
                backFaceCulling: originalMaterial.backFaceCulling,
                specularPower: originalMaterial.specularPower,
                useSpecularOverAlpha: originalMaterial.useSpecularOverAlpha,
                useAlphaFromDiffuseTexture: originalMaterial.useAlphaFromDiffuseTexture
            };
            Object.keys(this.materialSections).forEach((definition) => {
                this.materialSections[definition].exportAsBabylonScene(material);
            });

            //now make it babylon compatible
            var babylonScene = {
                "ambientColor": [0, 0, 0],
                "autoClear": true,
                "clearColor": [0.2, 0.2, 0.3],
                "gravity": [0, 0, -0.9],
                "materials": [material],
                "lights": [],
                "meshes": [],
                "cameras":[]
            }

            return babylonScene;
        }
    }
} 