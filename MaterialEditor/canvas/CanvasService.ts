module RW.TextureEditor {

    export enum ObjectType {
        SPHERE,
        BOX,
        PLANE,
        CYLINDER,
        KNOT,
        TORUS
    }

    export enum LightType {
        HEMISPHERIC,
        SPOT,
        POINT
    }

    export interface SceneInit {
        objectType: ObjectType;
        lightType: LightType;
        lightInCameraPosition: boolean;
        lightPosition?: BABYLON.Vector3;
    }

    export class SceneInitDefaults implements SceneInit {
        objectType: ObjectType = ObjectType.SPHERE;
        lightType: LightType = LightType.HEMISPHERIC;
        lightInCameraPosition: boolean = true;
    }

    export class SceneInitImpl implements SceneInit {
        constructor(public objectType: ObjectType, public lightType: LightType, public lightInCameraPosition: boolean, public lightPosition?: BABYLON.Vector3) {
        }
    }

    export class CanvasService {
        public static $inject = [
            '$rootScope'
        ]

        private _canvasElement: HTMLCanvasElement;
        private _engine: BABYLON.Engine;
        private _scene: BABYLON.Scene;
        private _textureObject: BABYLON.Mesh;
        private _light: BABYLON.Light;
        private _camera: BABYLON.ArcRotateCamera;
        
        constructor(private $rootScope: TextureEditorRootScope) {
            this._canvasElement = <HTMLCanvasElement> document.getElementById("renderCanvas");
            this._engine = new BABYLON.Engine(this._canvasElement);
            this._scene = this.$rootScope.scene = new BABYLON.Scene(this._engine);
            //init material
            $rootScope.material = new BABYLON.StandardMaterial("material", this._scene);

            this.initScene(new SceneInitDefaults());

            this._engine.runRenderLoop(() => {
                this._scene.render();
            });

            window.addEventListener("resize", () => {
                this._engine.resize();
            });

            this._scene.registerBeforeRender(() => {
                if (this._textureObject.material) {
                    ["diffuseTexture", "bumpTexture", "specularTexture", "emissiveTexture", "reflectionTexture", "ambientTexture", "opacityTexture"].forEach((textureType: string) => {
                        if ($rootScope.material[textureType] && $rootScope.material[textureType].update) {
                            $rootScope.material[textureType].update();
                        }
                    });
                }
            });

        }

        public getScene(): BABYLON.Scene {
            return this.$rootScope.scene;
        }

        public getMaterial(): BABYLON.StandardMaterial {
            return this.$rootScope.material;
        }

        public updateTexture(property: string, texture: BABYLON.Texture) {
            this._textureObject.material[property] = texture;
        }

        public initScene(sceneInit: SceneInit) {

            this._scene.meshes.forEach((mesh) => {
                mesh.dispose();
            });

            this._scene.lights.forEach((light) => {
                light.dispose();
            });

            this._scene.cameras.forEach((camera) => {
                camera.dispose();
            });

            this._camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 0.8, 5, new BABYLON.Vector3(0, 0, 0), this._scene);
            this._camera.wheelPrecision = 20;

            this._camera.attachControl(this._canvasElement, false);

            var lightPosition = sceneInit.lightInCameraPosition ? this._camera.position : sceneInit.lightPosition;

            switch (sceneInit.lightType) {
                case LightType.HEMISPHERIC:
                    this._light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this._scene);
                    (<BABYLON.HemisphericLight>this._light).groundColor = new BABYLON.Color3(0, 0, 0);
                    break;
                case LightType.POINT:
                    this._light = new BABYLON.PointLight("light", lightPosition, this._scene);
                    break;
                case LightType.SPOT:
                    //todo calculate direction!
                    this._light = new BABYLON.SpotLight("light", lightPosition, new BABYLON.Vector3(0, -1, 0), 0.8, 2, this._scene);
                    break;
            }

            this._light.diffuse = new BABYLON.Color3(0.6, 0.6, 0.6);
            this._light.specular = new BABYLON.Color3(1, 1, 1);

            switch (sceneInit.objectType) {
                case ObjectType.SPHERE:
                    this._textureObject = BABYLON.Mesh.CreateSphere("textureObject", 16, 2, this._scene);
                    break;
                case ObjectType.BOX:
                    this._textureObject = BABYLON.Mesh.CreateBox("textureObject", 2, this._scene);
                    break;
                case ObjectType.CYLINDER:
                    this._textureObject = BABYLON.Mesh.CreateCylinder("textureObject", 3, 3, 3, 6, 1, this._scene);
                    break;
                case ObjectType.KNOT:
                    this._textureObject = BABYLON.Mesh.CreateTorusKnot("textureObject", 2, 0.5, 128, 64, 2, 3, this._scene);
                    break;
                case ObjectType.PLANE:
                    this._textureObject = BABYLON.Mesh.CreatePlane("textureObject", 2.0, this._scene);
                    break;
                case ObjectType.TORUS:
                    this._textureObject = BABYLON.Mesh.CreateTorus("textureObject", 5, 1, 10, this._scene);
                    break;
            }
            this.$rootScope.texturedObject = this._textureObject;
            this._textureObject.material = this.$rootScope.material;
        }
    }
} 