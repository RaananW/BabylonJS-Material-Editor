module RW.TextureEditor {
    export class MaterialService {
        public static $inject = [
            '$rootScope',
            'canvasService'
        ]  

        public materialSections: { [section: string]: MaterialDefinitionSection };

        constructor(private $rootScope: TextureEditorRootScope, private canvasService: CanvasService) {
            this.initMaterialSections();
        }

        public initMaterialSections() {
            this.materialSections = {};
            this.materialSections["diffuse"] = new MaterialDefinitionSection("diffuse", this.$rootScope.material, true, true, true);
            this.materialSections["emissive"] = new MaterialDefinitionSection("emissive", this.$rootScope.material, true, true, true);
            this.materialSections["ambient"] = new MaterialDefinitionSection("ambient", this.$rootScope.material, true, true, false);
            this.materialSections["opacity"] = new MaterialDefinitionSection("opacity", this.$rootScope.material, false, true, true);
            this.materialSections["specular"] = new MaterialDefinitionSection("specular", this.$rootScope.material, true, true, false);
            this.materialSections["reflection"] = new MaterialDefinitionSection("reflection", this.$rootScope.material, false, true, true);
            this.materialSections["bump"] = new MaterialDefinitionSection("bump", this.$rootScope.material, false, true, false);
        }

        public getMaterialSectionsArray() : string[] {
            return Object.keys(this.materialSections);
        }

        public getMaterialSections(): { [section: string]: MaterialDefinitionSection } {
            return this.materialSections;
        }
    }
} 