import {fabric} from 'fabric';

fabric.Object.prototype.controls.rotateShape = new fabric.Control({
    x: 0,
    y: -0.5,
    cursorStyle: 'pointer',
    mouseDownHandler: function (ed, t) {
        console.log(t)
        t.target.canvas.fire('object:scaling', { target: t.target });
        var center = t.target.getCenterPoint()
        var ryOld = t.target.getRy()
        var rad = t.target.angle * (Math.PI / 180)
        t.target.sp = { x: center.x - Math.sin(rad) * ryOld, y: center.y + Math.cos(rad) * ryOld }
        return true
    },
    actionHandler: function (ed, t, x, y) {
        //var center = { x: this._startPoint.x + (point.x - this._startPoint.x) / 2, y: this._startPoint.y + (point.y - this._startPoint.y) / 2 }
        var center = t.target.getCenterPoint()
        var ryOld2 = t.target.getRy()
        t.target.left = t.target.sp.x + (x - t.target.sp.x) / 2
        t.target.top = t.target.sp.y + (y - t.target.sp.y) / 2
        var ry = len({ x, y }, center)
        t.target.scaleY = ry / t.target.ry
        t.target.scaleX = ry / ryOld2 * t.target.scaleX
        t.target.angle = Math.atan2(x - center.x, center.y - y) * (180 / Math.PI)
        return true
    },
    mouseUpHandler: function(ed, t){
        t.target.canvas.fire('object:modified', { target: t.target });
    },
    render: function(ctx, left, top, styleOverride, fabricObject){
        fabric.controlsUtils.renderCircleControl(ctx, left, top, {transparentCorners:false}, fabricObject)
    }
});

function toHex(d) {
    return  ("0"+(Number(d).toString(16))).slice(-2).toUpperCase()
}

function sqLen(p1,p2){
    const dx = (p1.x-p2.x)
    const dy = (p1.y-p2.y)
    return dx*dx+dy*dy
}
function len(p1,p2){
    return Math.sqrt(sqLen(p1,p2))
}


/**
 * OpenSeadragon canvas Overlay plugin based on svg overlay plugin and fabric.js
 * @version 0.0.2
 */
