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


    
    $.Viewer.prototype.addGridHelp = function(){
        this.addHandler('tile-drawing',(p)=>{
          if( p.tile.level !==p.tiledImage.levelGridHelp) return
          let context = this.drawer.context;
          let tile = p.tile
          context.save();
          context.lineWidth = 2 * $.pixelDensityRatio;
          context.strokeStyle = p.tiledImage.colorGridHelp||"#ff0000";
          try {
            context.strokeRect(
                tile.position.x * $.pixelDensityRatio,
                tile.position.y * $.pixelDensityRatio,
                tile.size.x * $.pixelDensityRatio,
                tile.size.y * $.pixelDensityRatio
            );
          } catch(e) {
              console.error(e);
          }
          context.restore();
        })
    }

    $.Viewer.prototype.cloneSource = function(id,options={}){
        var oldImage = this.world.getItemAt(id);
        var oldBounds = oldImage.getBounds();
        var oldSource = oldImage.source
        var tileSource = Object.assign({}, oldImage.source,options)
        tileSource.tileSize = oldSource.getTileWidth()
        return {
              tileSource: tileSource,
              x: oldBounds.x,
              y: oldBounds.y,
              width: oldBounds.width
            }
    }
    $.Viewer.prototype.addMaskLayer = function (info,level,success) {
        let backupNavigator = this.navigator
        this.navigator = undefined
        this.addTiledImage(Object.assign(info,{
            immediateRender:false,
            success: (res)=> {
              let imgTiled = res.item
              imgTiled.isMask = true
              imgTiled.levelMaskConstraint = level
              imgTiled._maskBoxes = []

              let _loadTile = imgTiled._loadTile.bind(imgTiled)
              imgTiled._loadTile = (tile, currentTime)=>{
                if(tile.level === imgTiled.levelMaskConstraint && imgTiled._isInLimit(tile.bounds.x*imgTiled.source.width, tile.bounds.y*imgTiled.source.width,tile.bounds.width*imgTiled.source.width)){
                    _loadTile(tile,currentTime)
                } else {
                  tile.loading = false;
                  tile.exists = false;
                }
              }

              imgTiled.setMaskBoxes = (boxes)=>{
                imgTiled._maskBoxes = boxes
                imgTiled._refreshTiles()
              }

              imgTiled._isInLimit = (x,y,s)=>{
                for(let box of imgTiled._maskBoxes)
                    if(x+s>box.x && x<box.x+box.w && y+s>box.y && y<box.y+box.h) return true
                return false
              }

              imgTiled._refreshTiles = ()=>{
                let s = imgTiled.getTileBounds(imgTiled.levelMaskConstraint,0,0).width*imgTiled.source.width
                let r,c;
                for(let box of imgTiled._maskBoxes){
                    for(let i=box.x;i<box.x+box.w+s;i+=s){
                        for(let j=box.y;j<box.y+box.h+s;j+=s){
                            r=Math.floor(i / s)
                            c=Math.floor(j / s)
                            if(imgTiled.tilesMatrix[imgTiled.levelMaskConstraint])
                            if(imgTiled.tilesMatrix[imgTiled.levelMaskConstraint][r])
                            if(imgTiled.tilesMatrix[imgTiled.levelMaskConstraint][r][c])
                            if(!imgTiled.tilesMatrix[imgTiled.levelMaskConstraint][r][c].exists){
                                delete imgTiled.tilesMatrix[imgTiled.levelMaskConstraint][r][c]
                            }
                        }
                    }
                }
                imgTiled.setCroppingPolygons(imgTiled._maskBoxes.map(b=>[{x:b.x,y:b.y},{x:b.x+b.w,y:b.y},{x:b.x+b.w,y:b.y+b.h},{x:b.x,y:b.y+b.h}]));
                this.forceRedraw();
              }
              //this.applyCropMask(imgTiled)
              if(success) success(imgTiled)
              this.navigator=backupNavigator
              this.forceRedraw();
            }
        }));
    };
}