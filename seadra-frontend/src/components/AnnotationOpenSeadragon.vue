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
            
            selected_tool(newSlected, oldSelected) {
                console.log(newSlected,oldSelected);
            },
            viewerOSD(newOSD){
                if(!newOSD.canvas.contains(this._labelViewerDiv)){
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

                    newOSD.addHandler('canvas-press', (e) => {
                        this.lastCenter = newOSD.viewport.getCenter(true);
                        this._canvas._onMouseDown(e.originalEvent);
                        e.originalEvent.stopPropagation();
                    }); 
                    newOSD.addHandler('canvas-release', (e) => {
                        this._canvas._onMouseUp(e.originalEvent)
                    });     
                    newOSD.addHandler('canvas-click', (e) => {
                        e.preventDefaultAction = true;
                    });     
                    newOSD.addHandler('canvas-drag', (e) => {
                        this._canvas._onMouseMove(e.originalEvent)
                    });
                    newOSD.addHandler('zoom', () => {
                        this.lastZoom = newOSD.viewport.getZoom(true);
                        this.lastCenter = newOSD.viewport.getCenter(true);   
                    });
                    newOSD.addHandler('viewport-change', () => {
                        if(!this.lastZoom)
                            this.lastZoom = newOSD.viewport.getZoom(true);
                        if(!this.lastCenter)
                            this.lastCenter = newOSD.viewport.getCenter(true);
                        var currentZoom = newOSD.viewport.getZoom(true);
                        var deltaZoom = currentZoom/this.lastZoom
                        var currentCenter = newOSD.viewport.getCenter(true);
                        var lastWinCenter = newOSD.viewport.pixelFromPoint(this.lastCenter);
                        var currentWinCenter = newOSD.viewport.pixelFromPoint(currentCenter);    

                        this.changePosition(lastWinCenter, currentWinCenter, deltaZoom);
                        this._canvas.renderAll();
                        this._canvas.setViewportTransform(this._canvas.viewportTransform);
                        this.lastZoom = currentZoom;
                        this.lastCenter = currentCenter;
                    });
                    newOSD.addHandler('canvas-scroll', () => {
                        // temporarily useless
                    });
                    newOSD.addHandler('canvas-enter', () => {
                        this.mouseOut = false;
                        if(this.drawMode) this.showXYLine();
                        this._canvas.renderAll();
                    })
                    newOSD.addHandler('canvas-exit', () => {
                        this.mouseOut = true;
                        if(this.drawMode) this.hiddenXYLine()
                        this._canvas.renderAll();
                    })
                }
            }
        },
        methods: {
            resize(){
                this._canvas.setWidth(this.viewerOSD.canvas.clientWidth);
                this._canvas.setHeight(this.viewerOSD.canvas.clientHeight);
            },
            changePosition(lastPoint, currentPoint, deltaZoom) {
                var x,y,w,h;
                for(var i in this.labelBoxes) {
                    var box = this.labelBoxes[i];
                    if(box.type == 'rect') {
                        x = (box.shape.left - currentPoint.x) * deltaZoom + lastPoint.x;
                        y = (box.shape.top - currentPoint.y) * deltaZoom + lastPoint.y;
                        w = box.shape.width * deltaZoom;
                        h = box.shape.height * deltaZoom;
                        box.shape.set('left', x);
                        box.shape.set('top', y);
                        box.shape.set('width', w);
                        box.shape.set('height', h);
                    }
                    else if(box.type == 'poly') {
                        x = (box.shape.left - currentPoint.x + 1) * deltaZoom + lastPoint.x - 1;
                        y = (box.shape.top - currentPoint.y + 1) * deltaZoom + lastPoint.y - 1;
                        w = box.shape.width * deltaZoom;
                        h = box.shape.height * deltaZoom;
                        box.shape.set('left', x);
                        box.shape.set('top', y);
                        box.shape.set('width', w);
                        box.shape.set('height', h);
                        var offsetX = box.shape.pathOffset.x * deltaZoom;
                        var offsetY = box.shape.pathOffset.y * deltaZoom;
                        box.shape.set('pathOffset', {x: offsetX, y: offsetY});
                        var points = box.shape.points;
                        for(var j in points) {
                            points[j].x = points[j].x * deltaZoom;
                            points[j].y = points[j].y * deltaZoom;
                        }
                    }
                }
            },
        },
        mounted() {
            this._labelViewerDiv = document.createElement('div');
            this._labelViewerDiv.setAttribute('id', 'labelViewer');
            this._labelViewerDiv.style.position = 'absolute';
            this._labelViewerDiv.style.left = 0;
            this._labelViewerDiv.style.top = 0;
            this._labelViewerDiv.style.width = '100%';
            this._labelViewerDiv.style.height = '100%';
            window.addEventListener('resize', this.resize);
        },
        unmounted() {
            window.removeEventListener('resize', this.resize);
        },
  }
</script>
