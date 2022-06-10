import { fabric } from 'fabric'

function guid() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    //return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
}

function LabelBoxRectangle(config) {
    this.id = guid();
    this.classID = null;
    this.shape = this.init(config);
    this.type = 'rect';
}
LabelBoxRectangle.prototype = {
    init: function(config) {
        this.classID = config.tab;
        config.tab = this.id;
        return new fabric.Rect(config); 
    },
    set: function(key, value) {
        this.shape.set(key, value);
    }
}

function LabelBoxPolygon(config) {
    this.id = guid();
    this.classID = null;
    this.shape = this.init(config);
    this.type = 'poly';
}
LabelBoxPolygon.prototype = {
    init: function(config) {
        this.classID = config.tab;
        config.tab = this.id;
        return new fabric.Polygon(config.points, config); 
    },
    set: function(key, value) {
        this.shape.set(key, value);
    }
}

export {LabelBoxRectangle, LabelBoxPolygon}