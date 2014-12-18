module RW.TextureEditor {

    export var textureImage = ["$parse", function ($parse:ng.IParseService) {
        return {
            restrict: 'E',
            templateUrl: function (elem, attr) {
                //return 'image-dnd-' + attr.amount + '.html';
                //console.log(elem, attr);
                return 'template/image-drag-drop.html'
            },
            scope: {
                tex: '=',
                updateTexture: '&onUpdateTexture'
            },
            transclude:true,
            link: function (scope, element, attr) {
                var texture = <TextureDefinitionImpl> scope.tex;

                function render(src, canvasId: string) {
                    var image = new Image();
                    image.onload = function () {
                        var canvas = <HTMLCanvasElement> document.getElementById(canvasId);
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

                function loadImage(src, canvasId: string) {
                    //	Prevent any non-image file type from being read.
                    if (!src.type.match(/image.*/)) {
                        console.log("The dropped file is not an image: ", src.type);
                        return;
                    }

                    //	Create our FileReader and run the results through the render function.
                    var reader = new FileReader();
                    reader.onload = (e) => {
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
                    element.on("drop", ".texture-canvas-drop", function (e:any) {
                        e.preventDefault();
                        loadImage(e.originalEvent.dataTransfer.files[0], canvasId);
                    });
                }
                
            }
        }
    }]

} 