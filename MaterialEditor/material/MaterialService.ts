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

        public initMaterialSections(material:BABYLON.StandardMaterial) {
            this.materialSections = {};
            this.materialSections["diffuse"] = new MaterialDefinitionSection("diffuse", material, true, true, true);
            this.materialSections["emissive"] = new MaterialDefinitionSection("emissive", material, true, true, true);
            this.materialSections["ambient"] = new MaterialDefinitionSection("ambient", material, true, true, false);
            this.materialSections["opacity"] = new MaterialDefinitionSection("opacity", material, false, true, true);
            this.materialSections["specular"] = new MaterialDefinitionSection("specular", material, true, true, false);
            this.materialSections["reflection"] = new MaterialDefinitionSection("reflection", material, false, true, true);
            this.materialSections["bump"] = new MaterialDefinitionSection("bump", material, false, true, false);
        }

        public getMaterialSectionsArray() : string[] {
            return Object.keys(this.materialSections);
        }

        public getMaterialSections(): { [section: string]: MaterialDefinitionSection } {
            return this.materialSections;
        }
    }
} 