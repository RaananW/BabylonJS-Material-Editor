
    module RW.TextureEditor {
        export class CanvasController {

            public static $inject = [
                '$scope',
                '$timeout',
                'canvasService'
            ];

            public objectTypes = [];
            public selectedObjectPosition;

            public lightTypes = [];
            public selectedLightType;

            constructor(
                private $scope: ng.IScope,
                private $timeout: ng.ITimeoutService,
                private canvasService:CanvasService
                ) {

                var meshes = canvasService.getObjects();
                for (var pos = 0; pos < meshes.length; pos++) {
                    this.objectTypes.push({ name: meshes[pos].name, value: pos });
                };

                this.selectedObjectPosition = this.objectTypes[0];

                this.lightTypes = [
                    { name: 'Hemispheric' , type: LightType.HEMISPHERIC },
                    //{ name: 'Spot', type: LightType.SPOT },
                    { name: 'Point', type: LightType.POINT }
                ]
                this.selectedLightType = this.lightTypes[0];

                $scope.$on("objectChanged", (event, object: BABYLON.AbstractMesh) => {
                    $timeout(() => {
                        $scope.$apply(() => {
                            this.selectedObjectPosition = this.objectTypes.filter((map) => { return map.name === object.name })[0];
                        });
                    });
                });
            }

            public typeChanged() {
                this.canvasService.initLight(this.selectedLightType.type);
                //this.canvasService.initScene(new SceneInitImpl(this.selectedObjectType.type, this.selectedLightType.type, true));
            }

            public objectSelected() {
                this.canvasService.selectObjectInPosition(this.selectedObjectPosition.value);
            }
        }
    }