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
            //todo will this work??
            $scope.material = this.canvasService.getMaterial();

            $scope.sectionNames = this.materialService.getMaterialSectionsArray();
            $scope.materialSections = this.materialService.getMaterialSections();

            $scope.updateTexture = (type) => {
                $scope.$apply(() => {
                    $scope.materialSections[type].texture.canvasUpdated();
                });
            }

            $scope.$on("objectChanged", () => {
                console.log("changed");
                this.materialService.initMaterialSections();
                $scope.material = this.canvasService.getMaterial();
                $scope.sectionNames = this.materialService.getMaterialSectionsArray();
                $scope.materialSections = this.materialService.getMaterialSections();
            });
        }
    }
}