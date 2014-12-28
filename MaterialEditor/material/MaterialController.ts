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

        public multiMaterialPosition: number;
        public numberOfMaterials: number;
        public isMultiMaterial: boolean;

        private _object: BABYLON.AbstractMesh;
                
        constructor(
            private $scope: MaterialScope,
            private $modal : any /* modal from angular bootstrap ui */, 
            private canvasService: CanvasService,
            private materialService:MaterialService
            ) {
            this.isMultiMaterial = false;
            this.multiMaterialPosition = 0;
            this.numberOfMaterials = 0;
            $scope.updateTexture = (type) => {
                $scope.$apply(() => {
                    $scope.materialSections[type].texture.canvasUpdated();
                });
            }

            $scope.$on("objectChanged", this.afterObjectChanged);
        }

        public afterObjectChanged = (event: ng.IAngularEvent, object: BABYLON.AbstractMesh) => {
            //If an object has more than one subMesh, it means I have already created a multi material object for it.
            this._object = object;
            this.isMultiMaterial = object.subMeshes.length > 1;
            this.multiMaterialPosition = 0;
            if (this.isMultiMaterial) {
                this.numberOfMaterials = (<BABYLON.MultiMaterial> object.material).subMaterials.length;
            } else {
                this.numberOfMaterials = 0;
            }
            console.log(this.numberOfMaterials);
            this.initMaterial(this.multiMaterialPosition);
        }

        public initMaterial(position?:number) {
            //making sure it is undefined if it is not multi material.
            if (this.isMultiMaterial) {
                this.materialService.initMaterialSections(this._object, position);
                this.$scope.material = <BABYLON.StandardMaterial> (<BABYLON.MultiMaterial> this._object.material).subMaterials[position];
            } else {
                this.materialService.initMaterialSections(this._object);
                this.$scope.material = <BABYLON.StandardMaterial> this._object.material;
            }
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

        //for ng-repeat
        public getMaterialIndices = () => {
            return new Array(this.numberOfMaterials);
        }
    }
}