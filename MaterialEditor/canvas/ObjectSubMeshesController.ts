module RW.TextureEditor {

    export interface ObjectSubMeshesScope extends ng.IScope {
        object: BABYLON.AbstractMesh;
        totalNumberOfIndices: number;
        indicesLeft: number;
        close: () => void;
        updateObject: () => void;
        addSubMesh: () => void;
        removeSubMesh: (index:number) => void;
    }

    export class ObjectSubMeshesController {

        public static $inject = [
            '$scope',
            '$modalInstance',
            'object'
        ];

        constructor(private $scope: ObjectSubMeshesScope, private $modalInstance: any, private object: BABYLON.Mesh) {

            $scope.object = object;
            $scope.totalNumberOfIndices = object.getTotalIndices();

            $scope.close = () => {
                $modalInstance.close();
            }

            $scope.updateObject = () => {
                var usedVertics: number = 0;
                object.subMeshes.forEach((subMesh) => {
                    //rounding to threes.
                    var substract = subMesh.indexCount % 3;
                    subMesh.indexCount -= subMesh.indexCount % 3;
                    substract = subMesh.indexStart % 3;
                    subMesh.indexStart -= substract;

                    usedVertics += subMesh.indexCount;
                });
                $scope.indicesLeft = $scope.totalNumberOfIndices - usedVertics;
            }

            $scope.addSubMesh = () => {
                var count = this.$scope.indicesLeft < 0 ? 0 : this.$scope.indicesLeft;
                new BABYLON.SubMesh(object.subMeshes.length, 0, object.getTotalVertices(),
                    this.$scope.totalNumberOfIndices - this.$scope.indicesLeft, count, object);
                $scope.updateObject();
            }

            $scope.removeSubMesh = (index:number) => {
                object.subMeshes.splice(index, 1);
                $scope.updateObject();
            }
            $scope.updateObject();
        }

    }
}  