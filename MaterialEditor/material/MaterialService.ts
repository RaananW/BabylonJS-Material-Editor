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
    }
} 