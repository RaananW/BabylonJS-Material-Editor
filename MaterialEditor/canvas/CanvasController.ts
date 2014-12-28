
module RW.TextureEditor {

    export interface CanvasScope extends ng.IScope {
        lightConfigure: boolean;
        light: BABYLON.Light;
        lightSpecularColor: HexToBabylon;
        lightDiffuseColor: HexToBabylon;
    }

        export class CanvasController {

            public static $inject = [
                '$scope',
                '$timeout',
                '$modal',
                'canvasService'
            ];

            public objectTypes;
            public selectedObjectPosition;

            public lightTypes;
            public selectedLightType;

            constructor(
                private $scope: CanvasScope,
                private $timeout: ng.ITimeoutService,
                private $modal,
                private canvasService:CanvasService
                ) {

                this.lightTypes = [
                    { name: 'Hemispheric', type: LightType.HEMISPHERIC },
                    { name: 'Point (in camera position)', type: LightType.POINT }
                ]

                this.selectedLightType = this.lightTypes[0];

                $scope.$on("sceneReset", () => {
                    var meshes = canvasService.getObjects();
                    this.objectTypes = [];
                    for (var pos = 0; pos < meshes.length; pos++) {
                        this.objectTypes.push({ name: meshes[pos].name, value: pos });
                    };

                    this.selectedObjectPosition = this.objectTypes[0];
                });

                $scope.$on("objectChanged", (event, object: BABYLON.AbstractMesh) => {
                    $timeout(() => {
                        $scope.$apply(() => {
                            this.selectedObjectPosition = this.objectTypes.filter((map) => { return map.name === object.name })[0];
                        });
                    });
                });

                $scope.$on("lightChanged", (event, light: BABYLON.Light) => {
                    this.resetLightParameters(light);
                });

                $scope.lightConfigure = true;
                this.canvasService.resetScene();
                this.canvasService.initLight();
            }

            public resetLightParameters = (light: BABYLON.Light) => {
                this.$scope.light = light;
                this.$scope.lightSpecularColor = new HexToBabylon('specular', light, "");
                this.$scope.lightDiffuseColor = new HexToBabylon('diffuse', light, "");
            }

            public lightTypeChanged() {
                this.canvasService.initLight(this.selectedLightType.type);
            }

            public objectSelected() {
                this.canvasService.selectObjectInPosition(this.selectedObjectPosition.value);
            }

            public resetScene() {
                this.canvasService.resetScene();
            }

            public objectSubMeshes() {
                var modalInstance = this.$modal.open({
                    templateUrl: 'objectSubMeshes.html',
                    controller: 'ObjectSubMeshesController',
                    size: "lg",
                    resolve: {
                        object: () => {
                            return this.canvasService.getObjectInPosition(this.selectedObjectPosition.value);
                        }
                    }
                });

                modalInstance.result.then(() => {
                    //update the object
                    this.objectSelected();
                }, function () {
                });
            }    

        }
    }