module RW.TextureEditor {
    export class MaterialService {
        public static $inject = [
            '$rootScope',
            'canvasService'
        ]  

        public materialSections: { [section: string]: MaterialDefinitionSection };

        constructor(private $rootScope: TextureEditorRootScope, private canvasService: CanvasService) {
            this.materialSections = {};
            this.materialSections["diffuse"] = new MaterialDefinitionSection("diffuse", $rootScope.material, true, true, true);
            this.materialSections["emissive"] = new MaterialDefinitionSection("emissive", $rootScope.material, true, true, true);
            this.materialSections["ambient"] = new MaterialDefinitionSection("ambient", $rootScope.material, true, true, false);
            this.materialSections["opacity"] = new MaterialDefinitionSection("opacity", $rootScope.material, false, true, true);
            this.materialSections["specular"] = new MaterialDefinitionSection("specular", $rootScope.material, true, true, false);
            this.materialSections["reflection"] = new MaterialDefinitionSection("reflection", $rootScope.material, false, true, true);
            this.materialSections["bump"] = new MaterialDefinitionSection("bump", $rootScope.material, false, true, false);
        }

        public getMaterialSectionsArray() : string[] {
            return Object.keys(this.materialSections);
        }

        public getMaterialSections(): { [section: string]: MaterialDefinitionSection } {
            return this.materialSections;
        }
    }
} 