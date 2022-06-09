<template>
      
      <div><!-- panel buttun tool --></div>
</template>

<script>
    import { fabric } from 'fabric'
    export default {
        data: () => ({ 

        }),
        methods: {

        },
        mounted() {
            this._labelViewerDiv = document.createElement('div');
            this._labelViewerDiv.setAttribute('id', 'labelViewer');
            this._labelViewerDiv.style.position = 'absolute';
            this._labelViewerDiv.style.left = 0;
            this._labelViewerDiv.style.top = 0;
            this._labelViewerDiv.style.width = '100%';
            this._labelViewerDiv.style.height = '100%';

            let myInterval = setInterval(()=>{
                if(document.getElementById('openseadragon_canvas')!==null){
                    clearInterval(myInterval);
                    document.getElementById('openseadragon_canvas').appendChild(this._labelViewerDiv);

                    this._labelCanvas = document.createElement('canvas');
                    this._labelCanvas.setAttribute('id', 'labelCanvas');
                    this._labelViewerDiv.appendChild(this._labelCanvas);

                    this._canvas = new fabric.Canvas('labelCanvas')
                    this._canvas.selection = false;
                    this._canvas.preserveObjectStacking = true;
                
                    fabric.Object.prototype.objectCaching = false;
                    fabric.Object.prototype.cornerStyle = 'circle';
                    fabric.Object.prototype.cornerSize = 8
                    fabric.Object.prototype.hasBorders = false;
                    this._canvas._scale = 1000;
                } else {
                    console.log("wait mount viewer")
                }
            }, 100);
        }
  }
</script>
