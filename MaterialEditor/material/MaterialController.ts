module RW.TextureEditor {

    export interface MaterialScope extends ng.IScope {
        material: BABYLON.StandardMaterial;
        sectionNames: string[];
        materialSections: { [section: string]: MaterialDefinitionSection };
        updateTexture(type): void;
    }
        
    export class MaterialController {

        public static $inject = [
            '$scope',
            'canvasService',
            'materialService'
        ];
        
        constructor(
            private $scope: MaterialScope,
            private canvasService: CanvasService,
            private materialService:MaterialService
            ) {

            $scope.updateTexture = (type) => {
                $scope.$apply(() => {
                    $scope.materialSections[type].texture.canvasUpdated();
                });
            }

            $scope.$on("objectChanged", this.afterObjectChanged);
        }

        public afterObjectChanged = () => {
            this.materialService.initMaterialSections();
            this.$scope.material = this.canvasService.getMaterial();
            this.$scope.sectionNames = this.materialService.getMaterialSectionsArray();
            this.$scope.materialSections = this.materialService.getMaterialSections();
        }
    }
}