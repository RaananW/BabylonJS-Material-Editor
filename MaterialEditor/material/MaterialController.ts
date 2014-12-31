module RW.TextureEditor {

    export interface MaterialScope extends ng.IScope {
        //material: BABYLON.StandardMaterial;
        materialDefinition: MaterialDefinition;
        //sectionNames: string[];
        //materialSections: { [section: string]: MaterialDefinitionSection };
        updateTexture(type): void;
        mirrorEnabled: boolean;
    }
     
    /*
    TODO
        * Fix the alpha problem
        * Multi Material Javascript export.
    */
       
    export class MaterialController {

        public static $inject = [
            '$scope',
            '$modal',
            '$http',
            'canvasService',
            'materialService'
        ];

        public multiMaterialPosition: number;
        public numberOfMaterials: number;
        public isMultiMaterial: boolean;

        public materialId: string;
        public errorMessage: string;

        private _object: BABYLON.AbstractMesh;

        public static ServerUrl: string = "http://localhost:1337";
                
        constructor(
            private $scope: MaterialScope,
            private $modal: any /* modal from angular bootstrap ui */, 
            private $http: ng.IHttpService,
            private canvasService: CanvasService,
            private materialService:MaterialService
            ) {
            this.isMultiMaterial = false;
            this.multiMaterialPosition = 0;
            this.numberOfMaterials = 0;
            $scope.updateTexture = (type) => {
                $scope.$apply(() => {
                    $scope.materialDefinition.materialSections[type].texture.canvasUpdated();
                });
            }

            $scope.$on("objectChanged", this.afterObjectChanged);
        }

        public afterObjectChanged = (event: ng.IAngularEvent, object: BABYLON.AbstractMesh) => {
            //if object has no submeshes, do nothing. It is a null parent object. Who needs it?...
            if (object.subMeshes == null) return;

            //If an object has more than one subMesh, it means I have already created a multi material object for it.
            this._object = object;
            this.isMultiMaterial = object.subMeshes.length > 1;
            
            if (this.isMultiMaterial) {
                this.numberOfMaterials = (<BABYLON.MultiMaterial> object.material).subMaterials.length;
                this.multiMaterialPosition = 0;
            } else {
                this.numberOfMaterials = 0;
                this.multiMaterialPosition = -1;
            }
            this.initMaterial(this.multiMaterialPosition);
        }

        public initMaterial(position?:number) {
            //making sure it is undefined if it is not multi material.
            if (this.isMultiMaterial) {
                this.$scope.materialDefinition = this.materialService.initMaterialSections(this._object, position);
                //this.$scope.material = <BABYLON.StandardMaterial> (<BABYLON.MultiMaterial> this._object.material).subMaterials[position];
            } else {
                this.$scope.materialDefinition = this.materialService.initMaterialSections(this._object);
                //this.materialService.initMaterialSections(this._object);
                //this.$scope.material = <BABYLON.StandardMaterial> this._object.material;
            }
            //this.$scope.sectionNames = this.materialService.getMaterialSectionsArray();
            //this.$scope.materialSections = this.materialService.getMaterialSections();
        }

        public exportMaterial() {
            var modalInstance = this.$modal.open({
                templateUrl: 'materialExport.html',
                controller: 'MaterialExportModalController',
                size: "lg",
                resolve: {
                    materialDefinitions: () => {
                        return this.materialService.getMaterialDefinisionsArray(this._object.id)
                        //if (!this.isMultiMaterial)
                        //    return [this.$scope.materialSections];
                        //else {
                        //    var position = this.multiMaterialPosition;
                        //    var matArray = []
                        //    for (var i = 0; i < this.numberOfMaterials; i++) {
                        //        this.initMaterial(i);
                        //        matArray.push(this.$scope.materialSections);
                        //    }
                        //    this.initMaterial(position);
                        //    return matArray;
                        //}
                    }
                }
            });
        }

        public saveMaterial() {
            //todo get ID from server
            this.$http.get(MaterialController.ServerUrl + "/getNextId").success((idObject) => {
                var id = idObject['id'];
                var material = this.materialService.exportAsBabylonScene(id, this.$scope.materialDefinition);
                //upload material object
                this.$http.post(MaterialController.ServerUrl + "/materials", material).success((worked) => {
                    if (!worked['success']) {
                        this.errorMessage = "error uploading the material";
                    }
                    //upload binaries

                    //update UI
                    this.materialId = id;
                });
                
                
            });
            
        }

        public loadMaterial() {
            if (!this.materialId) {
                this.errorMessage = "please enter material id!";
                return;
            }
            this.errorMessage = null;
            this.canvasService.appendMaterial(this.materialId, () => {
                var material: BABYLON.Material = this.canvasService.getMaterial(this.materialId);
                console.log(material);
                if (this.isMultiMaterial) {
                    (<BABYLON.MultiMaterial> this._object.material).subMaterials[this.multiMaterialPosition] = material;
                    this.initMaterial(this.multiMaterialPosition);
                } else {
                    this._object.material = material;
                    this.initMaterial();
                }
                
            }, () => {
                this.errorMessage = "error loading material, make sure the ID is correct";
            });
        }

        //for ng-repeat
        public getMaterialIndices = () => {
            return new Array(this.numberOfMaterials);
        }
    }
}