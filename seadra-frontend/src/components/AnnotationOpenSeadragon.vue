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
    import {LabelBoxRectangle, LabelBoxPolygon} from './label-box'
    export default {
        data: () => ({ 
            selected_tool: undefined,
            selectedClass: {
                id: 0,
                name: 'TEST',
                color: '#c24246'
            },
            labelBoxes: {}
        }),
        computed: mapState(['viewerOSD']),
        watch: {
            // whenever question changes, this function will run
            
            selected_tool(newSlected, oldSelected) {
                console.log(newSlected,oldSelected);
                if(newSlected==="fabric-rect"){
                    this.drawModeOn(true)
                } else if(newSlected==="fabric-polygon") {
                    this.drawModeOn(false)
                } else if(newSlected==="delete"){
                    this.removeSelected();
                } else if(newSlected==="send-front"){
                    this.bringToFront();
                } else if(newSlected==="send-back"){
                    this.sendToBack();
                }
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

                    this.initAuxLine();
                    this.initAuxBoxRectangle();
                    this.initCusEvent()
//                    this.initLabelClass();
                    this.viewModeOn();
                    this.resize()
                }
            }
        },
        methods: {
            initAuxLine() {
                this.xAuxLine = new fabric.Line([0, 100, this._canvas.width, 100],{
                    stroke: 'rgb(100,100,100)',
                    strokeDashArray: [5, 5],
                    tab: 'aux',
                    selectable : false,
                    visible: false
                });
                this.yAuxLine = new fabric.Line([100, 0, 100, this._canvas.height],{
                    stroke: 'rgb(100,100,100)',
                    strokeDashArray: [5, 5],
                    tab: 'aux',
                    selectable: false,
                    visible: false
                });

                this.auxLineToStart = new fabric.Line([0, 0, 0, 0], {
                    stroke: 'rgb(100,100,100)',
                    strokeDashArray: [5, 5],
                    tab: 'aux',
                    selectable : false,
                    visible: false
                });
                this.auxLineToEnd = new fabric.Line([0, 0, 0, 0], {
                    stroke: 'rgb(100,100,100)',
                    strokeDashArray: [5, 5],
                    tab: 'aux',
                    selectable : false,
                    visible: false
                });

                this._canvas.add(this.xAuxLine);
                this._canvas.add(this.yAuxLine);
                this._canvas.add(this.auxLineToStart);
                this._canvas.add(this.auxLineToEnd);
            },
            initAuxBoxRectangle() {
                var rect = {
                    left: 0,
                    top: 0,
                    width: 0,
                    height: 0,
                    fill: 'rgba(160,160,160,0.4)',
                    opacity: 0.5,
                    visible: false,
                    strokeWidth: 2,
                    stroke: 'rgba(80,80,80,1)',// "#880E4F",
                    strokeUniform: true,
                    _controlsVisibility:{
                        mtr: false
                    },
                    tab: 'auxbox'
                };
                this.auxBoxRectangle = new LabelBoxRectangle(rect);
                this._canvas.add(this.auxBoxRectangle.shape);
            },
            initAuxBoxPolygon(points) {
                var polygon = {
                    points: points,
                    fill: 'rgba(160,160,160,0.4)',
                    opacity: 0.5,
                    strokeWidth: 2,
                    stroke: 'rgba(80,80,80,1)',// "#880E4F",
                    strokeUniform: true,
                    _controlsVisibility:{
                        mtr: false
                    },
                    tab: 'auxbox',
                    selectable : false
                };
                this.auxBoxPolygon = new LabelBoxPolygon(polygon);
                this._canvas.add(this.auxBoxPolygon.shape);
            },
            bringToFront() {
                if(this.selectedBox) {
                    this._canvas.bringToFront(this.selectedBox);
                    this._canvas.renderAll();
                }
            },
            sendToBack() {
                if(this.selectedBox) {
                    this._canvas.sendToBack(this.selectedBox);
                    this._canvas.renderAll();
                }
            },
            lockViewer() { // the viewer can not drag or scaling
                this.viewerOSD.zoomPerScroll = 1;
                this.viewerOSD.panHorizontal = false;
                this.viewerOSD.panVertical = false;
            },
            unlockViewer() {
                this.viewerOSD.zoomPerScroll = 2;
                this.viewerOSD.panHorizontal = true;
                this.viewerOSD.panVertical = true;
            },
            newLabelBoxRectangle(loc) {
                var color, stroke, classID
                if(this.selectedClass.id != null) {
                    color = this.selectedClass.color + '66';
                    stroke = this.selectedClass.color;
                    classID = this.selectedClass.id;
                }
                else {
                    color = 'rgba(160,160,160,0.4)'
                    stroke = 'rgba(80,80,80,1)'
                    classID = null;
                }
                var boxConfig = {
                    left: loc.left,
                    top: loc.top,
                    width: loc.width,
                    height: loc.height,
                    fill: color,
                    opacity: 0.5,
                    strokeWidth: 2,
                    strokeDashArray: [8, 8],
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
            newLabelBoxPolygon(points) {
                var color, stroke, classID
                if(this.selectedClass.id != null) {
                    color = this.selectedClass.color + '66';
                    stroke = this.selectedClass.color;
                    classID = this.selectedClass.id;
                }
                else {
                    color = 'rgba(160,160,160,0.4)'
                    stroke = 'rgba(80,80,80,1)'
                    classID = null;
                }
                var config = {
                    points: points,
                    fill: color,
                    opacity: 0.5,
                    strokeWidth: 2,
                    strokeDashArray: [8, 8],
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
            addNewBox(labelBox) {
                this.labelBoxes[labelBox.id] = labelBox;
                this._canvas.add(labelBox.shape);
                ///TODO
                /*if(Number.isInteger(labelBox.classID))
                    this.updateLabelCount(labelBox.classID, true);*/
            },
            computeLocation(start, end) {
                return {
                    left: Math.min(start.x, end.x),
                    top: Math.min(start.y, end.y),
                    width: Math.abs(start.x - end.x),
                    height: Math.abs(start.y - end.y)
                };
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
            // if the mouse move out the canvas, update the point coordinate
            isPointOutCanvas(point) {
                return point.x < 0 || point.x > this._canvas.width || point.y < 0 || point.y > this._canvas.height;
            },
            limitPoint(point) {
                return {
                    x: Math.min(Math.max(point.x, 0),this._canvas.width),
                    y: Math.min(Math.max(point.y, 0),this._canvas.height)
                };
            },
            isBoxOutCanvas(box) {
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
            isRational(loc) {
                return !(loc.width < 2 || loc.height < 2)
            },
            removeAllBoxes() {
                var item
                for(var i in this.labelBoxes) {
                    item = this.labelBoxes[i];
                    this._canvas.remove(item.shape)
                }
                this.labelBoxes = {};
                this.selectedBox = null;
            },
            removeBox(id) {
                this._canvas.remove(this.labelBoxes[id].shape)
                delete this.labelBoxes[id];
            },
            removeSelected() {
                if(this.selectedBox) {
                    this._canvas.remove(this.selectedBox);
                    if(this.labelBoxes[this.selectedBox.tab]) {
                        var classID = this.labelBoxes[this.selectedBox.tab].classID;
                        this.updateLabelCount(classID, false);
                        delete this.labelBoxes[this.selectedBox.tab];
                    }
                    if(this.hoveredBox) {
                        if(this.hoveredBox.tab == this.selectedBox.tab) {
                            this.hoveredBox = null;
                        }
                    }
                    this.selectedBox = null;
                }
            },
            showXYLine(){
                if((!this.hoveredBox || this.drawMode)&& !this.mouseOut) {
                    this.xAuxLine.visible = true;
                    this.yAuxLine.visible = true;
                    if(this.hoveredBox && this.hoveredBox.tab != 'aux') {
                        this.hoveredBox.set('selectable', false);
                    }
                }
            },
            hiddenXYLine(){
                this.xAuxLine.visible = false;
                this.yAuxLine.visible = false;
            },
            viewModeOn() {
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
            editModeOn() {
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
            drawModeOn(mode) {
                this.drawMode = true;
                this.drawRectangle = mode;

                if(this.editMode) {
                    this.editMode = false;
                    if(this.selectedBox) {
                        this._canvas.discardActiveObject(this.selectedBox);
                        this.selectedBox.set('strokeDashArray', [10, 10]);
                        this.selectedBox = null;
                    }
                }
                this.lockViewer();
                this.showXYLine()
                
                this._canvas.hoverCursor = 'default';
                this._canvas.renderAll();
            },
            // ********************************************************
            // controls api to enable change the shape of a polygon from fabricjs
            // http:// fabricjs.com/custom-controls-polygon
            // ********************************************************
            // define a function that can locate the controls.
            // this function will be used both for drawing and for interaction.
            
        
            // define a function that will define what the control does
            // this function will be called on every mouse move after a control has been
            // clicked and is being dragged.
            // The function receive as argument the mouse event, the current trasnform object
            // and the current position in canvas coordinate
            // transform.target is a reference to the current object being transformed,
            _actionHandler(eventData, transform, x, y) {
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
            _anchorWrapper(anchorIndex, fn) {
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
                var _polygonPositionHandler = function(dim, finalMatrix, fabricObject) {
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
            }
                polygon.edit = !polygon.edit;
                if (polygon.edit) {
                    var lastControl = polygon.points.length - 1;
                    polygon.cornerStyle = 'circle';
                    polygon.cornerColor = cornerColor;
                    polygon.controls = polygon.points.reduce((acc, point, index) => {
                        acc['p' + index] = new fabric.Control({
                            positionHandler: _polygonPositionHandler,
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
            },
            resize(){
                this._canvas.setWidth(this.viewerOSD.canvas.clientWidth);
                this._canvas.setHeight(this.viewerOSD.canvas.clientHeight);
            },
            initCusEvent() {
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
                                e.target.opacity = 0.5;
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
                            if(this.selectedBox) this.selectedBox.set('strokeDashArray', [10, 10]);
                            e.target.set('strokeDashArray', [0, 0]);
                            this.selectedBox = e.target;
                            this._canvas.renderAll();
                            this.editModeOn();
                        }
                        else {
                            if(this.selectedBox) {
                                this.selectedBox.set('strokeDashArray', [10, 10]);
                                this._canvas.renderAll();
                                this.selectedBox = null;
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
                                            this._canvas.setActiveObject(newBox.shape);
                                            this.selectedBox = newBox.shape;
                                            this.editModeOn();
                                        }
                                        this.drawing = false;
                                        this.startPoint = null;
                                    } else if(this.boxDrag){
                                        this.boxDrag = false
                                    }
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
                            this.selectedBox = newBox.shape;
                            this._canvas.requestRenderAll();
                            this.editModeOn();

                            this.drawing = false;
                            this.saveState = false;
                        } 
                    },
                    'object:moving':() => {
                        this.lockViewer();
                        this.boxDrag = true;
                        console.log('moving')
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
                })
                this.viewerOSD.addHandler('canvas-press', (e) => {
                    this.lastCenter = this.viewerOSD.viewport.getCenter(true);
                    this._canvas._onMouseDown(e.originalEvent);
                    e.originalEvent.stopPropagation();
                }); 
                this.viewerOSD.addHandler('canvas-release', (e) => {
                    this._canvas._onMouseUp(e.originalEvent)
                });     
                this.viewerOSD.addHandler('canvas-click', (e) => {
                    e.preventDefaultAction = true;
                });     
                this.viewerOSD.addHandler('canvas-drag', (e) => {
                    this._canvas._onMouseMove(e.originalEvent)
                });
                this.viewerOSD.addHandler('zoom', () => {
                    this.lastZoom = this.viewerOSD.viewport.getZoom(true);
                    this.lastCenter = this.viewerOSD.viewport.getCenter(true);   
                });
                this.viewerOSD.addHandler('viewport-change', () => {
                    if(!this.lastZoom)
                        this.lastZoom = this.viewerOSD.viewport.getZoom(true);
                    if(!this.lastCenter)
                        this.lastCenter = this.viewerOSD.viewport.getCenter(true);
                    var currentZoom = this.viewerOSD.viewport.getZoom(true);
                    var deltaZoom = currentZoom/this.lastZoom
                    var currentCenter = this.viewerOSD.viewport.getCenter(true);
                    var lastWinCenter = this.viewerOSD.viewport.pixelFromPoint(this.lastCenter);
                    var currentWinCenter = this.viewerOSD.viewport.pixelFromPoint(currentCenter);    

                    this.changePosition(lastWinCenter, currentWinCenter, deltaZoom);
                    this._canvas.renderAll();
                    this._canvas.setViewportTransform(this._canvas.viewportTransform);
                    this.lastZoom = currentZoom;
                    this.lastCenter = currentCenter;
                });
                this.viewerOSD.addHandler('canvas-scroll', () => {
                    // temporarily useless
                });
                this.viewerOSD.addHandler('canvas-enter', () => {
                    this.mouseOut = false;
                    if(this.drawMode) this.showXYLine();
                    this._canvas.renderAll();
                })
                this.viewerOSD.addHandler('canvas-exit', () => {
                    this.mouseOut = true;
                    if(this.drawMode) this.hiddenXYLine()
                    this._canvas.renderAll();
                })
            }
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
        },
        unmounted() {
            window.removeEventListener('resize', this.resize);
        },
  }
</script>
