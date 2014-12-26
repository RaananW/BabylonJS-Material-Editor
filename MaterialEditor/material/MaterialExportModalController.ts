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

        constructor(private $scope: MaterialModalScope, private $modalInstance: any, private materialDefinitions: Array<MaterialDefinitionSection>) {
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
                strings.push("\n");
                strings.push("var " + this.$scope.materialVariableName + " = new BABYLON.StandardMaterial('" + this.$scope.materialName + "', " + this.$scope.sceneVariableName + ")");
                strings.push("\n");

                var exports: Array<string> = []

            exports.push(strings.join(";\n"));

                Object.keys(this.materialDefinitions).forEach((definition) => {
                    exports.push(this.materialDefinitions[definition].exportToJavascript(this.$scope.sceneVariableName, this.$scope.materialName, this.$scope.materialVariableName));
                });

                this.$scope.materialExport = exports.join(";\n").split("\n;\n").join("\n");

            }

            $scope.updateExport();
        }
    }
} 