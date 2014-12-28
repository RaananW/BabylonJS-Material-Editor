module RW.TextureEditor {

    export interface MaterialModalScope extends ng.IScope {
        materialName: string;
        materialVariableName: string;
        sceneVariableName: string;
        materialExport: string;
        close: () => void;
        updateExport: () => void;
    }

    export class MaterialExportModlController {

        public static $inject = [
            '$scope',
            '$modalInstance',
            'materialDefinitions'
        ];

        constructor(private $scope: MaterialModalScope, private $modalInstance: any, private materialDefinitions: Array<Array<MaterialDefinitionSection>>) {
            $scope.materialName = "my awsome material";
            $scope.materialVariableName = "myAwsomeMaterial";
            $scope.sceneVariableName = "myWonderfulScene";
            console.log($scope, $modalInstance, materialDefinitions);
            

            $scope.close = () => {
                $modalInstance.close();
            }

            $scope.updateExport = () => {
                var strings: Array<string> = [];
                strings.push("//Material generated using the babylon material editor, https://github.com/raananw/BabylonJS-Material-Editor ");
                strings.push("");
                var className = this.materialDefinitions.length > 1 ? "MultiMaterial" : "StandardMaterial";
                strings.push("var " + this.$scope.materialVariableName + " = new BABYLON." + className +"('" + this.$scope.materialName + "', " + this.$scope.sceneVariableName + ")");
                
                var exports: Array<string> = []

                exports.push(strings.join(";\n"));

                if (this.materialDefinitions.length == 1) {
                    Object.keys(this.materialDefinitions[0]).forEach((definition) => {
                        exports.push(this.materialDefinitions[0][definition].exportToJavascript(this.$scope.sceneVariableName, this.$scope.materialName, this.$scope.materialVariableName));
                    });
                } else {
                    for (var i = 0; i < this.materialDefinitions.length; ++i) {
                        var matVarName = this.$scope.materialVariableName + "_" + i;
                        exports.push("var " + matVarName + " = new BABYLON.StandardMaterial('" + this.$scope.materialName + " " + i + "', " + this.$scope.sceneVariableName + ")");
                        Object.keys(this.materialDefinitions[i]).forEach((definition) => {
                            exports.push(this.materialDefinitions[i][definition].exportToJavascript(this.$scope.sceneVariableName, this.$scope.materialName + " " + i, matVarName));
                        });
                        exports.push(this.$scope.materialVariableName + ".subMaterials[" + i + "] = " + matVarName);
                    }
                }

                this.$scope.materialExport = exports.join(";\n").replace(/\n;\n/g, "\n\n");

            }

            $scope.updateExport();
        }
    }
} 