export default function($) {
    if (!$) {
        $ = require('openseadragon');
        if (!$) {
            throw new Error('OpenSeadragon is missing.');
        }
    }
    if (!$.version || ($.version.major <= 2 && $version.minor < 10)) {
        throw new Error('This version of OpenSeadragonScalebar requires ' +
                'OpenSeadragon version 2.1.0+');
    }

    /**
     * Adds fabric.js overlay capability to your OpenSeadragon Viewer
     *
     * @param {Object} options
     *     Allows configurable properties to be entirely specified by passing
     *     an options object to the constructor.
     *
     * @param {Number} options.scale
     *     Fabric 'virtual' canvas size, for creating objects
     *
     * @returns {Overlay}
     */
    $.Viewer.prototype.initFabricjsOverlay = function (cbBoxSelected) {
        if(!this.fabricjsOverlay) this.fabricjsOverlay = new Overlay(this,cbBoxSelected);
        else this.fabricjsOverlay.removeAllBoxes()
        return this.fabricjsOverlay
    };

    $.Viewer.prototype.seadragonToFabric = function(x,y){
        return this.viewport.pixelFromPoint(this.viewport.imageToViewportCoordinates(new $.Point(x,y)))
    }

    $.Viewer.prototype.fabricToSeadragon = function(x,y){
        return this.viewport.viewportToImageCoordinates(this.viewport.pointFromPixel(new $.Point(x,y)));
    }

    /**
     * Overlay object
     * @param viewer
     * @constructor
     */
    let Overlay = function (osd,cbBoxSelected) {
        // main components
        this._osdViewer = osd; // Openseadragon viewer
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
        this.drawEllipse = false;
        this.drawPoly = true;
    
       // auxiliary box, line, polygon
       this.auxBoxRectangle = null;
       this.auxBoxPolygon = null;
       this.auxLineToStart = null;
       this.auxLineToEnd = null;
       this.xAuxLine = null;
       this.YAuxLine = null;
       this.auxPoints = [];
    
       this.mouseDown = false;
    
       this.OPACITY_FILL = 0.02;
       this.OPACITY_STROKE = 0.8;
       this.STROKE_WIDTH = 2;

       this.defaultZoomPerScroll = undefined
        
        // label class
        this.selectedClass = {
            id: null,
            name: null,
            color: null
        }
        
        this.lastEllipseRatio = 0.5
        // label box for current slide

        this.saveState = true;
    
        this.tempBoxData = undefined
        this.labels = undefined
        this.init(cbBoxSelected)
    }
    
    Overlay.prototype = {
        init: function(cbBoxSelected) {
            this.updateLabelCount = ()=>{};
            this._cbBoxSelected = cbBoxSelected;
            this._fireChangeCallback = {};
            this.__loadLabelBoxes = [];
            this.initFabric();
            this.initAuxLine();
            this.initAuxBoxRectangle();
            this.initAuxBoxEllipse();
            this.initCusEvent();
            //this.initLabelClass();
            this.viewModeOn();
    
        },
        on(eventName,f){
            if(!$.isArray(eventName))eventName = [eventName]
            for(let en of eventName)
            if(en in this._fireChangeCallback)
                this._fireChangeCallback[en].push(f)
            else this._fireChangeCallback[en] = [f]
        },
        _fireChange: function(eventName,box){
            console.log('fire change',eventName,this._fireChangeCallback[eventName])
            Object.keys(this._fireChangeCallback).filter(evtName=>eventName.startsWith(evtName)).forEach(eventName=>{
                this._fireChangeCallback[eventName].forEach(f=>f(box))
            })
        },
        initFabric : function() {
    
            this._labelCanvas = document.createElement('canvas');
            this._osdViewer.canvas.appendChild(this._labelCanvas);
    
            this._canvas = new fabric.Canvas(this._labelCanvas)
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
            this.xAuxLine = new fabric.Line([0, 100, 9999, 100],{
                //stroke: this.selectedClass.color,
                stroke: 'rgb(100,100,100)',
                strokeDashArray: [5, 5],
                tab: 'aux',
                selectable : false,
                visible: false,
                cat:'sys'
            });
            this.yAuxLine = new fabric.Line([100, 0, 100, 9999],{
                //stroke: this.selectedClass.color,
                stroke: 'rgb(100,100,100)',
                strokeDashArray: [5, 5],
                tab: 'aux',
                selectable: false,
                visible: false,
                cat:'sys'
            });
    
            this.auxLineToStart = new fabric.Line([0, 0, 0, 0], {
                //stroke: this.selectedClass.color,
                stroke: 'rgb(100,100,100)',
                strokeDashArray: [5, 2],
                tab: 'aux',
                selectable : false,
                visible: false,
                cat:'sys'
            });
            this.auxLineToEnd = new fabric.Line([0, 0, 0, 0], {
                //stroke: this.selectedClass.color,
                stroke: 'rgb(100,100,100)',
                strokeDashArray: [5, 2],
                tab: 'aux',
                selectable : false,
                visible: false,
                cat:'sys'
            });
    
            this._canvas.add(this.xAuxLine);
            this._canvas.add(this.yAuxLine);
            this._canvas.add(this.auxLineToStart);
            this._canvas.add(this.auxLineToEnd);
        },
        initAuxBoxRectangle: function() {
            var rect = {
                left: 0,
                top: 0,
                width: 0,
                height: 0,
                opacity: this.OPACITY_STROKE,strokeWidth: this.STROKE_WIDTH,
                _controlsVisibility:{mtr: false},
                strokeUniform: true,
                visible:false,
                tab:'auxbox',
                cat:'sys'
            };
            
            this.auxBoxRectangle =  new fabric.Rect(rect)
            this._canvas.add(this.auxBoxRectangle);
            //this.updateBoxClass(this.auxBoxRectangle.get('tab'),this.selectedClass.id);
        },
        initAuxBoxEllipse: function() {
            this.auxBoxEllipse = new fabric.Ellipse({left: 0,top: 0,rx: 0,ry: 0,angle:0,
                opacity: this.OPACITY_STROKE,strokeWidth: this.STROKE_WIDTH,
                strokeUniform: true,originX:'center',originY:'center',
                _controlsVisibility:{mtr: false,tl: false,bl:false,tr:false,br:false,mt:false},
                tab:'auxbox',cat:'sys',visible:false});

            this._canvas.add(this.auxBoxEllipse);
            //this.updateBoxClass(this.auxBoxRectangle.get('tab'),this.selectedClass.id);
        },
        initAuxBoxPolygon: function(points) {
            /*
            var polygon = {
                points: points,
                fill: this.selectedClass.color + toHex(Math.round(this.OPACITY_FILL*255)),
                opacity: this.OPACITY_STROKE,
                strokeWidth: this.STROKE_WIDTH,
                stroke: this.selectedClass.color,
                strokeUniform: true,
                _controlsVisibility:{
                    mtr: false
                },
                tab: 'auxbox',
                selectable : false
            };*/
            this.auxBoxPolygon = this.newLabelBoxPolygon(points);
            //this.applyTheme(this.auxBoxPolygon)
            this._canvas.add(this.auxBoxPolygon);
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
                    else if(this.editMode){
                        if(e.target) {
                            // this.hiddenXYLine();
                            this.hoveredBox = e.target
                            e.target.opacity = 1;
                            if(!e.target.selectable && e.target.tab !== 'aux') {
                                e.target.selectable = true;
                            }
                            this._canvas.renderAll();
                        }
                    } else {
                        if(e.target) {
                            // this.hiddenXYLine();
                            if(e.target.selectable) {
                                e.target.selectable = false;
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
                            e.target.opacity = this.OPACITY_STROKE;
                            this.hoveredBox = null;
                            this._canvas.renderAll();
                        }
                    }
                },
                'mouse:down':(e) => {
            
                    if(this.drawMode) {
                        this.mouseDown = true;
                        if(this.drawRectangle) {
                            this.drawing = true;
                            this.startPoint = e.pointer;
                            this.applyTheme(this.auxBoxRectangle)
                            //this.auxBoxRectangle.set("fill", this.selectedClass.color + toHex(Math.round(this.OPACITY_FILL*255)),);
                            //this.auxBoxRectangle.set("stroke", this.selectedClass.color);
                        }
                        else if(this.drawPoly){
                            this.addPolyPoint(e.pointer);
                            //this._canvas.renderAll();
                        }
                        else if(this.drawEllipse){
                            this.drawing = true;
                            this.startPoint = e.pointer;
                            this.applyTheme(this.auxBoxEllipse)
                            //this._canvas.renderAll();
                        }
                    }
                    else if(e.target && e.target.selectable && this.editMode) {
                        if(this.selectedBox) this.selectedBox.set('strokeDashArray', [10, 2]);
                        e.target.set('strokeDashArray', [0, 0]);
                        this.selectedBox = e.target;
                        this._fireChange('select.'+this.selectedBox.cat,this.selectedBox)
                        this._fireChange('select',this.selectedBox.cat)
                        //this._cbBoxSelected(this.labelBoxes[this.selectedBox.get('tab')])
                        this._canvas.renderAll();
                        //this.editModeOn();
                    } else {
                        this.unselectBox()
                    }
                },
                'mouse:up':(e) => {
                    this.mouseDown = false;
                    // finish draw rect
                    var point, loc, newBox;
                    if(this.drawing && this.drawRectangle) {
                        this.auxBoxRectangle.set("visible", false);
                        point = e.pointer;
                        if(this.isPointOutCanvas(point))
                            point = this.limitPoint(point);
                        loc = this.computeLocation(this.startPoint, point);
    
                        if(this.isRational(loc)) {
                            newBox = this.newLabelBoxRectangle(loc);
                            this.addNewBox(newBox);
                            //this.drawModeOn(true);
                        }
                        this.drawing = false;
                        this.startPoint = null;
                    } else if(this.drawing && this.drawEllipse){
                        this.auxBoxEllipse.set("visible", false);
                        point = e.pointer;
                        if(this.isPointOutCanvas(point))
                            point = this.limitPoint(point);
                        loc = this.computeLocation(this.startPoint, point);
    
                        if(this.isRational(loc)) {
                            newBox = this.newLabelBoxEllipse({top:this.auxBoxEllipse.top,left:this.auxBoxEllipse.left,rx:this.auxBoxEllipse.rx,ry:this.auxBoxEllipse.ry,angle:this.auxBoxEllipse.angle});
                            this.addNewBox(newBox);
                            //this.drawModeOn(true);
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
                            var point
                            if(this.drawRectangle){
                                if(!this.startPoint) return;
                                if(this.startPoint) {
                                    point = e.pointer;
                                    if(this.isPointOutCanvas(point))
                                        point = this.limitPoint(point);
                                    var loc = this.computeLocation(this.startPoint, point);
                                    this.auxBoxRectangle.set("left", loc.left);
                                    this.auxBoxRectangle.set("top", loc.top);
                                    this.auxBoxRectangle.set("width", loc.width);
                                    this.auxBoxRectangle.set("height", loc.height);
                                    this.auxBoxRectangle.set("visible", true);
                                }
                            }
                            // draw ploygon box
                            else if(this.drawPoly){
                                if(!this.startPoint) return;
                                if(!this.endPoint) {
                                    this.auxLineToStart.set({'x1':this.startPoint.x, 'y1': this.startPoint.y});
                                    this.auxLineToStart.set({'x2':e.pointer.x, 'y2': e.pointer.y});
                                } else {
                                    this.auxLineToStart.set({'x1':this.startPoint.x, 'y1': this.startPoint.y});
                                    this.auxLineToStart.set({'x2':e.pointer.x, 'y2': e.pointer.y});
                                    this.auxLineToEnd.set({'x1':this.endPoint.x, 'y1': this.endPoint.y});
                                    this.auxLineToEnd.set({'x2':e.pointer.x, 'y2': e.pointer.y});
                                }
                                var newPoint = {x:e.pointer.x, y:e.pointer.y};
                                if(this.mouseDown && sqLen(newPoint,this.auxPoints[this.auxPoints.length-1])>350) this.addPolyPoint(newPoint)
                                this.endPolyDraw(newPoint);
                            } else if(this.drawEllipse){
                                if(!this.startPoint) return;
                                if(this.startPoint) {
                                    point = e.pointer;
                                    if(this.isPointOutCanvas(point))
                                        point = this.limitPoint(point);
                                    console.log(this.auxBoxEllipse.visible)
                                    var center = {x:this.startPoint.x+(point.x-this.startPoint.x)/2,y:this.startPoint.y+(point.y-this.startPoint.y)/2}
                                    this.auxBoxEllipse.set("left", center.x);
                                    this.auxBoxEllipse.set("top", center.y);
                                    var ry = len(point,center)
                                    this.auxBoxEllipse.set("ry", ry);
                                    this.auxBoxEllipse.set("rx", ry*this.lastEllipseRatio);
                                    this.auxBoxEllipse.set("angle", Math.atan2(point.x-this.startPoint.x, this.startPoint.y-point.y)* (180 / Math.PI));
                                    this.auxBoxEllipse.set("visible", true);
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
                    this.endPolyDraw()
                },
                'object:moving':() => {
                    this.lockViewer();
                    this.boxDrag = true;
                },
                'object:scaling':() => {
                    this.lockViewer();
                },
                'object:rotating':() => {
                    this.lockViewer();
                },
                'object:moved':() => {
                    this.boxDrag = false;
                },
                'object:scaled':() => {
                    // temporarily useless
                },
                'object:modified': (e) => {
                    if(e.target.get('type')==='ellipse'){
                        this.lastEllipseRatio = (e.target.rx*e.target.scaleX)/(e.target.ry*e.target.scaleY)
                        if(this.lastEllipseRatio>1)this.lastEllipseRatio = 1/this.lastEllipseRatio
                    }
                    this.unlockViewer();
                    this._fireChange('updated.'+e.target.cat,e.target)
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
                    window.dispatchEvent(new Event('resize'));
                    //this._osdViewer.viewport.zoomTo(2, null, true);
                    this._osdViewer.viewport.zoomTo(1, null, true);
                    this._osdViewer.viewport.applyConstraints();
            });
            /*
            this._osdViewer.addHandler('open',()=>{
                    //window.dispatchEvent(new Event('resize'));
                    //this._osdViewer.viewport.zoomTo(2, null, true);
                    //this._osdViewer.viewport.applyConstraints();
                    this.lockViewer();
    
                    this.lastZoom = this._osdViewer.viewport.getZoom(true);
                    this.lastCenter = this._osdViewer.viewport.getCenter(true)
                    this.lastSize = this._osdViewer.viewport.getContainerSize()
                    this.loadLabelBoxes(this.tempBoxData)
                    this.tempBoxData = undefined;
                    this.unlockViewer();
            });*/
            this._osdViewer.addHandler('close', () => {
                this.removeAllBoxes()
            });
            this._osdViewer.addHandler('viewport-change', () => {
                if(this.__loadLabelBoxes.length>0){
                    this.lockViewer();
                    this.lastZoom = this._osdViewer.viewport.getZoom(true);
                    this.lastCenter = this._osdViewer.viewport.getCenter(true)
                    this.lastSize = this._osdViewer.viewport.getContainerSize()
                    this.__loadLabelBoxes.forEach(f=>f())
                    this.__loadLabelBoxes = [];
                    this.unlockViewer();
                    this._fireChange('loading.end',undefined)
    
                }
                this.resize()
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
        endPolyDraw: function(auto){
            if(this.drawMode && this.drawing && this.drawPoly) {
                if(this.auxPoints.length < 3) return;
                if(auto){
                    var d = sqLen(this.auxBoxPolygon.points[0],auto)
                    if(d>150) return;
                }
                //this.auxPoints.splice(this.auxPoints.length-1,1);
                var newPoints = []
    
                JSON.parse(JSON.stringify(this.auxPoints));
                
                for(var i in this.auxBoxPolygon.points) {
                    var point = fabric.util.transformPoint({
                        x: (this.auxBoxPolygon.points[i].x  - this.auxBoxPolygon.pathOffset.x),
                        y: (this.auxBoxPolygon.points[i].y  - this.auxBoxPolygon.pathOffset.y)
                        }, fabric.util.multiplyTransformMatrices(
                            this.auxBoxPolygon.canvas.viewportTransform,
                            this.auxBoxPolygon.calcTransformMatrix()
                        ));
                    newPoints.push(point);
                }
                var newBox = this.newLabelBoxPolygon(newPoints);
                console.log(newBox)
                this._canvas.remove(this.auxBoxPolygon);
                this.auxBoxPolygon = null;
                this.auxPoints = [];
                this.auxLineToStart.visible = false;
                this.auxLineToEnd.visible = false;
                this.startPoint = null;
                this.endPoint = null;
                
                this.addNewBox(newBox);
                this._changeEditMode(newBox, newBox.cornerColor);
                this._canvas.setActiveObject(newBox);
                this.selectedBox = newBox;
                this._canvas.requestRenderAll();
                //this.editModeOn();
                //this.drawModeOn(false);
    
                this.drawing = false;
            }
        },
        addPolyPoint: function(newPoint){
            newPoint = {x:newPoint.x,y:newPoint.y}
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
        },
        initLabelClass: function() {
            this.getLabelClasses();
        },/*
        changeLabel: function(selectedClass){
            this.selectedClass = selectedClass;
            if(this.selectedBox) {
                this.selectedBox.set('fill', this.selectedClass.color + toHex(Math.round(this.OPACITY_FILL*255)));
                this.selectedBox.set('stroke', this.selectedClass.color);
                this.selectedBox.set('cornerColor', this.selectedClass.color);
                this._canvas.renderAll();
                this.updateBoxClass(this.selectedBox.get('tab'),this.selectedClass.id);
            }
        },*/
        setTheme: function(cat,objTheme){
            this.endPolyDraw()
            const theme = this.cleanupTheme(objTheme)
            theme.cat=cat
        
            this.currentTheme = theme;
            this._fireChange('change.category',cat)
            let catSeletected = this.selectedBox?.get('cat')
            if(catSeletected && catSeletected===cat) {
                this.applyTheme(this.selectedBox)
                this._canvas.renderAll();
                this._fireChange('change.theme.'+cat,this.selectedBox)
                //this.updateBoxClass(this.selectedBox.get('tab'),this.selectedClass.id);
            }

        },
        applyTheme(objFab){
            Object.keys(this.currentTheme).forEach(k=>objFab.set(k,this.currentTheme[k]))
            if(objFab.tab==='auxbox') objFab.cat = 'sys'
        },
        cleanupTheme(objTheme){
            const theme = Object.assign({},objTheme);
            if(!theme.color)theme.color='#000000'
            if(!theme.fill)theme.fill=theme.color + toHex(Math.round(this.OPACITY_FILL*255))
            if(!theme.cornerColor)theme.cornerColor=theme.color
            if(!theme.stroke)theme.stroke=theme.color
            delete theme.color
            return theme
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
            this.endPolyDraw()
            if(this.selectedBox) {
                this._canvas.discardActiveObject(this.selectedBox);
                this.selectedBox.set('strokeDashArray', [10, 2]);
                this.selectedBox = null;
                this._cbBoxSelected(undefined)
            }
            if(this.drawMode) {
                this.drawMode = false;
                this.hiddenXYLine();
            }
            this.editMode = false;
            this._canvas.hoverCursor = 'default';
            this._canvas.renderAll();
            this.unlockViewer();
        },
        editModeOn: function() {
            this.endPolyDraw()
            if(!this.editMode) {
                //Object.values(this.labelBoxes).forEach((object)=>{ object.set('selectable', true);object.evented = true; });
                this.editMode = true;
                this._canvas.hoverCursor = 'move'; 
                if(this.drawMode) {
                    this.drawMode = false;
                    this.hiddenXYLine();
                    this._canvas.renderAll();
                    this.unlockViewer();
                }
            }
            // else this.lockViewer();
        },
        drawModeOn: function(mode) {
            this.endPolyDraw()
    
            this.drawMode = true;
            this.drawRectangle = mode==='rect';
            this.drawEllipse = mode==='ellipse';
            this.drawPoly = mode==='poly';
    
            if(this.editMode) {
                this.editMode = false;
                this.unselectBox();
            }
            this.lockViewer();
            this.showXYLine()
            
            this._canvas.hoverCursor = 'default';
            this._canvas.renderAll();
        },
        unselectBox(){
            if(this.selectedBox) {
                this._canvas.discardActiveObject(this.selectedBox);
                this.selectedBox.set('strokeDashArray', [10, 2]);
                this._fireChange('unselect.'+this.selectedBox.cat,this.selectedBox)
                this._fireChange('unselect',this.selectedBox.cat)
                this.selectedBox = null;
            }
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
            if(!this.defaultZoomPerScroll)this.defaultZoomPerScroll = this._osdViewer.zoomPerScroll
            this._osdViewer.zoomPerScroll = 1;
            this._osdViewer.panHorizontal = false;
            this._osdViewer.panVertical = false;
        },
        unlockViewer: function() {
            if(!this.defaultZoomPerScroll)this.defaultZoomPerScroll = this._osdViewer.zoomPerScroll
            this._osdViewer.zoomPerScroll = this.defaultZoomPerScroll;
            this._osdViewer.panHorizontal = true;
            this._osdViewer.panVertical = true;
        },
        newLabelBoxRectangle: function(loc) {
            return new fabric.Rect(Object.assign({opacity: this.OPACITY_STROKE,strokeWidth: this.STROKE_WIDTH,
                                                strokeDashArray: [8, 2],strokeUniform: true,
                                                _controlsVisibility:{mtr: false,rotateShape:false},
                                                anchorViewport:'osd'},this.currentTheme,loc));
        },
        newLabelBoxEllipse: function(loc) {
            console.log(loc)
            return new fabric.Ellipse(Object.assign({opacity: this.OPACITY_STROKE,strokeWidth: this.STROKE_WIDTH,
                                                strokeDashArray: [8, 2],strokeUniform: true,
                                                originX:'center',originY:'center',anchorViewport:'osd',
                                                _controlsVisibility:{mtr: false,tl: false,bl:false,tr:false,br:false,mt:false}}
                                                ,this.currentTheme,loc));
        },
        newLabelBoxPolygon: function(points) {
            return new fabric.Polygon(points,Object.assign({opacity: this.OPACITY_STROKE,strokeWidth: this.STROKE_WIDTH,
                                                strokeDashArray: [8, 2],strokeUniform: true,anchorViewport:'osd',
                                                _controlsVisibility:{mtr: false,rotateShape:false}}
                                                ,this.currentTheme));
        },
        addNewBox: function(labelBox) {
            this._canvas.add(labelBox);
            this._fireChange('created.'+labelBox.cat,labelBox)
            //this.updateLabelCount(labelBox.classID, true);
        },
        removeBox: function(labelBox) {
            this._canvas.remove(labelBox);
            this._fireChange('removed.'+labelBox.cat,labelBox)
        },
        computeLocation: function(start, end) {
            return {
                left: Math.min(start.x, end.x),
                top: Math.min(start.y, end.y),
                width: Math.abs(start.x - end.x),
                height: Math.abs(start.y - end.y)
            };
        },
        toggleClassVisibility(cat,fnFilter,visible){
            this._canvas.getObjects().filter(obj => (obj.cat === cat && fnFilter(obj))).forEach(obj=>{
                obj.set('visible', visible);
                if(obj === this.selectedBox) this.unselectBox();
            })
            this._canvas.renderAll();
        },
        changePosition: function(lastPoint, currentPoint, offsetXDelta, offsetYDelta,deltaZoom) {
            var x, y, w, h, offsetX, offsetY
            this._canvas.getObjects().filter(obj => obj.anchorViewport==='osd').forEach(obj=>{
                if(obj.type === 'rect'){
                    x = (obj.left - currentPoint.x) * deltaZoom + lastPoint.x + offsetXDelta;
                    y = (obj.top - currentPoint.y) * deltaZoom + lastPoint.y + offsetYDelta;
                    w = obj.width * deltaZoom;
                    h = obj.height * deltaZoom;
                    obj.set('left', x);
                    obj.set('top', y);
                    obj.set('width', w);
                    obj.set('height', h);
                } else if(obj.type == 'polygon'){
                    x = (obj.left - currentPoint.x + 1) * deltaZoom + lastPoint.x - 1 + offsetXDelta;
                    y = (obj.top - currentPoint.y + 1) * deltaZoom + lastPoint.y - 1 + offsetYDelta;
                    w = obj.width * deltaZoom;
                    h = obj.height * deltaZoom;
                    obj.set('left', x);
                    obj.set('top', y);
                    obj.set('width', w);
                    obj.set('height', h);
                    offsetX = obj.pathOffset.x * deltaZoom;
                    offsetY = obj.pathOffset.y * deltaZoom;
                    obj.set('pathOffset', {x: offsetX, y: offsetY});
                    var points = obj.points;
                    for(var j in points) {
                        points[j].x = points[j].x * deltaZoom;
                        points[j].y = points[j].y * deltaZoom;
                    }
                } else if(obj.type == 'ellipse') {
                    x = (obj.left - currentPoint.x) * deltaZoom + lastPoint.x + offsetXDelta;
                    y = (obj.top - currentPoint.y) * deltaZoom + lastPoint.y + offsetYDelta;
                    w = obj.rx * deltaZoom;
                    h = obj.ry * deltaZoom;
                    obj.set('left', x);
                    obj.set('top', y);
                    obj.set('rx', w);
                    obj.set('ry', h);
                }

            })
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
        removeAllBoxes: function(cat) {
            if(!cat) this._canvas.getObjects().filter(b=>b.cat!=='sys').forEach(b=>this.removeBox(b))
            else this._canvas.getObjects().filter(b=>b.cat===cat).forEach(b=>this.removeBox(b))
            //this.labelBoxes = {};
            if(this.selectedBox?.cat === cat) this.unselectBox();
            //this._cbBoxSelected(undefined)
        },
        removeSelected: function() {
            if(this.selectedBox) {
                if(this.hoveredBox == this.selectedBox) {
                    this.hoveredBox = null;
                }
                this.removeBox(this.selectedBox);/*
                if(this.labelBoxes[this.selectedBox.tab]) {
                    //var classID = this.labelBoxes[this.selectedBox.tab].classID;
                    this.updateLabelCount(this.labelBoxes[this.selectedBox.tab].classID, false);
                    delete this.labelBoxes[this.selectedBox.tab];
                }*/
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
        },
        // *******************************************************
        // main operation
        // *******************************************************
        getBox(cat){
            return this._canvas.getObjects().filter(b=>b.cat === cat)
        },
        loadLabelBoxes: function(boxes,themeFunc){
            this.__loadLabelBoxes.push(()=>this._loadLabelBoxes(boxes,themeFunc))
        },
        _loadLabelBoxes: function(boxes,themeFunc) {
            //console.log('_loadLabelBoxes',boxes,themeFunc)
            for(var box of boxes) {
                //console.log(box)
                if(box.type == undefined || box.type == 'rect') {
                    const fP1 = this._osdViewer.seadragonToFabric(box.x,box.y)
                    const fP2 = this._osdViewer.seadragonToFabric(box.x+box.w,box.y+box.h)
                    this.addNewBox(new fabric.Rect(Object.assign({opacity: this.OPACITY_STROKE,strokeWidth: this.STROKE_WIDTH,
                                                                strokeDashArray: [8, 8],strokeUniform: true,
                                                                _controlsVisibility:{mtr: false,rotateShape:false},
                                                                anchorViewport:'osd'},this.cleanupTheme(themeFunc(box)),
                                                                {left: fP1.x,top: fP1.y,width: fP2.x-fP1.x,height: fP2.y-fP1.y})));
                } else if(box.type == 'poly'){
                    var points = box.points.map(p=>{
                        let p2 = this._osdViewer.seadragonToFabric(p.x,p.y)
                        return {x:p2.x,y:p2.y}
                    });
                    let config = Object.assign({opacity: this.OPACITY_STROKE,strokeWidth: this.STROKE_WIDTH,
                        strokeDashArray: [8, 8],strokeUniform: true,anchorViewport:'osd',
                        _controlsVisibility:{mtr: false,rotateShape:false}}
                        ,this.cleanupTheme(themeFunc(box)))
                    //console.log(config)
                    
                    var boxPoly = new fabric.Polygon(points,config);
                    
                    this._changeEditMode(boxPoly, boxPoly.cornerColor);
                    this.addNewBox(boxPoly);
                }else if(box.type == 'ellipse') {
                    const fP1 = this._osdViewer.seadragonToFabric(box.x,box.y);
                    const fP2 = this._osdViewer.seadragonToFabric(box.x+box.rx,box.y+box.ry);
                    
                    this.addNewBox(new fabric.Ellipse(Object.assign({opacity: this.OPACITY_STROKE,strokeWidth: this.STROKE_WIDTH,
                                strokeDashArray: [8, 2],strokeUniform: true,
                                originX:'center',originY:'center',anchorViewport:'osd',
                                _controlsVisibility:{mtr: false,tl: false,bl:false,tr:false,br:false,mt:false}}
                                ,this.cleanupTheme(themeFunc(box))
                                ,{left: fP1.x,top: fP1.y,rx: fP2.x-fP1.x,ry: fP2.y-fP1.y,angle: box.a})));
                    
                }
            }
            this.saveState = true;
            //console.log(this)
        },
        convertItemInAnnotation: function(item,fnAddedElement){
            if(!fnAddedElement)fnAddedElement=()=>({})
            var box, x1, y1, x2, y2, iP1, iP2;
            if(item.type == 'rect') {
                // rectangle label box
                iP1 = this._osdViewer.fabricToSeadragon(item.left,item.top)
                iP2 = this._osdViewer.fabricToSeadragon(item.left + item.width * item.scaleX,item.top + item.height * item.scaleY)
                box = Object.assign({
                    type: 'rect',
                    x: iP1.x,
                    y: iP1.y,
                    w: iP2.x - iP1.x,
                    h: iP2.y - iP1.y
                },fnAddedElement(item));
            }
            else if(item.type == 'polygon'){
                // polygon label box
                var points = item.points.map(p => {
                    p = fabric.util.transformPoint({
                        x: (p.x - item.pathOffset.x),
                        y: (p.y - item.pathOffset.y)
                        }, fabric.util.multiplyTransformMatrices(
                            item.canvas.viewportTransform,
                            item.calcTransformMatrix()
                        ));
                    return this._osdViewer.fabricToSeadragon(p.x, p.y)
                })
                box = Object.assign({
                    type: 'poly',
                    points: points
                },fnAddedElement(item));
            } else if(item.type == 'ellipse') {
                // rectangle label box
                iP1 = this._osdViewer.fabricToSeadragon(item.left,item.top)
                iP2 = this._osdViewer.fabricToSeadragon(item.left+Math.abs(item.rx * item.scaleX),item.top+Math.abs(item.ry * item.scaleY))
                box = Object.assign({
                    type: 'ellipse',
                    x: iP1.x,
                    y: iP1.y,
                    rx: iP2.x-iP1.x,
                    ry: iP2.y-iP1.y,
                    a: item.angle
                },fnAddedElement(item));
            }
            return box
        },
        saveLabelBoxes: function(cat,fnAddedElement) {
            return this.getBox(cat).map(b=>this.convertItemInAnnotation(b,fnAddedElement));
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
    }
