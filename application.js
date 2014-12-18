var RW;
(function (RW) {
    (function (TextureEditor) {
        'use strict';

        var AngularStarter = (function () {
            function AngularStarter(name) {
                this.name = name;
            }
            AngularStarter.prototype.start = function () {
                var _this = this;
                $(document).ready(function () {
                    _this.app = angular.module(name, [
                        'ui.bootstrap',
                        'colorpicker.module',
                        'ui.slider'
                    ]).controller("CanvasController", TextureEditor.CanvasController).controller("MaterialController", TextureEditor.MaterialController).controller("TextureController", TextureEditor.TextureController).service("textureService", TextureEditor.TextureService).service("canvasService", TextureEditor.CanvasService).directive("textureImage", TextureEditor.textureImage);

                    angular.bootstrap(document, [_this.app.name]);
                });
            };
            return AngularStarter;
        })();
        TextureEditor.AngularStarter = AngularStarter;

        new AngularStarter('materialEditor').start();
    })(RW.TextureEditor || (RW.TextureEditor = {}));
    var TextureEditor = RW.TextureEditor;
})(RW || (RW = {}));
var RW;
(function (RW) {
    (function (TextureEditor) {
        var CanvasController = (function () {
            function CanvasController($scope, canvasService) {
                this.$scope = $scope;
                this.canvasService = canvasService;
                this.objectTypes = {};
                this.lightTypes = {};
                this.objectTypes = [
                    { name: 'Sphere', type: 0 /* SPHERE */ },
                    { name: 'Plane', type: 2 /* PLANE */ },
                    { name: 'Box', type: 1 /* BOX */ },
                    { name: 'Cylinder', type: 3 /* CYLINDER */ },
                    { name: 'Knot', type: 4 /* KNOT */ },
                    { name: 'Torus', type: 5 /* TORUS */ }
                ];
                this.selectedObjectType = this.objectTypes[0];

                this.lightTypes = [
                    { name: 'Hemispheric', type: 0 /* HEMISPHERIC */ },
                    //{ name: 'Spot', type: LightType.SPOT },
                    { name: 'Point', type: 2 /* POINT */ }
                ];
                this.selectedLightType = this.lightTypes[0];
            }
            CanvasController.prototype.typeChanged = function () {
                this.canvasService.initScene(new TextureEditor.SceneInitImpl(this.selectedObjectType.type, this.selectedLightType.type, true));
            };
            CanvasController.$inject = [
                '$scope',
                'canvasService'
            ];
            return CanvasController;
        })();
        TextureEditor.CanvasController = CanvasController;
    })(RW.TextureEditor || (RW.TextureEditor = {}));
    var TextureEditor = RW.TextureEditor;
})(RW || (RW = {}));
var RW;
(function (RW) {
    (function (TextureEditor) {
        (function (ObjectType) {
            ObjectType[ObjectType["SPHERE"] = 0] = "SPHERE";
            ObjectType[ObjectType["BOX"] = 1] = "BOX";
            ObjectType[ObjectType["PLANE"] = 2] = "PLANE";
            ObjectType[ObjectType["CYLINDER"] = 3] = "CYLINDER";
            ObjectType[ObjectType["KNOT"] = 4] = "KNOT";
            ObjectType[ObjectType["TORUS"] = 5] = "TORUS";
        })(TextureEditor.ObjectType || (TextureEditor.ObjectType = {}));
        var ObjectType = TextureEditor.ObjectType;

        (function (LightType) {
            LightType[LightType["HEMISPHERIC"] = 0] = "HEMISPHERIC";
            LightType[LightType["SPOT"] = 1] = "SPOT";
            LightType[LightType["POINT"] = 2] = "POINT";
        })(TextureEditor.LightType || (TextureEditor.LightType = {}));
        var LightType = TextureEditor.LightType;

        var SceneInitDefaults = (function () {
            function SceneInitDefaults() {
                this.objectType = 0 /* SPHERE */;
                this.lightType = 0 /* HEMISPHERIC */;
                this.lightInCameraPosition = true;
            }
            return SceneInitDefaults;
        })();
        TextureEditor.SceneInitDefaults = SceneInitDefaults;

        var SceneInitImpl = (function () {
            function SceneInitImpl(objectType, lightType, lightInCameraPosition, lightPosition) {
                this.objectType = objectType;
                this.lightType = lightType;
                this.lightInCameraPosition = lightInCameraPosition;
                this.lightPosition = lightPosition;
            }
            return SceneInitImpl;
        })();
        TextureEditor.SceneInitImpl = SceneInitImpl;

        var CanvasService = (function () {
            function CanvasService($rootScope) {
                var _this = this;
                this.$rootScope = $rootScope;
                this._canvasElement = document.getElementById("renderCanvas");
                this._engine = new BABYLON.Engine(this._canvasElement);
                this._scene = this.$rootScope.scene = new BABYLON.Scene(this._engine);

                //init material
                $rootScope.material = new BABYLON.StandardMaterial("material", this._scene);

                //init fernsel in disabled mode.
                ["diffuse", "emissive", "reflection", "opacity"].forEach(function (type) {
                    $rootScope.material[type + 'FresnelParameters'] = new BABYLON.FresnelParameters();
                    $rootScope.material[type + 'FresnelParameters'].isEnabled = false;
                });

                this.initScene(new SceneInitDefaults());

                this._engine.runRenderLoop(function () {
                    _this._scene.render();
                });

                window.addEventListener("resize", function () {
                    _this._engine.resize();
                });

                this._scene.registerBeforeRender(function () {
                    if (_this._textureObject.material) {
                        ["diffuseTexture", "bumpTexture", "specularTexture", "emissiveTexture", "reflectionTexture", "ambientTexture", "opacityTexture"].forEach(function (textureType) {
                            if ($rootScope.material[textureType] && $rootScope.material[textureType].update) {
                                $rootScope.material[textureType].update();
                            }
                        });
                    }
                });
            }
            CanvasService.prototype.getScene = function () {
                return this.$rootScope.scene;
            };

            CanvasService.prototype.getMaterial = function () {
                return this.$rootScope.material;
            };

            CanvasService.prototype.updateTexture = function (property, texture) {
                this._textureObject.material[property] = texture;
            };

            CanvasService.prototype.initScene = function (sceneInit) {
                this._scene.meshes.forEach(function (mesh) {
                    mesh.dispose();
                });

                this._scene.lights.forEach(function (light) {
                    light.dispose();
                });

                this._scene.cameras.forEach(function (camera) {
                    camera.dispose();
                });

                this._camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 0.8, 5, new BABYLON.Vector3(0, 0, 0), this._scene);
                this._camera.wheelPrecision = 20;

                this._camera.attachControl(this._canvasElement, false);

                var lightPosition = sceneInit.lightInCameraPosition ? this._camera.position : sceneInit.lightPosition;

                switch (sceneInit.lightType) {
                    case 0 /* HEMISPHERIC */:
                        this._light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this._scene);
                        this._light.groundColor = new BABYLON.Color3(0, 0, 0);
                        break;
                    case 2 /* POINT */:
                        this._light = new BABYLON.PointLight("light", lightPosition, this._scene);
                        break;
                    case 1 /* SPOT */:
                        //todo calculate direction!
                        this._light = new BABYLON.SpotLight("light", lightPosition, new BABYLON.Vector3(0, -1, 0), 0.8, 2, this._scene);
                        break;
                }

                this._light.diffuse = new BABYLON.Color3(0.6, 0.6, 0.6);
                this._light.specular = new BABYLON.Color3(1, 1, 1);

                switch (sceneInit.objectType) {
                    case 0 /* SPHERE */:
                        this._textureObject = BABYLON.Mesh.CreateSphere("textureObject", 16, 2, this._scene);
                        break;
                    case 1 /* BOX */:
                        this._textureObject = BABYLON.Mesh.CreateBox("textureObject", 2, this._scene);
                        break;
                    case 3 /* CYLINDER */:
                        this._textureObject = BABYLON.Mesh.CreateCylinder("textureObject", 3, 3, 3, 6, 1, this._scene);
                        break;
                    case 4 /* KNOT */:
                        this._textureObject = BABYLON.Mesh.CreateTorusKnot("textureObject", 2, 0.5, 128, 64, 2, 3, this._scene);
                        break;
                    case 2 /* PLANE */:
                        this._textureObject = BABYLON.Mesh.CreatePlane("textureObject", 2.0, this._scene);
                        break;
                    case 5 /* TORUS */:
                        this._textureObject = BABYLON.Mesh.CreateTorus("textureObject", 5, 1, 10, this._scene);
                        break;
                }
                this.$rootScope.texturedObject = this._textureObject;
                this._textureObject.material = this.$rootScope.material;
            };
            CanvasService.$inject = [
                '$rootScope'
            ];
            return CanvasService;
        })();
        TextureEditor.CanvasService = CanvasService;
    })(RW.TextureEditor || (RW.TextureEditor = {}));
    var TextureEditor = RW.TextureEditor;
})(RW || (RW = {}));
var RW;
(function (RW) {
    (function (TextureEditor) {
        var HexToBabylon = (function () {
            function HexToBabylon(propertyName, variable) {
                this.propertyName = propertyName;
                this.variable = variable;
                this.setBabylonColor(variable[propertyName]);
            }
            HexToBabylon.prototype.setHex = function (hex) {
                this.hex = hex;
                this.babylonColor = this.convertStringToBabylonArray(hex);
            };

            HexToBabylon.prototype.setBabylonColor = function (color) {
                this.babylonColor = color;
                this.hex = "#" + (color.r * 255).toString(16) + (color.g * 255).toString(16) + (color.b * 255).toString(16);
            };

            HexToBabylon.prototype.updateColor = function () {
                this.babylonColor = this.convertStringToBabylonArray(this.hex);
                if (this.babylonColor) {
                    this.variable[this.propertyName] = this.babylonColor;
                }
            };

            HexToBabylon.prototype.convertStringToBabylonArray = function (hex) {
                //http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
                var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
                hex = hex.replace(shorthandRegex, function (m, r, g, b) {
                    return r + r + g + g + b + b;
                });

                var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? BABYLON.Color3.FromArray([
                    parseInt(result[1], 16) / 255,
                    parseInt(result[2], 16) / 255,
                    parseInt(result[3], 16) / 255
                ]) : null;
            };
            return HexToBabylon;
        })();
        TextureEditor.HexToBabylon = HexToBabylon;

        var MaterialController = (function () {
            function MaterialController($scope, canvasService) {
                this.$scope = $scope;
                this.canvasService = canvasService;
                //todo will this work??
                $scope.material = this.canvasService.getMaterial();
                $scope.colors = {};

                ["diffuseColor", "specularColor", "emissiveColor", "ambientColor"].forEach(function (property) {
                    $scope.colors[property] = new HexToBabylon(property, $scope.material);
                });

                $scope.frenselTypes = [];
                $scope.frensels = {};

                ["diffuse", "emissive", "reflection", "opacity"].forEach(function (type) {
                    $scope.frenselTypes.push(type);
                    $scope.frensels[type] = {
                        left: new HexToBabylon("leftColor", $scope.material[type + 'FresnelParameters']),
                        right: new HexToBabylon("rightColor", $scope.material[type + 'FresnelParameters'])
                    };
                });
            }
            MaterialController.prototype.updateColor = function (property) {
                this.$scope.colors[property].updateColor();
            };

            MaterialController.prototype.updateFrenselColor = function (property, scopeProperty) {
                this.$scope.frensels[scopeProperty][property].updateColor();
            };
            MaterialController.$inject = [
                '$scope',
                'canvasService'
            ];
            return MaterialController;
        })();
        TextureEditor.MaterialController = MaterialController;
    })(RW.TextureEditor || (RW.TextureEditor = {}));
    var TextureEditor = RW.TextureEditor;
})(RW || (RW = {}));
var RW;
(function (RW) {
    (function (TextureEditor) {
        TextureEditor.textureImage = [
            "$parse", function ($parse) {
                return {
                    restrict: 'E',
                    templateUrl: function (elem, attr) {
                        //return 'image-dnd-' + attr.amount + '.html';
                        //console.log(elem, attr);
                        return 'template/image-drag-drop.html';
                    },
                    scope: {
                        tex: '=',
                        updateTexture: '&onUpdateTexture'
                    },
                    transclude: true,
                    link: function (scope, element, attr) {
                        var texture = scope.tex;

                        function render(src, canvasId) {
                            var image = new Image();
                            image.onload = function () {
                                var canvas = document.getElementById(canvasId);
                                var ctx = canvas.getContext("2d");

                                //todo use canvas.style.height and width to keep aspect ratio
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                var width = BABYLON.Tools.GetExponantOfTwo(image.width, 2048);
                                var height = BABYLON.Tools.GetExponantOfTwo(image.height, 2048);
                                var max = Math.max(width, height);
                                if (width > height) {
                                    image.width *= height / image.height;
                                    image.height = height;
                                } else {
                                    image.height *= width / image.width;
                                    image.width = width;
                                }

                                canvas.width = max;
                                canvas.height = max;
                                ctx.drawImage(image, 0, 0, max, max);
                            };
                            image.src = src;
                        }

                        function loadImage(src, canvasId) {
                            //	Prevent any non-image file type from being read.
                            if (!src.type.match(/image.*/)) {
                                console.log("The dropped file is not an image: ", src.type);
                                return;
                            }

                            //	Create our FileReader and run the results through the render function.
                            var reader = new FileReader();
                            reader.onload = function (e) {
                                render(e.target.result, canvasId);
                                if (scope.updateTexture) {
                                    scope.updateTexture({ $type: texture.type });
                                }
                            };
                            reader.readAsDataURL(src);
                        }
                        for (var i = 0; i < texture.numberOfImages; i++) {
                            var canvasId = (texture.canvasId + "-" + i);

                            element.on("dragover", ".texture-canvas-drop", function (e) {
                                e.preventDefault();
                                //this.style.backgroundColor = "red";
                            });
                            element.on("dragleave", ".texture-canvas-drop", function (e) {
                                e.preventDefault();
                                //this.style.backgroundColor = "white";
                            });
                            element.on("drop", ".texture-canvas-drop", function (e) {
                                e.preventDefault();
                                loadImage(e.originalEvent.dataTransfer.files[0], canvasId);
                            });
                        }
                    }
                };
            }];
    })(RW.TextureEditor || (RW.TextureEditor = {}));
    var TextureEditor = RW.TextureEditor;
})(RW || (RW = {}));
var RW;
(function (RW) {
    (function (TextureEditor) {
        (function (TextureType) {
            TextureType[TextureType["DIFFUSE"] = 0] = "DIFFUSE";
            TextureType[TextureType["BUMP"] = 1] = "BUMP";
            TextureType[TextureType["SPECULAR"] = 2] = "SPECULAR";
            TextureType[TextureType["REFLECTION"] = 3] = "REFLECTION";
            TextureType[TextureType["OPACITY"] = 4] = "OPACITY";
            TextureType[TextureType["EMISSIVE"] = 5] = "EMISSIVE";
            TextureType[TextureType["AMBIENT"] = 6] = "AMBIENT";
        })(TextureEditor.TextureType || (TextureEditor.TextureType = {}));
        var TextureType = TextureEditor.TextureType;

        (function (BabylonTextureType) {
            BabylonTextureType[BabylonTextureType["DYNAMIC"] = 0] = "DYNAMIC";
            BabylonTextureType[BabylonTextureType["BASE"] = 1] = "BASE";
            BabylonTextureType[BabylonTextureType["VIDEO"] = 2] = "VIDEO";
            BabylonTextureType[BabylonTextureType["CUBE"] = 3] = "CUBE";
        })(TextureEditor.BabylonTextureType || (TextureEditor.BabylonTextureType = {}));
        var BabylonTextureType = TextureEditor.BabylonTextureType;

        (function (CoordinatesMode) {
            //(0 = explicit, 1 spherical, 2 = planar, 3 = cubic, 4 = projection, 5 = skybox)
            CoordinatesMode[CoordinatesMode["EXPLICIT"] = 0] = "EXPLICIT";
            CoordinatesMode[CoordinatesMode["SPHERICAL"] = 1] = "SPHERICAL";
            CoordinatesMode[CoordinatesMode["PLANAR"] = 2] = "PLANAR";
            CoordinatesMode[CoordinatesMode["CUBIC"] = 3] = "CUBIC";
            CoordinatesMode[CoordinatesMode["PROJECTION"] = 4] = "PROJECTION";
        })(TextureEditor.CoordinatesMode || (TextureEditor.CoordinatesMode = {}));
        var CoordinatesMode = TextureEditor.CoordinatesMode;

        var TextureDefinitionImpl = (function () {
            function TextureDefinitionImpl(canvasId, type, title) {
                var _this = this;
                this.canvasId = canvasId;
                this.type = type;
                this.title = title;
                //for ng-repeat
                this.getCanvasNumber = function () {
                    return new Array(_this.numberOfImages);
                };
                this.propertyInMaterial = this.title.toLowerCase() + "Texture";

                //this.title += " Texture";
                this.isEnabled = false;
                this.hasAlpha = false;
                this.getAlphaFromRGB = false;
                this.uOffset = 0;
                this.vOffset = 0;
                this.vScale = 1;
                this.uScale = 1;
                if (type != 3 /* REFLECTION */) {
                    this.setCoordinatesMode(0 /* EXPLICIT */);
                    this.level = 1;
                } else {
                    this.setCoordinatesMode(2 /* PLANAR */);
                    this.level = 0.5;
                }
                this.coordinatesIndex = 0;
                this.wrapU = false;
                this.wrapV = false;
                this.babylonTextureType = 0 /* DYNAMIC */;
            }
            TextureDefinitionImpl.prototype.setCoordinatesMode = function (mode) {
                this.coordinatesMode = mode;
                if (mode === 3 /* CUBIC */) {
                    this.numberOfImages = 6;
                } else {
                    this.numberOfImages = 1;
                }
            };

            TextureDefinitionImpl.prototype.setBabylonTextureType = function (type) {
                this.babylonTextureType = type;
                if (type === 3 /* CUBE */) {
                    this.setCoordinatesMode(3 /* CUBIC */);
                }
            };
            return TextureDefinitionImpl;
        })();
        TextureEditor.TextureDefinitionImpl = TextureDefinitionImpl;

        var TextureController = (function () {
            function TextureController($scope, textureService, canvasService) {
                var _this = this;
                this.$scope = $scope;
                this.textureService = textureService;
                this.canvasService = canvasService;
                $scope.textures = [];

                $scope.textures.push(new TextureDefinitionImpl('diffuseCanvas', 0 /* DIFFUSE */, 'Diffuse'));
                $scope.textures.push(new TextureDefinitionImpl('bumpCanvas', 1 /* BUMP */, 'Bump'));
                $scope.textures.push(new TextureDefinitionImpl('specularCanvas', 2 /* SPECULAR */, 'Specular'));
                $scope.textures.push(new TextureDefinitionImpl('reflectionCanvas', 3 /* REFLECTION */, 'Reflection'));
                $scope.textures.push(new TextureDefinitionImpl('opacityCanvas', 4 /* OPACITY */, 'Opacity'));
                $scope.textures.push(new TextureDefinitionImpl('emissiveCanvas', 5 /* EMISSIVE */, 'Emissive'));
                $scope.textures.push(new TextureDefinitionImpl('ambientCanvas', 6 /* AMBIENT */, 'Ambient'));

                $scope["updateTexture"] = function (type) {
                    var texture = _this.$scope.textures.filter(function (tex) {
                        return tex.type === type;
                    })[0];
                    if (texture)
                        _this.textureService.changeTexture(texture);
                };
            }
            TextureController.$inject = [
                '$scope',
                'textureService',
                'canvasService'
            ];
            return TextureController;
        })();
        TextureEditor.TextureController = TextureController;
    })(RW.TextureEditor || (RW.TextureEditor = {}));
    var TextureEditor = RW.TextureEditor;
})(RW || (RW = {}));
var RW;
(function (RW) {
    (function (TextureEditor) {
        var TextureService = (function () {
            function TextureService($rootScope, canvasService) {
                this.$rootScope = $rootScope;
                this.canvasService = canvasService;
                this._material = $rootScope.material;
                this._material.backFaceCulling = true;
                $rootScope.texturedObject.material = this._material;
                this._setTextures = {};
            }
            TextureService.prototype.changeTexture = function (textureDef) {
                //TODO cube processing
                var texture;
                if (this._setTextures[textureDef.type]) {
                    texture = this._setTextures[textureDef.type];
                } else {
                    var canvasElement = document.getElementById(textureDef.canvasId + "-0");
                    texture = new BABYLON.DynamicTexture(textureDef.title, canvasElement, this.$rootScope.scene, false);
                }

                this._setTextures[textureDef.type] = texture;

                if (!textureDef.isEnabled) {
                    //not disposing, the texture will simply be reenabled
                    this._material[textureDef.propertyInMaterial] = null;
                    return;
                }

                for (var property in textureDef) {
                    if (textureDef.hasOwnProperty(property) && texture.hasOwnProperty(property)) {
                        texture[property] = textureDef[property];
                    }
                }

                this.canvasService.updateTexture(textureDef.propertyInMaterial, texture);
            };
            TextureService.$inject = [
                '$rootScope',
                'canvasService'
            ];
            return TextureService;
        })();
        TextureEditor.TextureService = TextureService;
    })(RW.TextureEditor || (RW.TextureEditor = {}));
    var TextureEditor = RW.TextureEditor;
})(RW || (RW = {}));
//# sourceMappingURL=application.js.map
