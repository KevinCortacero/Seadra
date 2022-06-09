<template>
    <v-card flat class="py-12">
        <v-card-text>
        <v-row align="center" justify="center">
            <v-btn-toggle v-model="selected_tool" rounded color="primary">
            <v-btn :value="'fabric-rect'">
                <v-icon>mdi-shape-rectangle-plus</v-icon>
            </v-btn>
            <v-btn :value="'fabric-polygon'">
                <v-icon>mdi-vector-polygon</v-icon>
            </v-btn>
            <v-btn :value="'delete'">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
            <v-btn :value="'send-front'">
                <v-icon>mdi-arrange-bring-forward</v-icon>
            </v-btn>
            <v-btn :value="'send-back'">
                <v-icon>mdi-arrange-send-backward</v-icon>
            </v-btn>
            </v-btn-toggle>
        </v-row>
        </v-card-text>
  </v-card>
</template>

<script>
    import { fabric } from 'fabric'
    import { mapState } from 'vuex';
    export default {
        data: () => ({ 
            selected_tool: undefined,
        }),
        computed: mapState(['viewerOSD']),
        watch: {
            // whenever question changes, this function will run
            /*
            selected_tool(newSlected, oldSelected) {
                
            },*/
            viewerOSD(newOSD){
                newOSD.canvas.appendChild(this._labelViewerDiv);

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
            }
        },
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
/*
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


        this._osdViewer.addHandler('canvas-press', (e) => {
            this.lastCenter = this._osdViewer.viewport.getCenter(true);
            this._canvas._onMouseDown(e.originalEvent);
            e.originalEvent.stopPropagation();
        }); 
        this._osdViewer.addHandler('canvas-release', (e) => {
            this._canvas._onMouseUp(e.originalEvent)
        });     
        this._osdViewer.addHandler('canvas-click', (e) => {
            e.preventDefaultAction = true;
        });     
        this._osdViewer.addHandler('canvas-drag', (e) => {
            this._canvas._onMouseMove(e.originalEvent)
        });
        this._osdViewer.addHandler('zoom', (e) => {
            this.lastZoom = this._osdViewer.viewport.getZoom(true);
            this.lastCenter = this._osdViewer.viewport.getCenter(true);   
        });
        this._osdViewer.addHandler('open', (e) => {
            this.loading = false;
            this.getLabelBoxes();
        });
        this._osdViewer.addHandler('viewport-change', (e) => {
            if(!this.lastZoom)
                this.lastZoom = this._osdViewer.viewport.getZoom(true);
            if(!this.lastCenter)
                this.lastCenter = this._osdViewer.viewport.getCenter(true);
            var currentZoom = this._osdViewer.viewport.getZoom(true);
            var deltaZoom = currentZoom/this.lastZoom
            var currentCenter = this._osdViewer.viewport.getCenter(true);
            var lastWinCenter = this._osdViewer.viewport.pixelFromPoint(this.lastCenter);
            var currentWinCenter = this._osdViewer.viewport.pixelFromPoint(currentCenter);    

            this.changePosition(lastWinCenter, currentWinCenter, deltaZoom);
            this._canvas.renderAll();
            this._canvas.setViewportTransform(this._canvas.viewportTransform);
            this.lastZoom = currentZoom;
            this.lastCenter = currentCenter;
        });
        this._osdViewer.addHandler('canvas-scroll', (e) => {
            // temporarily useless
        });
        this._osdViewer.addHandler('canvas-enter', (e) => {
            this.mouseOut = false;
            if(this.drawMode) this.showXYLine();
            this._canvas.renderAll();
        })
        this._osdViewer.addHandler('canvas-exit', (e) => {
            this.mouseOut = true;
            if(this.drawMode) this.hiddenXYLine()
            this._canvas.renderAll();
        })

                } else {
                    console.log("wait mount viewer")
                }
            }, 100);*/
        }
  }
</script>
