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
            function CanvasController($scope, $timeout, canvasService) {
                var _this = this;
                this.$scope = $scope;
                this.$timeout = $timeout;
                this.canvasService = canvasService;
                this.objectTypes = [];
                this.lightTypes = [];
                var meshes = canvasService.getObjects();
                for (var pos = 0; pos < meshes.length; pos++) {
                    this.objectTypes.push({ name: meshes[pos].name, value: pos });
                }
                ;

                this.selectedObjectPosition = this.objectTypes[0];

                this.lightTypes = [
                    { name: 'Hemispheric', type: 0 /* HEMISPHERIC */ },
                    //{ name: 'Spot', type: LightType.SPOT },
                    { name: 'Point (in camera position)', type: 2 /* POINT */ }
                ];
                this.selectedLightType = this.lightTypes[0];

                $scope.$on("objectChanged", function (event, object) {
                    $timeout(function () {
                        $scope.$apply(function () {
                            _this.selectedObjectPosition = _this.objectTypes.filter(function (map) {
                                return map.name === object.name;
                            })[0];
                        });
                    });
                });
            }
            CanvasController.prototype.typeChanged = function () {
                this.canvasService.initLight(this.selectedLightType.type);
                //this.canvasService.initScene(new SceneInitImpl(this.selectedObjectType.type, this.selectedLightType.type, true));
            };

            CanvasController.prototype.objectSelected = function () {
                this.canvasService.selectObjectInPosition(this.selectedObjectPosition.value);
            };
            CanvasController.$inject = [
                '$scope',
                '$timeout',
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
                //$rootScope.material = new BABYLON.StandardMaterial("material", this._scene);
                this._camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 10, 0.8, 30, new BABYLON.Vector3(0, 0, 0), this._scene);
                this._camera.wheelPrecision = 20;

                this._camera.attachControl(this._canvasElement, true);

                //this.initScene(new SceneInitDefaults());
                this.createDefaultScene();
                this.initLight();

                this._engine.runRenderLoop(function () {
                    _this._scene.render();
                });

                window.addEventListener("resize", function () {
                    _this._engine.resize();
                });

                this._scene.registerBeforeRender(function () {
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

            CanvasService.prototype.createDefaultScene = function () {
                var _this = this;
                //taken shamelessly from babylon's playground!
                var scene = this._scene;

                var box = BABYLON.Mesh.CreateBox("Box", 6.0, scene);
                var sphere = BABYLON.Mesh.CreateSphere("Sphere", 10.0, 10.0, scene);
                var plan = BABYLON.Mesh.CreatePlane("Plane", 10.0, scene);
                var cylinder = BABYLON.Mesh.CreateCylinder("Cylinder", 3, 3, 3, 6, 1, scene, false);
                var torus = BABYLON.Mesh.CreateTorus("Torus", 5, 1, 10, scene, false);
                var knot = BABYLON.Mesh.CreateTorusKnot("Knot", 2, 0.5, 128, 64, 2, 3, scene);

                box.position = new BABYLON.Vector3(-10, 0, 0);
                sphere.position = new BABYLON.Vector3(0, 10, 0);
                plan.position.z = 10;
                cylinder.position.z = -10;
                torus.position.x = 10;
                knot.position.y = -10;

                //add actions to each object (hover, select)
                scene.meshes.forEach(function (mesh) {
                    mesh.material = new BABYLON.StandardMaterial(mesh.name + "Mat", _this._scene);
                    mesh.actionManager = new BABYLON.ActionManager(_this._scene);
                    mesh.actionManager.registerAction(new BABYLON.SetValueAction(BABYLON.ActionManager.OnPointerOutTrigger, mesh, "renderOutline", false));
                    mesh.actionManager.registerAction(new BABYLON.SetValueAction(BABYLON.ActionManager.OnPointerOverTrigger, mesh, "renderOutline", true));
                    mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnLeftPickTrigger, function () {
                        _this.selectObject(mesh);
                    }));
                });
                this.selectObject(box);
            };

            CanvasService.prototype.initLight = function (lightType) {
                if (typeof lightType === "undefined") { lightType = 0 /* HEMISPHERIC */; }
                this._scene.lights.forEach(function (light) {
                    light.dispose();
                });

                switch (lightType) {
                    case 0 /* HEMISPHERIC */:
                        this._light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this._scene);
                        this._light.groundColor = new BABYLON.Color3(0, 0, 0);
                        break;
                    case 2 /* POINT */:
                        this._light = new BABYLON.PointLight("light", this._camera.position, this._scene);
                        break;
                    case 1 /* SPOT */:
                        //todo calculate direction!
                        this._light = new BABYLON.SpotLight("light", this._camera.position, new BABYLON.Vector3(0, -1, 0), 0.8, 2, this._scene);
                        break;
                }
            };

            CanvasService.prototype.selectObjectInPosition = function (position) {
                this.selectObject(this._scene.meshes[position]);
            };

            CanvasService.prototype.selectObject = function (mesh) {
                this.$rootScope.texturedObject = this._textureObject = mesh;
                this.$rootScope.material = this._textureObject.material;
                this.$rootScope.$broadcast("objectChanged", this._textureObject);
                this.directCameraTo(this._textureObject);
            };

            CanvasService.prototype.directCameraTo = function (object) {
                this._camera.target = object.position;
            };

            CanvasService.prototype.getObjects = function () {
                return this._scene.meshes;
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
                if (_material[this._propertyInMaterial]) {
                    this.frenselVariable = _material[this._propertyInMaterial];
                } else {
                    this.frenselVariable = new BABYLON.FresnelParameters();
                    this.frenselVariable.isEnabled = false;
                    _material[this._propertyInMaterial] = this.frenselVariable;
                }
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
                var _this = this;
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

                $scope.$on("objectChanged", function () {
                    console.log("changed");
                    _this.materialService.initMaterialSections();
                    $scope.material = _this.canvasService.getMaterial();
                    $scope.sectionNames = _this.materialService.getMaterialSectionsArray();
                    $scope.materialSections = _this.materialService.getMaterialSections();
                });
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
                this.initMaterialSections();
            }
            MaterialService.prototype.initMaterialSections = function () {
                this.materialSections = {};
                this.materialSections["diffuse"] = new TextureEditor.MaterialDefinitionSection("diffuse", this.$rootScope.material, true, true, true);
                this.materialSections["emissive"] = new TextureEditor.MaterialDefinitionSection("emissive", this.$rootScope.material, true, true, true);
                this.materialSections["ambient"] = new TextureEditor.MaterialDefinitionSection("ambient", this.$rootScope.material, true, true, false);
                this.materialSections["opacity"] = new TextureEditor.MaterialDefinitionSection("opacity", this.$rootScope.material, false, true, true);
                this.materialSections["specular"] = new TextureEditor.MaterialDefinitionSection("specular", this.$rootScope.material, true, true, false);
                this.materialSections["reflection"] = new TextureEditor.MaterialDefinitionSection("reflection", this.$rootScope.material, false, true, true);
                this.materialSections["bump"] = new TextureEditor.MaterialDefinitionSection("bump", this.$rootScope.material, false, true, false);
            };

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
                this.numberOfImages = 1;
                if (this._material[this.propertyInMaterial]) {
                    console.log("found");
                    this.enabled(true);
                    this.initFromMaterial();
                } else {
                    this.enabled(false);
                    this.init = false;

                    //clean canvas
                    var canvasElement = document.getElementById(this.canvasId + "-0");
                    if (canvasElement) {
                        var context = canvasElement.getContext("2d");
                        context.clearRect(0, 0, canvasElement.width, canvasElement.height);
                    }
                }
            }
            TextureDefinition.prototype.initTexture = function () {
                if (this.textureVariable) {
                    this.textureVariable.dispose();
                }
                var canvasElement = document.getElementById(this.canvasId + "-0");
                var base64 = canvasElement.toDataURL();
                this.textureVariable = new BABYLON.Texture(base64, this._material.getScene(), false, undefined, undefined, undefined, undefined, base64, false);
                if (this.name != "reflection") {
                    this.coordinatesMode(0 /* EXPLICIT */);
                } else {
                    this.coordinatesMode(2 /* PLANAR */);
                }
                this.babylonTextureType = 0 /* DYNAMIC */;
                this.init = true;
            };

            TextureDefinition.prototype.initFromMaterial = function () {
                //update canvas
                this.textureVariable = this._material[this.propertyInMaterial];

                //TODO since deleteBuffer = false, material[texture]._buffer is the base64 image. Update the canvas with it!
                this.init = true;
                this.enabled(true);
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
                        if (this.textureVariable)
                            this._material[this.propertyInMaterial] = this.textureVariable;
                        this._isEnabled = true;
                    } else {
                        if (this._material[this.propertyInMaterial]) {
                            this._material[this.propertyInMaterial].dispose();
                            this._material[this.propertyInMaterial] = null;
                        }
                        this._isEnabled = false;
                    }
                } else {
                    return this._isEnabled ? 1 : 0;
                }
            };

            TextureDefinition.prototype.canvasUpdated = function () {
                this.initTexture();
                if (this._isEnabled) {
                    this._material[this.propertyInMaterial] = this.textureVariable;
                }
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
