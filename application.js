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
                    ]).controller("CanvasController", TextureEditor.CanvasController).controller("MaterialController", TextureEditor.MaterialController).controller("TextureController", TextureEditor.TextureController).service("materialService", TextureEditor.MaterialService).service("canvasService", TextureEditor.CanvasService).directive("textureImage", TextureEditor.textureImage);

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
        var FrenselDefinition = (function () {
            function FrenselDefinition(name, _material) {
                this._propertyInMaterial = name + 'FresnelParameters';
                this.frenselVariable = new BABYLON.FresnelParameters();
                this.frenselVariable.isEnabled = false;
                _material[this._propertyInMaterial] = this.frenselVariable;
                this.leftColor = new HexToBabylon("left", _material[this._propertyInMaterial]), this.rightColor = new HexToBabylon("right", _material[this._propertyInMaterial]);
            }
            return FrenselDefinition;
        })();
        TextureEditor.FrenselDefinition = FrenselDefinition;

        var MaterialDefinitionSection = (function () {
            function MaterialDefinitionSection(name, _material, hasColor, hasTexture, hasFrensel) {
                this.name = name;
                this._material = _material;
                this.hasColor = hasColor;
                this.hasTexture = hasTexture;
                this.hasFrensel = hasFrensel;
                if (hasColor) {
                    this.color = new HexToBabylon(name, _material);
                }
                if (hasTexture) {
                    this.texture = new TextureEditor.TextureDefinition(name, _material);
                }
                if (hasFrensel) {
                    this.frensel = new FrenselDefinition(name, _material);
                }
            }
            return MaterialDefinitionSection;
        })();
        TextureEditor.MaterialDefinitionSection = MaterialDefinitionSection;

        var HexToBabylon = (function () {
            function HexToBabylon(propertyName, _variable) {
                this.propertyName = propertyName;
                this._variable = _variable;
                this.propertyName += "Color";
                this._setBabylonColor(_variable[this.propertyName]);
            }
            //angular getter/setter
            HexToBabylon.prototype.hex = function (hex) {
                if (hex) {
                    this._hex = hex;
                    this.babylonColor = this.convertStringToBabylonArray(this._hex);
                    if (this.babylonColor) {
                        this._variable[this.propertyName] = this.babylonColor;
                    }
                } else {
                    return this._hex;
                }
            };

            HexToBabylon.prototype._setBabylonColor = function (color) {
                this.babylonColor = color;
                var hex = "#";
                ['r', 'g', 'b'].forEach(function (channel) {
                    var c = color[channel] * 255;
                    hex = hex + ((c < 16) ? "0" + c.toString(16) : "" + c.toString(16));
                });

                this._hex = hex;
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
            function MaterialController($scope, canvasService, materialService) {
                this.$scope = $scope;
                this.canvasService = canvasService;
                this.materialService = materialService;
                //todo will this work??
                $scope.material = this.canvasService.getMaterial();

                $scope.sectionNames = this.materialService.getMaterialSectionsArray();
                $scope.materialSections = this.materialService.getMaterialSections();

                $scope.updateTexture = function (type) {
                    $scope.$apply(function () {
                        $scope.materialSections[type].texture.canvasUpdated();
                    });
                };
            }
            MaterialController.$inject = [
                '$scope',
                'canvasService',
                'materialService'
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
        var MaterialService = (function () {
            function MaterialService($rootScope, canvasService) {
                this.$rootScope = $rootScope;
                this.canvasService = canvasService;
                this.materialSections = {};
                this.materialSections["diffuse"] = new TextureEditor.MaterialDefinitionSection("diffuse", $rootScope.material, true, true, true);
                this.materialSections["emissive"] = new TextureEditor.MaterialDefinitionSection("emissive", $rootScope.material, true, true, true);
                this.materialSections["ambient"] = new TextureEditor.MaterialDefinitionSection("ambient", $rootScope.material, true, true, false);
                this.materialSections["opacity"] = new TextureEditor.MaterialDefinitionSection("opacity", $rootScope.material, false, true, true);
                this.materialSections["specular"] = new TextureEditor.MaterialDefinitionSection("specular", $rootScope.material, true, true, false);
                this.materialSections["reflection"] = new TextureEditor.MaterialDefinitionSection("reflection", $rootScope.material, false, true, true);
                this.materialSections["bump"] = new TextureEditor.MaterialDefinitionSection("bump", $rootScope.material, false, true, false);
            }
            MaterialService.prototype.getMaterialSectionsArray = function () {
                return Object.keys(this.materialSections);
            };

            MaterialService.prototype.getMaterialSections = function () {
                return this.materialSections;
            };
            MaterialService.$inject = [
                '$rootScope',
                'canvasService'
            ];
            return MaterialService;
        })();
        TextureEditor.MaterialService = MaterialService;
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

                        function render(src, canvasId, onSuccess) {
                            var image = new Image();
                            image.onload = function () {
                                var canvas = document.getElementById(canvasId);
                                var ctx = canvas.getContext("2d");

                                //todo use canvas.style.height and width to keep aspect ratio
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                var width = BABYLON.Tools.GetExponantOfTwo(image.width, 1024);
                                var height = BABYLON.Tools.GetExponantOfTwo(image.height, 1024);
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
                                if (onSuccess) {
                                    onSuccess();
                                }
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
                                render(e.target.result, canvasId, function () {
                                    if (scope.updateTexture) {
                                        scope.updateTexture({ $name: texture.name });
                                    }
                                });
                            };
                            reader.readAsDataURL(src);
                        }
                        for (var i = 0; i < texture.numberOfImages; i++) {
                            var canvasId = (texture.canvasId + "-" + i);

                            element.on("dragover", ".texture-canvas-drop", function (e) {
                                e.preventDefault();
                            });
                            element.on("dragleave", ".texture-canvas-drop", function (e) {
                                e.preventDefault();
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

        var TextureDefinition = (function () {
            function TextureDefinition(name, _material) {
                var _this = this;
                this.name = name;
                this._material = _material;
                //TODO implement video support etc'. At the moment only dynamic is supported.
                /*public setBabylonTextureType(type: BabylonTextureType) {
                this.babylonTextureType = type;
                if (type === BabylonTextureType.CUBE) {
                this.coordinatesMode(CoordinatesMode.CUBIC);
                }
                }*/
                //for ng-repeat
                this.getCanvasNumber = function () {
                    return new Array(_this.numberOfImages);
                };
                this.propertyInMaterial = this.name.toLowerCase() + "Texture";
                this.canvasId = this.name + "Canvas";
                this.enabled(false);
                this.numberOfImages = 1;
                this.init = false;
            }
            TextureDefinition.prototype.initTexture = function () {
                var canvasElement = document.getElementById(this.canvasId + "-0");
                var base64 = canvasElement.toDataURL();
                this.textureVariable = new BABYLON.Texture(base64, this._material.getScene(), false, undefined, undefined, undefined, undefined, base64);
                if (this.name != "reflection") {
                    this.coordinatesMode(0 /* EXPLICIT */);
                } else {
                    this.coordinatesMode(2 /* PLANAR */);
                }
                this.babylonTextureType = 0 /* DYNAMIC */;
                this.init = true;
            };

            TextureDefinition.prototype.coordinatesMode = function (mode) {
                if (angular.isDefined(mode)) {
                    this.textureVariable.coordinatesMode = mode;
                    if (mode === 3 /* CUBIC */) {
                        this.numberOfImages = 6;
                    } else {
                        this.numberOfImages = 1;
                    }
                } else {
                    return this.textureVariable ? this.textureVariable.coordinatesMode : 0;
                }
            };

            TextureDefinition.prototype.enabled = function (enabled) {
                if (angular.isDefined(enabled)) {
                    if (enabled) {
                        this._material[this.propertyInMaterial] = this.textureVariable;
                        this._isEnabled = true;
                    } else {
                        this._material[this.propertyInMaterial] = null;
                        this._isEnabled = false;
                    }
                } else {
                    return this._isEnabled ? 1 : 0;
                }
            };

            TextureDefinition.prototype.canvasUpdated = function () {
                this.initTexture();
                if (this._isEnabled)
                    this._material[this.propertyInMaterial] = this.textureVariable;
            };
            return TextureDefinition;
        })();
        TextureEditor.TextureDefinition = TextureDefinition;

        var TextureController = (function () {
            function TextureController($scope, canvasService, materialService) {
                this.$scope = $scope;
                this.canvasService = canvasService;
                this.materialService = materialService;
            }
            TextureController.$inject = [
                '$scope',
                'canvasService',
                'materialService'
            ];
            return TextureController;
        })();
        TextureEditor.TextureController = TextureController;
    })(RW.TextureEditor || (RW.TextureEditor = {}));
    var TextureEditor = RW.TextureEditor;
})(RW || (RW = {}));
//# sourceMappingURL=application.js.map
