import {fabric} from 'fabric';
import OpenSeadragon from 'openseadragon'
import {LabelBoxRectangle,LabelBoxPolygon} from './label-box'

function toHex(d) {
    return  ("0"+(Number(d).toString(16))).slice(-2).toUpperCase()
}
function LabelTool() {
    // main components
    this._osdViewer = null; // Openseadragon viewer
    this._labelViewerDiv = null;
    this._canvas = null; // Fabric.js fabric.Canvas
    
    // some states, variable for viewer
    this.hoveredBox = null;
    this.selectedBox = null;
    this.lastCenter = null; 
    this.lastZoom = null;
    this.editMode = false; 
    this.drawMode = false; // if true, show auxiliary line
    this.drawing = false;
    this.boxDrag = false;
    this.startPoint = null;
    this.endPoint = null;
    this.mouseOut = false;
    this.drawRectangle = true;

   // auxiliary box, line, polygon
   this.auxBoxRectangle = null;
   this.auxBoxPolygon = null;
   this.auxLineToStart = null;
   this.auxLineToEnd = null;
   this.xAuxLine = null;
   this.YAuxLine = null;
   this.auxPoints = [];

   this.opacityBox = 0.02;
   this.opacityBox2 = 0.8;
    
    // label class
    this.selectedClass = {
        id: null,
        name: null,
        color: null
    }
    

    // label box for current slide
    this.labelBoxes = {};
    this.saveState = true;

}

