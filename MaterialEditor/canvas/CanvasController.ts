
    module RW.TextureEditor {
        export class CanvasController {

            public static $inject = [
                '$scope',
                'canvasService'
            ];

            public objectTypes = {};
            public selectedObjectType;

            public lightTypes = {};
            public selectedLightType;

            constructor(
                private $scope: ng.IScope,
                private canvasService:CanvasService
                ) {

                this.objectTypes = [
                    { name: 'Sphere', type: ObjectType.SPHERE},
                    { name: 'Plane', type: ObjectType.PLANE},
                    { name: 'Box', type: ObjectType.BOX },
                    { name: 'Cylinder', type: ObjectType.CYLINDER },
                    { name: 'Knot', type: ObjectType.KNOT },
                    { name: 'Torus', type: ObjectType.TORUS }
                ];
                this.selectedObjectType = this.objectTypes[0];

                this.lightTypes = [
                    { name: 'Hemispheric' , type: LightType.HEMISPHERIC },
                    //{ name: 'Spot', type: LightType.SPOT },
                    { name: 'Point', type: LightType.POINT }
                ]
                this.selectedLightType = this.lightTypes[0];
            }

            public typeChanged() {
                this.canvasService.initScene(new SceneInitImpl(this.selectedObjectType.type, this.selectedLightType.type, true));
            }
        }
    }