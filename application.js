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
                    ]).controller("CanvasController", TextureEditor.CanvasController).controller("MaterialController", TextureEditor.MaterialController).controller("MaterialExportModalController", TextureEditor.MaterialExportModlController).controller("TextureController", TextureEditor.TextureController).service("materialService", TextureEditor.MaterialService).service("canvasService", TextureEditor.CanvasService).directive("textureImage", TextureEditor.textureImage).directive("disableEnableButton", TextureEditor.disableEnableButton);

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
                this.resetLightParameters = function (light) {
                    _this.$scope.light = light;
                    _this.$scope.lightSpecularColor = new TextureEditor.HexToBabylon('specular', light, "");
                    _this.$scope.lightDiffuseColor = new TextureEditor.HexToBabylon('diffuse', light, "");
                };
                this.lightTypes = [
                    { name: 'Hemispheric', type: 0 /* HEMISPHERIC */ },
                    { name: 'Point (in camera position)', type: 2 /* POINT */ }
                ];

                this.selectedLightType = this.lightTypes[0];

                $scope.$on("sceneReset", function () {
                    var meshes = canvasService.getObjects();
                    _this.objectTypes = [];
                    for (var pos = 0; pos < meshes.length; pos++) {
                        _this.objectTypes.push({ name: meshes[pos].name, value: pos });
                    }
                    ;

                    _this.selectedObjectPosition = _this.objectTypes[0];
                });

                $scope.$on("objectChanged", function (event, object) {
                    $timeout(function () {
                        $scope.$apply(function () {
                            _this.selectedObjectPosition = _this.objectTypes.filter(function (map) {
                                return map.name === object.name;
                            })[0];
                        });
                    });
                });

                $scope.$on("lightChanged", function (event, light) {
                    _this.resetLightParameters(light);
                });

                $scope.lightConfigure = true;
                this.canvasService.resetScene();
                this.canvasService.initLight();
            }
            CanvasController.prototype.lightTypeChanged = function () {
                this.canvasService.initLight(this.selectedLightType.type);
            };

            CanvasController.prototype.objectSelected = function () {
                this.canvasService.selectObjectInPosition(this.selectedObjectPosition.value);
            };

            CanvasController.prototype.resetScene = function () {
                this.canvasService.resetScene();
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
    })(RW.TextureEditor || (RW.TextureEditor = {}));
    var TextureEditor = RW.TextureEditor;
})(RW || (RW = {}));
var RW;
(function (RW) {
    (function (TextureEditor) {
        var CanvasService = (function () {
            function CanvasService($rootScope) {
                var _this = this;
                this.$rootScope = $rootScope;
                this._canvasElement = document.getElementById("renderCanvas");
                this._engine = new BABYLON.Engine(this._canvasElement);
                this._scene = new BABYLON.Scene(this._engine);

                this._camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 10, 0.8, 30, new BABYLON.Vector3(0, 0, 0), this._scene);
                this._camera.wheelPrecision = 20;

                this._camera.attachControl(this._canvasElement, false);

                this._engine.runRenderLoop(function () {
                    _this._scene.render();
                });

                window.addEventListener("resize", function () {
                    _this._engine.resize();
                });

                this._scene.registerBeforeRender(function () {
                });
            }
            CanvasService.prototype.getLight = function () {
                return this._light;
            };

            CanvasService.prototype.updateTexture = function (property, texture) {
                this._textureObject.material[property] = texture;
            };

            CanvasService.prototype.resetScene = function () {
                for (var i = this._scene.meshes.length - 1; i > -1; i--) {
                    this._scene.meshes[i].dispose();
                }
                this.createDefaultScene();
                this.$rootScope.$broadcast("sceneReset");
                this.selectObject(this._scene.meshes[0]);
            };

            CanvasService.prototype.createDefaultScene = function () {
                var _this = this;
                //taken shamelessly from babylon's playground!
                var scene = this._scene;

                var box = BABYLON.Mesh.CreateBox("Box", 6.0, scene);
                var sphere = BABYLON.Mesh.CreateSphere("Sphere", 10.0, 10.0, scene);
                var plan = BABYLON.Mesh.CreatePlane("Plane", 10.0, scene);
                var cylinder = BABYLON.Mesh.CreateCylinder("Cylinder", 3, 3, 3, 6, 1, scene);
                var torus = BABYLON.Mesh.CreateTorus("Torus", 5, 1, 10, scene);
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
                    mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnRightPickTrigger, function (evt) {
                        console.log(evt);
                        _this.selectObject(mesh);
                    }));
                });
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

                this._light.diffuse = new BABYLON.Color3(0.6, 0.6, 0.6);
                this._light.specular = new BABYLON.Color3(1, 1, 1);

                this.$rootScope.$broadcast("lightChanged", this._light);
            };

            CanvasService.prototype.selectObjectInPosition = function (position) {
                this.selectObject(this._scene.meshes[position]);
            };

            CanvasService.prototype.selectObject = function (mesh) {
                /*this.$rootScope.texturedObject = */ this._textureObject = mesh;

                //this.$rootScope.material = <BABYLON.StandardMaterial> this._textureObject.material;
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
        TextureEditor.disableEnableButton = [function () {
                return {
                    require: 'ngModel',
                    priority: 1,
                    link: function (scope, element, attrs, ngModel) {
                        var render = ngModel.$render;
                        var addedText = attrs['extraText'] ? " " + attrs['extraText'] + " " : "";
                        function resetButton() {
                            if (ngModel.$modelValue === true || ngModel.$modelValue === 1) {
                                element.html(addedText + "Enabled");
                                element.addClass('btn-success');
                                element.removeClass('btn-danger');
                            } else {
                                element.html(addedText + "Disabled");
                                element.addClass('btn-danger');
                                element.removeClass('btn-success');
                            }
                            render();
                        }

                        element.bind('mouseenter', function () {
                            if (ngModel.$modelValue === true || ngModel.$modelValue === 1) {
                                element.html("Disable" + addedText);
                                element.addClass('btn-danger');
                                element.removeClass('btn-success');
                            } else {
                                element.html("Enable" + addedText);
                                element.addClass('btn-success');
                                element.removeClass('btn-danger');
                            }
                        });
                        element.bind('mouseleave', resetButton);

                        ngModel.$render = resetButton;

                        resetButton();
                    }
                };
            }];
    })(RW.TextureEditor || (RW.TextureEditor = {}));
    var TextureEditor = RW.TextureEditor;
})(RW || (RW = {}));
var RW;
(function (RW) {
    (function (TextureEditor) {
        var MaterialController = (function () {
            function MaterialController($scope, $modal /* modal from angular bootstrap ui */ , canvasService, materialService) {
                var _this = this;
                this.$scope = $scope;
                this.$modal = $modal;
                this.canvasService = canvasService;
                this.materialService = materialService;
                this.afterObjectChanged = function (event, object) {
                    _this.materialService.initMaterialSections(object);
                    _this.$scope.material = object.material;
                    _this.$scope.sectionNames = _this.materialService.getMaterialSectionsArray();
                    _this.$scope.materialSections = _this.materialService.getMaterialSections();
                };
                $scope.updateTexture = function (type) {
                    $scope.$apply(function () {
                        $scope.materialSections[type].texture.canvasUpdated();
                    });
                };

                $scope.$on("objectChanged", this.afterObjectChanged);
            }
            MaterialController.prototype.exportMaterial = function () {
                var _this = this;
                var modalInstance = this.$modal.open({
                    templateUrl: 'materialExport.html',
                    controller: 'MaterialExportModalController',
                    size: "lg",
                    resolve: {
                        materialDefinitions: function () {
                            return _this.$scope.materialSections;
                        }
                    }
                });
            };
            MaterialController.$inject = [
                '$scope',
                '$modal',
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
        var MaterialExportModlController = (function () {
            function MaterialExportModlController($scope, $modalInstance, materialDefinitions) {
                var _this = this;
                this.$scope = $scope;
                this.$modalInstance = $modalInstance;
                this.materialDefinitions = materialDefinitions;
                $scope.materialName = "my awsome material";
                $scope.materialVariableName = "myAwsomeMaterial";
                $scope.sceneVariableName = "myWonderfulScene";
                console.log($scope, $modalInstance, materialDefinitions);

                $scope.close = function () {
                    $modalInstance.close();
                };

                $scope.updateExport = function () {
                    var strings = [];
                    strings.push("//Material generated using the babylon material editor, https://github.com/raananw/BabylonJS-Material-Editor ");
                    strings.push("\n");
                    strings.push("var " + _this.$scope.materialVariableName + " = new BABYLON.StandardMaterial('" + _this.$scope.materialName + "', " + _this.$scope.sceneVariableName + ")");
                    strings.push("\n");

                    var exports = [];

                    exports.push(strings.join(";\n"));

                    Object.keys(_this.materialDefinitions).forEach(function (definition) {
                        exports.push(_this.materialDefinitions[definition].exportToJavascript(_this.$scope.sceneVariableName, _this.$scope.materialName, _this.$scope.materialVariableName));
                    });

                    _this.$scope.materialExport = exports.join(";\n").split("\n;\n").join("\n");
                };

                $scope.updateExport();
            }
            MaterialExportModlController.$inject = [
                '$scope',
                '$modalInstance',
                'materialDefinitions'
            ];
            return MaterialExportModlController;
        })();
        TextureEditor.MaterialExportModlController = MaterialExportModlController;
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
                //this.initMaterialSections();
            }
            MaterialService.prototype.initMaterialSections = function (object) {
                this.materialSections = {};
                this.materialSections["diffuse"] = new TextureEditor.MaterialDefinitionSection("diffuse", object, true, true, true);
                this.materialSections["emissive"] = new TextureEditor.MaterialDefinitionSection("emissive", object, true, true, true);
                this.materialSections["ambient"] = new TextureEditor.MaterialDefinitionSection("ambient", object, true, true, false);
                this.materialSections["opacity"] = new TextureEditor.MaterialDefinitionSection("opacity", object, false, true, true);
                this.materialSections["specular"] = new TextureEditor.MaterialDefinitionSection("specular", object, true, true, false);
                this.materialSections["reflection"] = new TextureEditor.MaterialDefinitionSection("reflection", object, false, true, true);
                this.materialSections["bump"] = new TextureEditor.MaterialDefinitionSection("bump", object, false, true, false);
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
        var FresnelDefinition = (function () {
            function FresnelDefinition(name, _material) {
                this.name = name;
                this._propertyInMaterial = name + 'FresnelParameters';
                if (_material[this._propertyInMaterial]) {
                    this.fresnelVariable = _material[this._propertyInMaterial];
                } else {
                    this.fresnelVariable = new BABYLON.FresnelParameters();
                    this.fresnelVariable.isEnabled = false;
                    _material[this._propertyInMaterial] = this.fresnelVariable;
                }
                this.leftColor = new TextureEditor.HexToBabylon("left", _material[this._propertyInMaterial]), this.rightColor = new TextureEditor.HexToBabylon("right", _material[this._propertyInMaterial]);
            }
            FresnelDefinition.prototype.exportAsJavascript = function (materialVarName) {
                var strings = [];
                var varName = materialVarName + "_" + this.name + "Fresnel";
                strings.push("var " + varName + " = new BABYLON.FresnelParameters()");
                strings.push(varName + ".isEnabled = true");
                strings.push(varName + ".bias = " + this.fresnelVariable.bias);
                strings.push(varName + ".power = " + this.fresnelVariable.power);
                var colorArray = this.fresnelVariable.leftColor.asArray();
                strings.push(varName + "." + "leftColor" + " = new BABYLON.Color3(" + colorArray[0] + ", " + colorArray[1] + ", " + colorArray[2] + ")");
                colorArray = this.fresnelVariable.rightColor.asArray();
                strings.push(varName + "." + "rightColor" + " = new BABYLON.Color3(" + colorArray[0] + ", " + colorArray[1] + ", " + colorArray[2] + ")");
                strings.push(materialVarName + "." + this._propertyInMaterial + " = " + varName);

                return strings.join(";\n");
            };
            return FresnelDefinition;
        })();
        TextureEditor.FresnelDefinition = FresnelDefinition;
    })(RW.TextureEditor || (RW.TextureEditor = {}));
    var TextureEditor = RW.TextureEditor;
})(RW || (RW = {}));
var RW;
(function (RW) {
    (function (TextureEditor) {
        var HexToBabylon = (function () {
            function HexToBabylon(propertyName, _variable, addedString) {
                if (typeof addedString === "undefined") { addedString = "Color"; }
                this.propertyName = propertyName;
                this._variable = _variable;
                this.propertyName += addedString;
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
    })(RW.TextureEditor || (RW.TextureEditor = {}));
    var TextureEditor = RW.TextureEditor;
})(RW || (RW = {}));
var RW;
(function (RW) {
    (function (TextureEditor) {
        var MaterialDefinitionSection = (function () {
            function MaterialDefinitionSection(name, _object, hasColor, hasTexture, hasFresnel) {
                this.name = name;
                this._object = _object;
                this.hasColor = hasColor;
                this.hasTexture = hasTexture;
                this.hasFresnel = hasFresnel;
                if (hasColor) {
                    this.color = new TextureEditor.HexToBabylon(name, _object.material);
                }
                if (hasTexture) {
                    this.texture = new TextureEditor.TextureDefinition(name, _object.material, _object);
                }
                if (hasFresnel) {
                    this.fresnel = new TextureEditor.FresnelDefinition(name, _object.material);
                }
            }
            MaterialDefinitionSection.prototype.exportToJavascript = function (sceneVarName, materialName, materialVarName) {
                var strings = [];

                if (this.hasColor) {
                    var colorArray = this.color.babylonColor.asArray();
                    strings.push(materialVarName + "." + this.color.propertyName + " = new BABYLON.Color3(" + colorArray[0] + ", " + colorArray[1] + ", " + colorArray[2] + ")");
                }
                if (this.hasFresnel && this.fresnel.fresnelVariable.isEnabled) {
                    strings.push("//Fresnel Parameters ");
                    strings.push(this.fresnel.exportAsJavascript(materialVarName));
                }
                if (this.hasTexture && this.texture.enabled()) {
                    strings.push("//Texture Parameters ");
                    strings.push(this.texture.exportAsJavascript(sceneVarName, materialVarName));
                }

                if (strings.length != 0) {
                    strings.unshift("\n");
                    strings.unshift("// " + this.name + " definitions");
                    strings.unshift("\n");
                }

                return strings.join(";\n");
            };
            return MaterialDefinitionSection;
        })();
        TextureEditor.MaterialDefinitionSection = MaterialDefinitionSection;
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
var RW;
(function (RW) {
    (function (TextureEditor) {
        var TextureDefinition = (function () {
            function TextureDefinition(name, _material, _connectedMesh) {
                var _this = this;
                this.name = name;
                this._material = _material;
                this._connectedMesh = _connectedMesh;
                //for ng-repeat
                this.getCanvasNumber = function () {
                    return new Array(_this.numberOfImages);
                };
                this.propertyInMaterial = this.name.toLowerCase() + "Texture";
                this.canvasId = this.name + "Canvas";
                this.numberOfImages = 1;
                if (this._material[this.propertyInMaterial]) {
                    if (this._material[this.propertyInMaterial] instanceof BABYLON.MirrorTexture) {
                        this.babylonTextureType = 4 /* MIRROR */;
                    } else if (this._material[this.propertyInMaterial] instanceof BABYLON.VideoTexture) {
                        this.babylonTextureType = 4 /* MIRROR */;
                    } else if (this._material[this.propertyInMaterial] instanceof BABYLON.CubeTexture) {
                        this.babylonTextureType = 3 /* CUBE */;
                    } else {
                        this.babylonTextureType = 1 /* NORMAL */;
                    }
                    this.enabled(true);
                    this.initFromMaterial();
                } else {
                    this.babylonTextureType = 1 /* NORMAL */;
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

                //this.babylonTextureType = BabylonTextureType.NORMAL;
                this.init = true;
            };

            TextureDefinition.prototype.initFromMaterial = function () {
                this.textureVariable = this._material[this.propertyInMaterial];
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

            TextureDefinition.prototype.mirrorEnabled = function (enabled) {
                if (angular.isDefined(enabled)) {
                    if (enabled) {
                        if (this.name != "reflection") {
                            throw new Error("wrong texture for mirror! Should be reflection!");
                        }
                        this.babylonTextureType = 4 /* MIRROR */;

                        //create the mirror
                        this.textureVariable = new BABYLON.MirrorTexture("mirrorTex", 512, this._material.getScene());
                        this.textureVariable['renderList'] = this._material.getScene().meshes;

                        //calculate plane
                        var pointsArray = [];
                        var meshWorldMatrix = this._connectedMesh.computeWorldMatrix();
                        var verticesPos = this._connectedMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
                        for (var i = 0; i < 3; i++) {
                            pointsArray.push(BABYLON.Vector3.TransformCoordinates(BABYLON.Vector3.FromArray(verticesPos, i * 3), meshWorldMatrix));
                        }
                        this.textureVariable['mirrorPlane'] = BABYLON.Plane.FromPoints(pointsArray[0], pointsArray[1], pointsArray[2]);
                        this.init = true;
                        if (!this._isEnabled) {
                            this.enabled(true);
                        }
                    } else {
                        this.babylonTextureType = 1 /* NORMAL */;
                        this._material[this.propertyInMaterial] = null;
                        this.init = false;
                    }
                } else {
                    return this._isEnabled && this.babylonTextureType == 4 /* MIRROR */;
                }
            };

            TextureDefinition.prototype.enabled = function (enabled) {
                if (angular.isDefined(enabled)) {
                    if (enabled) {
                        if (this.textureVariable)
                            this._material[this.propertyInMaterial] = this.textureVariable;
                        this._isEnabled = true;
                    } else {
                        this._material[this.propertyInMaterial] = null;
                        this._isEnabled = false;
                    }
                } else {
                    return this._isEnabled;
                }
            };

            TextureDefinition.prototype.canvasUpdated = function () {
                this.initTexture();
                if (this._isEnabled) {
                    this._material[this.propertyInMaterial] = this.textureVariable;
                }
            };

            //TODO implement video support etc'. At the moment only dynamic is supported.
            /*public setBabylonTextureType(type: BabylonTextureType) {
            this.babylonTextureType = type;
            if (type === BabylonTextureType.CUBE) {
            this.coordinatesMode(CoordinatesMode.CUBIC);
            }
            }*/
            TextureDefinition.prototype.exportAsJavascript = function (sceneVarName, materialVarName) {
                var _this = this;
                var strings = [];
                var varName = materialVarName + "_" + this.name + "Texture";

                //init the variable
                if (this.babylonTextureType == 4 /* MIRROR */) {
                    strings.push("var " + varName + " = new BABYLON.MirrorTexture('MirrorTexture', 512," + sceneVarName + " )");
                    var plane = this.textureVariable['mirrorPlane'];
                    var array = plane.asArray();
                    strings.push(varName + ".mirrorPlane = new BABYLON.Plane(" + array[0] + "," + array[1] + "," + array[2] + "," + array[3] + ")");
                    strings.push("// Change the render list to fit your needs. The scene's meshes is being used per default");
                    strings.push(varName + ".renderList = " + sceneVarName + ".meshes");
                } else {
                    var extension = this.textureVariable.hasAlpha ? ".png" : ".jpg";
                    strings.push("var " + varName + " = new BABYLON.Texture('" + materialVarName + "_" + this.name + extension + "', " + sceneVarName + ")");
                }

                //uvw stuff
                ["uScale", "vScale", "coordinatesMode", "uOffset", "vOffset", "uAngle", "vAngle", "level", "coordinatesIndex", "hasAlpha", "getAlphaFromRGB"].forEach(function (param) {
                    strings.push(varName + "." + param + " = " + _this.textureVariable[param]);
                });
                strings.push("");
                strings.push(materialVarName + "." + this.propertyInMaterial + " = " + varName);
                return strings.join(";\n");
            };
            return TextureDefinition;
        })();
        TextureEditor.TextureDefinition = TextureDefinition;
    })(RW.TextureEditor || (RW.TextureEditor = {}));
    var TextureEditor = RW.TextureEditor;
})(RW || (RW = {}));
var RW;
(function (RW) {
    (function (TextureEditor) {
        (function (BabylonTextureType) {
            BabylonTextureType[BabylonTextureType["DYNAMIC"] = 0] = "DYNAMIC";
            BabylonTextureType[BabylonTextureType["NORMAL"] = 1] = "NORMAL";
            BabylonTextureType[BabylonTextureType["VIDEO"] = 2] = "VIDEO";
            BabylonTextureType[BabylonTextureType["CUBE"] = 3] = "CUBE";
            BabylonTextureType[BabylonTextureType["MIRROR"] = 4] = "MIRROR";
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
    })(RW.TextureEditor || (RW.TextureEditor = {}));
    var TextureEditor = RW.TextureEditor;
})(RW || (RW = {}));
//# sourceMappingURL=application.js.map