LabelTool.prototype = {
    init: function(osd,cbBoxSelected) {
        this._osdViewer = osd
        this._cbBoxSelected = cbBoxSelected
        this.initFabric();
        this.initAuxLine();
        this.initAuxBoxRectangle();
        this.initCusEvent();
        //this.initLabelClass();
        this.viewModeOn();
    },
    initFabric : function() {
        this._labelViewerDiv = document.createElement('div');
        this._labelViewerDiv.setAttribute('id', 'labelViewer');
        this._labelViewerDiv.style.position = 'absolute';
        this._labelViewerDiv.style.left = 0;
        this._labelViewerDiv.style.top = 0;
        this._labelViewerDiv.style.width = '100%';
        this._labelViewerDiv.style.height = '100%';
        // this._labelViewerDiv.style.zIndex = '1000';

        this._osdViewer.canvas.appendChild(this._labelViewerDiv);

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
        this.resize();
    },
    initAuxLine: function() {
        this.xAuxLine = new fabric.Line([0, 100, this._canvas.width, 100],{
            //stroke: this.selectedClass.color,
            stroke: 'rgb(100,100,100)',
            strokeDashArray: [5, 5],
            tab: 'aux',
            selectable : false,
            visible: false
        });
        this.yAuxLine = new fabric.Line([100, 0, 100, this._canvas.height],{
            //stroke: this.selectedClass.color,
            stroke: 'rgb(100,100,100)',
            strokeDashArray: [5, 5],
            tab: 'aux',
            selectable: false,
            visible: false
        });

        this.auxLineToStart = new fabric.Line([0, 0, 0, 0], {
            //stroke: this.selectedClass.color,
            stroke: 'rgb(100,100,100)',
            strokeDashArray: [5, 2],
            tab: 'aux',
            selectable : false,
            visible: false
        });
        this.auxLineToEnd = new fabric.Line([0, 0, 0, 0], {
            //stroke: this.selectedClass.color,
            stroke: 'rgb(100,100,100)',
            strokeDashArray: [5, 2],
            tab: 'aux',
            selectable : false,
            visible: false
        });

        this._canvas.add(this.xAuxLine);
        this._canvas.add(this.yAuxLine);
        this._canvas.add(this.auxLineToStart);
        this._canvas.add(this.auxLineToEnd);
    },
    initAuxBoxRectangle: function() {
        console.log(this.selectedClass)
        var rect = {
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            fill: this.selectedClass.color + toHex(Math.round(this.opacityBox*255)),
         //  fill: (this.selectedClass.id)?this.selectedClass.color + '66':'rgba(160,160,160,0.4)',
            opacity: this.opacityBox2,
            visible: false,
            strokeWidth: 2,
            stroke: this.selectedClass.color,
          //  stroke: (this.selectedClass.id)?this.selectedClass.color:'rgba(80,80,80,1)',// "#880E4F",
            strokeUniform: true,
            _controlsVisibility:{
                mtr: false
            },
            tab: 'auxbox'
        };
        
        this.auxBoxRectangle = new LabelBoxRectangle(rect);
        this._canvas.add(this.auxBoxRectangle.shape);
        //this.updateBoxClass(this.auxBoxRectangle.get('tab'),this.selectedClass.id);
    },
    initAuxBoxPolygon: function(points) {
        var polygon = {
            points: points,
            fill: this.selectedClass.color + toHex(Math.round(this.opacityBox*255)),
            //fill: (this.selectedClass.id)?this.selectedClass.color + '66':'rgba(160,160,160,0.4)',
            opacity: this.opacityBox2,
            strokeWidth: 2,
            stroke: this.selectedClass.color,
            //stroke: (this.selectedClass.id)?this.selectedClass.color:'rgba(80,80,80,1)',// "#880E4F",
            strokeUniform: true,
            _controlsVisibility:{
                mtr: false
            },
            tab: 'auxbox',
            selectable : false
        };
        this.auxBoxPolygon = new LabelBoxPolygon(polygon);
        this._canvas.add(this.auxBoxPolygon.shape);
        //this.updateBoxClass(this.auxBoxPolygon.get('tab'),this.selectedClass.id);
    },
    initCusEvent: function() {
        this._canvas.on({
            'mouse:over':(e) => {
                if(this.drawMode) {
                    if(e.target) {
                        // sometime the auxline will by hovered, ignore
                        if(e.target.tab == 'aux') return;
                        e.target.set('selectable', false);
                    }
                }
                else {
                    if(e.target) {
                        // this.hiddenXYLine();
                        this.hoveredBox = e.target
                        e.target.opacity = 1;
                        if(!e.target.selectable && e.target.tab != 'aux') {
                            e.target.selectable = true;
                        }
                        this._canvas.renderAll();
                    }
                }
            },
            'mouse:out':(e) => {
                if(this.drawMode) {
                    if(e.target) { 
                        if(e.target.tab == 'aux') return;
                        e.target.set('selectable', true);
                    }
                }
                else {
                    if(e.target) {
                        // sometimes the auxline will by hovered, ignore
                        if(e.target.tab == 'aux') return;
                        if(this.boxDrag) return;
                        e.target.opacity = this.opacityBox2;
                        this.hoveredBox = null;
                        this._canvas.renderAll();
                    }
                }
            },
            'mouse:down':(e) => {
                if(this.drawMode) {
                    if(this.drawRectangle) {
                        this.drawing = true;
                        this.startPoint = e.pointer;
                        this.auxBoxRectangle.set("fill", this.selectedClass.color + toHex(Math.round(this.opacityBox*255)),);
                        this.auxBoxRectangle.set("stroke", this.selectedClass.color);
                    }
                    else {
                        var newPoint = {};
                        newPoint.x = e.pointer.x;
                        newPoint.y = e.pointer.y;
                        this.auxPoints.push(newPoint);
                        if(!this.startPoint) {
                            this.drawing = true;
                            this.startPoint = newPoint;
                            this.auxLineToStart.set({'x1':this.startPoint.x, 'y1': this.startPoint.y});
                            this.auxLineToStart.set({'x2':this.startPoint.x, 'y2': this.startPoint.y});
                            this.auxLineToStart.visible = true;
                        }
                        else {
                            if(!this.endPoint) {
                                this.auxLineToEnd.set({'x1':newPoint.x, 'y1': newPoint.y});
                                this.auxLineToEnd.set({'x2':newPoint.x, 'y2': newPoint.y});
                                this.auxLineToEnd.visible = true;
                                this.initAuxBoxPolygon(this.auxPoints); 
                            }
                            this.endPoint = newPoint;     
                        }
                        this._canvas.renderAll();
                    }
                }
                else if(e.target && e.target.selectable) {
                    if(this.selectedBox) this.selectedBox.set('strokeDashArray', [10, 2]);
                    e.target.set('strokeDashArray', [0, 0]);
                    this.selectedBox = e.target;
                    this._cbBoxSelected(this.labelBoxes[this.selectedBox.get('tab')])
                    this._canvas.renderAll();
                    this.editModeOn();
                }
                else {
                    if(this.selectedBox) {
                        this.selectedBox.set('strokeDashArray', [10, 2]);
                        this._canvas.renderAll();
                        this.selectedBox = null;
                        this._cbBoxSelected(undefined)
                    }
                    this.viewModeOn();
                }
            },
            'mouse:up':(e) => {
                               // finish draw rect
                               if(this.drawing && this.drawRectangle) {
                                this.auxBoxRectangle.set("visible", false);
                                var point = e.pointer;
                                if(this.isPointOutCanvas(point))
                                    point = this.limitPoint(point);
                                var loc = this.computeLocation(this.startPoint, point);
            
                                if(this.isRational(loc)) {
                                    var newBox = this.newLabelBoxRectangle(loc);
                                    this.addNewBox(newBox);
                                    this.saveState = false;
                                    //this._canvas.setActiveObject(newBox.shape);
                                    //this.selectedBox = newBox.shape;
                                    this.editModeOn();
                                    this.drawModeOn(true);
                                }
                                this.drawing = false;
                                this.startPoint = null;
                            }
                            if(this.boxDrag) this.boxDrag = false;
                        },
            'mouse:move':(e) => {
                this.xAuxLine.set('y1',e.pointer.y);
                this.xAuxLine.set('y2',e.pointer.y);
                this.yAuxLine.set('x1',e.pointer.x);
                this.yAuxLine.set('x2',e.pointer.x);
                if(this.drawMode) {
                    
                    if(this.drawing) {
                    // draw rectangle box
                        if(this.drawRectangle){
                            if(!this.startPoint) return;
                            if(this.startPoint) {
                                var point = e.pointer;
                                if(this.isPointOutCanvas(point))
                                    point = this.limitPoint(point);
                                var loc = this.computeLocation(this.startPoint, point);
                                this.auxBoxRectangle.set("left", loc.left);
                                this.auxBoxRectangle.set("top", loc.top);
                                this.auxBoxRectangle.set("width", loc.width);
                                this.auxBoxRectangle.set("height", loc.height);
                                this.auxBoxRectangle.set("visible", true);
                            }
                            else {
                                this.startPoint = e.pointer;
                            }
                        }
                        // draw ploygon box
                        else {
                            if(!this.startPoint) return;
                            if(!this.endPoint) {
                                this.auxLineToStart.set({'x1':this.startPoint.x, 'y1': this.startPoint.y});
                                this.auxLineToStart.set({'x2':e.pointer.x, 'y2': e.pointer.y});
                            }
                            else {
                                this.auxLineToStart.set({'x1':this.startPoint.x, 'y1': this.startPoint.y});
                                this.auxLineToStart.set({'x2':e.pointer.x, 'y2': e.pointer.y});
                                this.auxLineToEnd.set({'x1':this.endPoint.x, 'y1': this.endPoint.y});
                                this.auxLineToEnd.set({'x2':e.pointer.x, 'y2': e.pointer.y});
                            }
                        } 
                    }
                    this._canvas.renderAll();
                }
                if(this.boxDrag) {
                    this.lockViewer();
                    // to be completed
                    /* if(this.isBoxOutCanvas(this.selectedBox)) {
                        var loc = this.limitBox(this.selectedBox);
                        this.selectedBox.set("left", loc.left);
                        this.selectedBox.set("top", loc.top);
                        this.selectedBox.set("width", loc.width);
                        this.selectedBox.set("height", loc.height);
                    }; */
                }
               
            },
            'mouse:dblclick':() => {
                if(this.drawMode && this.drawing && !this.drawRectangle) {
                    if(this.auxPoints.length < 3) return;
                    this.auxPoints.splice(this.auxPoints.length-1,1);
                    var newPoints = []

                    JSON.parse(JSON.stringify(this.auxPoints));
                    
                    for(var i in this.auxBoxPolygon.shape.points) {
                        var point = fabric.util.transformPoint({
                            x: (this.auxBoxPolygon.shape.points[i].x  - this.auxBoxPolygon.shape.pathOffset.x),
                            y: (this.auxBoxPolygon.shape.points[i].y  - this.auxBoxPolygon.shape.pathOffset.y)
                            }, fabric.util.multiplyTransformMatrices(
                                this.auxBoxPolygon.shape.canvas.viewportTransform,
                                this.auxBoxPolygon.shape.calcTransformMatrix()
                            ));
                        newPoints.push(point);
                    }
                    var newBox = this.newLabelBoxPolygon(newPoints);

                    this._canvas.remove(this.auxBoxPolygon.shape);
                    this.auxBoxPolygon = null;
                    this.auxPoints = [];
                    this.auxLineToStart.visible = false;
                    this.auxLineToEnd.visible = false;
                    this.startPoint = null;
                    this.endPoint = null;
                    
                    this.addNewBox(newBox);
                    this._changeEditMode(newBox.shape, newBox.shape.cornerColor);
                    this._canvas.setActiveObject(newBox.shape);
                    //this.selectedBox = newBox.shape;
                    this._canvas.requestRenderAll();
                    this.editModeOn();
                    this.drawModeOn(false);

                    this.drawing = false;
                    this.saveState = false;
                } 
            },
            'object:moving':() => {
                this.lockViewer();
                this.boxDrag = true;
            },
            'object:scaling':() => {
                this.lockViewer();
            },
            'object:moved':() => {
                this.boxDrag = false;
            },
            'object:scaled':() => {
                // temporarily useless
            },
            'object:modified': () => {
                this.unlockViewer();
                this.saveState = false;
            }
        });
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
        this._osdViewer.addHandler('zoom', () => {
            this.lastCenter = this._osdViewer.viewport.getCenter(true);
            this.lastZoom = this._osdViewer.viewport.getZoom(true);
        });
        this._osdViewer.addHandler('open', () => {
            this.loading = false;
        });
        this._osdViewer.addHandler('viewport-change', () => {
            if(!this.lastZoom)
                this.lastZoom = this._osdViewer.viewport.getZoom(true);
            if(!this.lastCenter)
                this.lastCenter = this._osdViewer.viewport.getCenter(true)
            if(!this.lastSize)
                this.lastSize = this._osdViewer.viewport.getContainerSize()
            
            var currentZoom = this._osdViewer.viewport.getZoom(true);
            var deltaZoom = currentZoom/this.lastZoom
            var currentCenter = this._osdViewer.viewport.getCenter(true);
            var currentSize = this._osdViewer.viewport.getContainerSize();
            var lastWinCenter = this._osdViewer.viewport.pixelFromPoint(this.lastCenter);
            var currentWinCenter = this._osdViewer.viewport.pixelFromPoint(currentCenter);    

            this.changePosition(lastWinCenter, currentWinCenter,(currentSize.x-this.lastSize.x)/2,(currentSize.y-this.lastSize.y)/2, deltaZoom);
            this._canvas.renderAll();
            this._canvas.setViewportTransform(this._canvas.viewportTransform);
            this.lastZoom = currentZoom;
            this.lastCenter = currentCenter;
            this.lastSize = currentSize;
        });
        this._osdViewer.addHandler('canvas-scroll', () => {
            // temporarily useless
        });
        this._osdViewer.addHandler('canvas-enter', () => {
            this.mouseOut = false;
            if(this.drawMode) this.showXYLine();
            this._canvas.renderAll();
        })
        this._osdViewer.addHandler('canvas-exit', () => {
            this.mouseOut = true;
            if(this.drawMode) this.hiddenXYLine()
            this._canvas.renderAll();
        })
    },
    initLabelClass: function() {
        this.getLabelClasses();
    },
    changeLabel: function(selectedClass){
        this.selectedClass = selectedClass;
        if(this.selectedBox) {
            this.selectedBox.set('fill', this.selectedClass.color + toHex(Math.round(this.opacityBox*255)));
            this.selectedBox.set('stroke', this.selectedClass.color);
            this.selectedBox.set('cornerColor', this.selectedClass.color);
            this._canvas.renderAll();
            this.updateBoxClass(this.selectedBox.get('tab'),this.selectedClass.id);
        }
    },
    showXYLine: function(){
        if((!this.hoveredBox || this.drawMode)&& !this.mouseOut) {
            this.xAuxLine.visible = true;
            this.yAuxLine.visible = true;
            if(this.hoveredBox && this.hoveredBox.tab != 'aux') {
                this.hoveredBox.set('selectable', false);
            }
        }
    },
    hiddenXYLine: function(){
        this.xAuxLine.visible = false;
        this.yAuxLine.visible = false;
    },
    canvas: function() {  
        return this._canvas;
    },
    viewModeOn: function() {
        if(this.drawMode) {
            this.drawMode = false;
            this.hiddenXYLine();
            this._canvas.hoverCursor = 'move';
            this._canvas.renderAll();
        }
        if(this.editMode) {
            this.editMode = false;
        }
        this.unlockViewer();
    },
    editModeOn: function() {
        this.editMode = true;
        if(this.drawMode) {
            this.drawMode = false;
            this.hiddenXYLine();
            this._canvas.hoverCursor = 'move'; 
            this._canvas.renderAll();
            this.unlockViewer();
        }
        // else this.lockViewer();
    },
    drawModeOn: function(mode) {

        this.drawMode = true;
        this.drawRectangle = mode;

        if(this.editMode) {
            this.editMode = false;
            if(this.selectedBox) {
                this._canvas.discardActiveObject(this.selectedBox);
                this.selectedBox.set('strokeDashArray', [10, 2]);
                this.selectedBox = null;
                this._cbBoxSelected(undefined)
            }
        }
        this.lockViewer();
        this.showXYLine()
        
        this._canvas.hoverCursor = 'default';
        this._canvas.renderAll();
    },
    bringToFront: function() {
        if(this.selectedBox) {
            this._canvas.bringToFront(this.selectedBox);
            this._canvas.renderAll();
        }
    },
    sendToBack: function() {
        if(this.selectedBox) {
            this._canvas.sendToBack(this.selectedBox);
            this._canvas.renderAll();
        }
    },
    lockViewer: function() { // the viewer can not drag or scaling
        this._osdViewer.zoomPerScroll = 1;
        this._osdViewer.panHorizontal = false;
        this._osdViewer.panVertical = false;
    },
    unlockViewer: function() {
        this._osdViewer.zoomPerScroll = 2;
        this._osdViewer.panHorizontal = true;
        this._osdViewer.panVertical = true;
    },
    newLabelBoxRectangle: function(loc) {
        var color, stroke, classID
        if(this.selectedClass.id != null) {
            color = this.selectedClass.color + toHex(Math.round(this.opacityBox*255));
            stroke = this.selectedClass.color;
            classID = this.selectedClass.id;
        }
        else {
            color = 'rgba(160,160,160,'+this.opacityBox+')'
            stroke = 'rgba(80,80,80,1)'
            classID = null;
        }
        var boxConfig = {
            left: loc.left,
            top: loc.top,
            width: loc.width,
            height: loc.height,
            fill: color,
            opacity: this.opacityBox2,
            strokeWidth: 2,
            strokeDashArray: [8, 2],
            stroke: stroke,
            cornerColor: stroke,
            strokeUniform: true,
            _controlsVisibility:{
                mtr: false
            },
            tab: classID
        }
        return new LabelBoxRectangle(boxConfig);
    },
    newLabelBoxPolygon: function(points) {
        var color, stroke, classID
        if(this.selectedClass.id != null) {
            color = this.selectedClass.color + toHex(Math.round(this.opacityBox*255));
            stroke = this.selectedClass.color;
            classID = this.selectedClass.id;
        }
        else {
            color = 'rgba(160,160,160,'+this.opacityBox+')'
            stroke = 'rgba(80,80,80,1)'
            classID = null;
        }
        var config = {
            points: points,
            fill: color,
            opacity: this.opacityBox2,
            strokeWidth: 2,
            strokeDashArray: [8, 2],
            stroke: stroke,
            cornerColor: stroke,
            strokeUniform: true,
            _controlsVisibility:{
                mtr: false
            },
            tab: classID
        }
        return new LabelBoxPolygon(config);
    },
    addNewBox: function(labelBox) {
        this.labelBoxes[labelBox.id] = labelBox;
        this._canvas.add(labelBox.shape);/*
        if(Number.isInteger(labelBox.classID))
            this.updateLabelCount(labelBox.classID, true);*/
    },
    computeLocation: function(start, end) {
        return {
            left: Math.min(start.x, end.x),
            top: Math.min(start.y, end.y),
            width: Math.abs(start.x - end.x),
            height: Math.abs(start.y - end.y)
        };
    },
    toggleClassVisibility(classID,visible){
        for(var i in this.labelBoxes) {
            if(this.labelBoxes[i].classID === classID)this.labelBoxes[i].shape.set('visible', visible);
        }
        this._canvas.renderAll();
    },
    changePosition: function(lastPoint, currentPoint, offsetXDelta, offsetYDelta,deltaZoom) {
        var x, y, w, h, offsetX, offsetY
        for(var i in this.labelBoxes) {
            var box = this.labelBoxes[i];
            if(box.type == 'rect') {
                x = (box.shape.left - currentPoint.x) * deltaZoom + lastPoint.x + offsetXDelta;
                y = (box.shape.top - currentPoint.y) * deltaZoom + lastPoint.y + offsetYDelta;
                w = box.shape.width * deltaZoom;
                h = box.shape.height * deltaZoom;
                box.shape.set('left', x);
                box.shape.set('top', y);
                box.shape.set('width', w);
                box.shape.set('height', h);
            }
            else if(box.type == 'poly') {
                x = (box.shape.left - currentPoint.x + 1) * deltaZoom + lastPoint.x - 1 + offsetXDelta;
                y = (box.shape.top - currentPoint.y + 1) * deltaZoom + lastPoint.y - 1 + offsetYDelta;
                w = box.shape.width * deltaZoom;
                h = box.shape.height * deltaZoom;
                box.shape.set('left', x);
                box.shape.set('top', y);
                box.shape.set('width', w);
                box.shape.set('height', h);
                offsetX = box.shape.pathOffset.x * deltaZoom;
                offsetY = box.shape.pathOffset.y * deltaZoom;
                box.shape.set('pathOffset', {x: offsetX, y: offsetY});
                var points = box.shape.points;
                for(var j in points) {
                    points[j].x = points[j].x * deltaZoom;
                    points[j].y = points[j].y * deltaZoom;
                }
            }
        }
    },
    // if the mouse move out the canvas, update the point coordinate
    isPointOutCanvas: function(point) {
        return point.x < 0 || point.x > this._canvas.width || point.y < 0 || point.y > this._canvas.height;
    },
    limitPoint(point) {
        return {
            x: Math.min(Math.max(point.x, 0),this._canvas.width),
            y: Math.min(Math.max(point.y, 0),this._canvas.height)
        };
    },
    isBoxOutCanvas: function(box) {
        var lt = {x: box.left, y: box.top};
        var rb = {x: box.left+box.width, y: box.top+box.height};
        return this.isPointOutCanvas(lt) || this.isPointOutCanvas(rb);
    },
    limitBox(box) {
        var lt = {x: box.left, y: box.top};
        var rb = {x: box.left+box.width, y: box.top+box.height};
        if(this.isPointOutCanvas(lt)) {
            lt = this.limitPoint(lt);
            return {left: lt.x, top: lt.y, width: box.width, height: box.height};
        }
        if(this.isPointOutCanvas(rb)) {
            rb = this.limitPoint(rb);
            var left = rb.x - box.width;
            var top = rb.y - box.height;
            return {left: left, top: top, width: box.width, height: box.height};
        }
    },
    isRational: function(loc) {
        return !(loc.width < 2 || loc.height < 2)
    },
    removeAllBoxes: function() {
        var item;
        for(var i in this.labelBoxes) {
            item = this.labelBoxes[i];
            this._canvas.remove(item.shape)
        }
        this.labelBoxes = {};
        this.selectedBox = null;
        this._cbBoxSelected(undefined)
    },
    removeBox: function(id) {
        this._canvas.remove(this.labelBoxes[id].shape)
        delete this.labelBoxes[id];
    },
    removeSelected: function() {
        if(this.selectedBox) {
            this._canvas.remove(this.selectedBox);
            if(this.labelBoxes[this.selectedBox.tab]) {
                //var classID = this.labelBoxes[this.selectedBox.tab].classID;
                //this.updateLabelCount(classID, false);
                delete this.labelBoxes[this.selectedBox.tab];
            }
            if(this.hoveredBox) {
                if(this.hoveredBox.tab == this.selectedBox.tab) {
                    this.hoveredBox = null;
                }
            }
            this.selectedBox = null;
            this._cbBoxSelected(undefined)
        }
    },
    resize: function () {
            //this.lastZoom = this._osdViewer.viewport.getZoom(true);
            //this.lastCenter = this._osdViewer.viewport.getCenter(true);   
        this._canvas.setWidth(this._osdViewer.canvas.clientWidth);
        this._canvas.setHeight(this._osdViewer.canvas.clientHeight);
        this._canvas.calcOffset()
    },
    // *******************************************************
    // main operation
    // *******************************************************
    // label box
    updateBoxClass: function(id, classID) {
        //this.updateLabelCount(this.labelBoxes[id].classID, false);
        this.labelBoxes[id].classID = classID;
        //this.updateLabelCount(classID, true);
    },
    loadLabelBoxes: function(boxes) {
        this.removeAllBoxes();
        var classInfo, config
        for(var i in boxes) {
            var box = boxes[i];
            var classID = box.class;
            if(box.type == undefined || box.type == 'rect') {
                var x1 = box.x;
                var y1 = box.y;
                var w = box.w;
                var h = box.h;
                var x2 = x1 + w;
                var y2 = y1 + h;
                // image(slide) point to viewport(OSD)
                var vP1 = this._osdViewer.viewport.imageToViewportCoordinates(new OpenSeadragon.Point(x1,y1));
                var vP2 = this._osdViewer.viewport.imageToViewportCoordinates(new OpenSeadragon.Point(x2,y2));
                // viewport(OSD) point to pixel(Fabric)
                var fP1 = this._osdViewer.viewport.pixelFromPoint(vP1);
                var fP2 = this._osdViewer.viewport.pixelFromPoint(vP2);

                classInfo = this.getLabelClassInfo(classID);
                config = {
                    left: fP1.x,
                    top: fP1.y,
                    width: fP2.x - fP1.x,
                    height: fP2.y - fP1.y,
                    fill: classInfo.color + toHex(Math.round(this.opacityBox*255)),
                    opacity: this.opacityBox2,
                    strokeWidth: 2,
                    strokeDashArray: [8, 8],
                    stroke: classInfo.color,
                    cornerColor: classInfo.color,
                    strokeUniform: true,
                    _controlsVisibility:{
                        mtr: false
                    },
                    tab: classID
                }
                this.addNewBox(new LabelBoxRectangle(config));
            }
            else {
                var points = [];
                var vP, fP
                for(i in box.points) {
                    // image(slide) point to viewport(OSD)
                    vP = this._osdViewer.viewport.imageToViewportCoordinates(new OpenSeadragon.Point(box.points[i].x,box.points[i].y));
                    // viewport(OSD) point to pixel(Fabric)
                    fP = this._osdViewer.viewport.pixelFromPoint(vP);
                    points.push(fP);
                }
                classInfo = this.getLabelClassInfo(classID);
                config = {
                    points: points,
                    fill: classInfo.color + toHex(Math.round(this.opacityBox*255)),
                    opacity: this.opacityBox2,
                    strokeWidth: 2,
                    strokeDashArray: [8, 8],
                    stroke: classInfo.color,
                    cornerColor: classInfo.color,
                    strokeUniform: true,
                    _controlsVisibility:{
                        mtr: false
                    },
                    tab: classID
                }
                var boxPoly = new LabelBoxPolygon(config)
                this.addNewBox(boxPoly);
                this._changeEditMode(boxPoly.shape, boxPoly.shape.cornerColor);
            }
        }
        this.saveState = true;
    },
    saveLabelBoxes: function() {
        var boxes = [];
        var item, box, x1, y1, x2, y2, vP1, vP2, iP1, iP2, vP, iP
        for(var i in this.labelBoxes) {
            item = this.labelBoxes[i];
            if(item.type == 'rect') {
                // rectangle label box
                x1 = item.shape.left;
                y1 = item.shape.top;
                x2 = x1 + item.shape.width * item.shape.scaleX;
                y2 = y1 + item.shape.height * item.shape.scaleY;
                // viewport(OSD) point from pixel(Fabric)
                vP1 = this._osdViewer.viewport.pointFromPixel(new OpenSeadragon.Point(x1,y1));
                vP2 = this._osdViewer.viewport.pointFromPixel(new OpenSeadragon.Point(x2,y2));
                // image(slide) point from viewport(OSD)
                iP1 = this._osdViewer.viewport.viewportToImageCoordinates(vP1.x, vP1.y);
                iP2 = this._osdViewer.viewport.viewportToImageCoordinates(vP2.x, vP2.y);
                box = {
                    class: item.classID,
                    type: 'rect',
                    x: iP1.x,
                    y: iP1.y,
                    w: iP2.x - iP1.x,
                    h: iP2.y - iP1.y
                };
            }
            else {
                // polygon label box
                var fPs = [];
                for(i in item.shape.points) {
                    var point = fabric.util.transformPoint({
                        x: (item.shape.points[i].x - item.shape.pathOffset.x),
                        y: (item.shape.points[i].y - item.shape.pathOffset.y)
                        }, fabric.util.multiplyTransformMatrices(
                            item.shape.canvas.viewportTransform,
                            item.shape.calcTransformMatrix()
                        ));
                        fPs.push(point);
                }
                var points = [];
                for(i in fPs) {
                    // viewport(OSD) point from pixel(Fabric)
                    vP = this._osdViewer.viewport.pointFromPixel(new OpenSeadragon.Point(fPs[i].x, fPs[i].y));
                    // image(slide) point from viewport(OSD)
                    iP = this._osdViewer.viewport.viewportToImageCoordinates(vP.x, vP.y);
                    points.push(iP);
                }
                box = {
                    class: item.classID,
                    type: 'poly',
                    points: points
                };
            }
            boxes.push(box);
        }
        return boxes;
        /*
        $.post('/save_label_boxes', JSON.stringify(data), (result) => {
            alert(result);
            this.saveState = true;
            $('#slide_' + this.currentSlide + ' .slide-labeled-icon').removeAttr('hidden');
        });*/
    },
        // ********************************************************
        // controls api to enable change the shape of a polygon from fabricjs
        // http:// fabricjs.com/custom-controls-polygon
        // ********************************************************
        // define a function that can locate the controls.
        // this function will be used both for drawing and for interaction.
        _polygonPositionHandler: function(dim, finalMatrix, fabricObject) {
            var x = (fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x),
                y = (fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y);
            return fabric.util.transformPoint({
                    x: x,
                    y: y
                },
                fabric.util.multiplyTransformMatrices(
                    fabricObject.canvas.viewportTransform,
                    fabricObject.calcTransformMatrix()
                )
            );
        },
    
        // define a function that will define what the control does
        // this function will be called on every mouse move after a control has been
        // clicked and is being dragged.
        // The function receive as argument the mouse event, the current trasnform object
        // and the current position in canvas coordinate
        // transform.target is a reference to the current object being transformed,
        _actionHandler: function(eventData, transform, x, y) {
            var polygon = transform.target,
                currentControl = polygon.controls[polygon.__corner],
                mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center'),
                polygonBaseSize = polygon._getNonTransformedDimensions(),
                size = polygon._getTransformedDimensions(0, 0),
                finalPointPosition = {
                    x: mouseLocalPosition.x * polygonBaseSize.x / size.x + polygon.pathOffset.x,
                    y: mouseLocalPosition.y * polygonBaseSize.y / size.y + polygon.pathOffset.y
                };
            polygon.points[currentControl.pointIndex] = finalPointPosition; 
            
            return true;
        },
    
        // define a function that can keep the polygon in the same position when we change its
        // width/height/top/left.
        _anchorWrapper: function(anchorIndex, fn) {
            return (eventData, transform, x, y) => {
                this.lockViewer();
                var fabricObject = transform.target,
                    absolutePoint = fabric.util.transformPoint({
                        x: (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x),
                        y: (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y),
                    }, fabricObject.calcTransformMatrix()),
                    actionPerformed = fn(eventData, transform, x, y),
                    //newDim = fabricObject._setPositionDimensions({}),
                    polygonBaseSize = fabricObject._getNonTransformedDimensions(),
                    newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x,
                    newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y;
                fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
                return actionPerformed;
            }
        },
        _changeEditMode: function(polygon, cornerColor) {
            // clone what are you copying since you
            // may want copy and paste on different moment.
            // and you do not want the changes happened
            // later to reflect on the copy.
            polygon.edit = !polygon.edit;
            if (polygon.edit) {
                var lastControl = polygon.points.length - 1;
                polygon.cornerStyle = 'circle';
                polygon.cornerColor = cornerColor;
                polygon.controls = polygon.points.reduce((acc, point, index) => {
                    acc['p' + index] = new fabric.Control({
                        positionHandler: this._polygonPositionHandler,
                        actionHandler: this._anchorWrapper(index > 0 ? index - 1 : lastControl, this._actionHandler),
                        actionName: 'modifyPolygon',
                        pointIndex: index
                    });
                    return acc;
                }, {});
            } else {
                polygon.cornerColor = 'blue';
                polygon.cornerStyle = 'rect';
                polygon.controls = fabric.Object.prototype.controls;
            }
            polygon.hasBorders = !polygon.edit;
            this._canvas.requestRenderAll();
        }
    }
    
    export default LabelTool;
