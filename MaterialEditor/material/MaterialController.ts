module RW.TextureEditor {

    export interface MaterialScope extends ng.IScope {
        material: BABYLON.StandardMaterial;
        sectionNames: string[];
        materialSections: { [section: string]: MaterialDefinitionSection };
        updateTexture(type): void;
        mirrorEnabled: boolean;
    }
        
    export class MaterialController {

        public static $inject = [
            '$scope',
            '$modal',
            'canvasService',
            'materialService'
        ];
        
        constructor(
            private $scope: MaterialScope,
            private $modal : any /* modal from angular bootstrap ui */, 
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

        public afterObjectChanged = (event:ng.IAngularEvent, object:BABYLON.AbstractMesh) => {
            this.materialService.initMaterialSections(object);
            this.$scope.material = <BABYLON.StandardMaterial> object.material;
            this.$scope.sectionNames = this.materialService.getMaterialSectionsArray();
            this.$scope.materialSections = this.materialService.getMaterialSections();
        }

        public exportMaterial() {
            var modalInstance = this.$modal.open({
                templateUrl: 'materialExport.html',
                controller: 'MaterialExportModalController',
                size: "lg",
                resolve: {
                    materialDefinitions: () => {
                        return this.$scope.materialSections;
                    }
                }
            });
        }
    }
}