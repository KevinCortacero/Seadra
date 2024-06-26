<template>
<div style="width:100%; height:100%; position:relative" class="d-flex">
<v-overlay :value="overlay" :absolute="true">
      <v-progress-circular
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
    <div id="openseadragon" style="width:100%; height:100%"></div>
    <v-slider
  :max="zoom.max"
  :min="zoom.min"
  direction="vertical"
  @update:modelValue="sliderChange"
  style="width:20px;"
  class="zoom-slider"
  v-model="zoom.current"
  :ticks="[this.limitMaxStepVisibility]"
  tick-size="7"
  show-ticks="always"
  step='1'
></v-slider>
<v-snackbar
      v-model="notif.show"
      :timeout="notif.timeout"
      :color="notif.color"
      outlined
    >
      {{notif.text}}
      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="notif.show = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
</div>
</template>

<script>
  import OpenSeadragon from 'openseadragon'
  import axios from 'axios'
  import scalebar from '../js/openseadragon-scalebar'
  import fabricsOverlay from '../js/openseadragon-fabricjs-overlay'
  import maskLayer from '../js/openseadragon-mask-layer'
  //import LabelTool from '../js/label-tool'

  export default {
    data: () => ({
      options: {
        id: "openseadragon",
        timeout: 120000,
        animationTime: 0.1,
        blendTime: 0.1,
        constrainDuringPan: true,
        maxZoomPixelRatio: 2,
        defaultZoomLevel: 1.001,
        visibilityRatio: 1,
        zoomPerScroll: 1.2,
        autoResize: true,
        showNavigationControl: false,
        rotationIncrement: 0,
        preserveImageSizeOnResize:true,
        showNavigator: true,
        navigatorAutoResize: false,
        navigatorHeight:250,
        navigatorWidth:250,
        navigatorMaintainSizeRatio:true,
        navigatorPosition:'ABSOLUTE',
        navigatorId: 'view-nav',
        constraints:true
      },
      notif:{show:false,timeout:2000,text:"",color:"success"},
      overlay:false,
      zoom:{min:0,max:1,current:1,prevValue:1},
      isPyramid : false,
      limitMaxStepVisibility: 0
     }),
    props:{
      filePath: {type:String}
    },
    watch: {
      filePath(newFilepath){
        this.read_slide(newFilepath)
      },
    },
    methods: {
      read_slide(filepath) {
        this.notif.show = false
        this.viewer.close()
        var ext = filepath.split('.').pop()
        if(['png', 'jpg', 'jpeg'].includes(ext.toLowerCase())){
          this.overlay = true
          this.isPyramid = false
          this.viewer.open({
            type: 'image',
            url: this.$request_base_url+'/api/getimg/'+window.btoa(unescape(encodeURIComponent(filepath))).replaceAll('=', '')+'.png',
            buildPyramid: false
          })
          this.viewer.scalebar({pixelsPerMeter: 0});
        } else if(filepath!==''){
          this.overlay = true
          this.isPyramid = true
          var request_url = this.$request_base_url + "/api/get_slide_infos/"
          request_url += window.btoa(unescape(encodeURIComponent(filepath))).replaceAll('=', '')
          axios.get(request_url).then((result) => {
            console.log(result)
            this.viewer.open(this.$request_base_url+result.data.slide);
            this.viewer.scalebar({pixelsPerMeter: result.data.mpp ? (1e6 / parseFloat(result.data.mpp)) : 0});
          });
        }
      },

      initViewer(){
        this.viewer = OpenSeadragon(this.options);
        this.viewer.canvas.id = "openseadragon_canvas"
        this.viewer.scalebar({
            xOffset: 10,
            yOffset: 10,
            barThickness: 3,
            color: '#555555',
            fontColor: '#333333',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
        });
        console.log(this.viewer)
        this.labelTool = this.viewer.initFabricjsOverlay((selectedBox)=>{
              if(selectedBox?.classID !=='zoneMask'){
                this.$emit('selectedBox',selectedBox)
              } else this.$emit('selectedBox',undefined)
            })
        this.$emit('update:osd', this.viewer)
        this.viewer.canvas.addEventListener('keydown', (e) => {
            if(e.key === 'f') {
                return false;
            }
        })
        
        this.viewer.addHandler('open',()=>{
          if(this.overlay){
            this.zoom.max = Math.log(this.viewer.viewport.getMaxZoom())/Math.log(1.1)
            this.zoom.min = Math.log(this.viewer.viewport.getMinZoom())/Math.log(1.1)
            this.overlay = false

            this.viewer.world.getItemAt(0).colorGridHelp = '#0000ff'
            this.viewer.world.getItemAt(0).levelGridHelp = -1
          }
          if(this.isPyramid)
            this.viewer.source.minLevel = Array.apply(null, Array(this.viewer.source.maxLevel+1)).map((_,i)=>Math.round(this.viewer.viewport.imageToViewportZoom((1/this.viewer.source.getPixelRatio(i).x / this.viewer.viewport._contentSize.x))-1)).indexOf(0)
        })
        this.viewer.addHandler('open-failed',()=>{
          this.overlay = false
          this.notif = {
            show:true,
            text:"error while loading the image, please try again",
            color:'error',
            timeout:5000
          }
        })

        /*
        this.viewer.addHandler('update-level',(p)=>{
          console.log('level',p.level)
        })*/
        this.viewer.addHandler('zoom', (e) => {
          //console.log(this.viewer.minZoomLevel,'/',e.zoom,'/',this.viewer.maxZoomLevel)
          console.log(this.viewer.viewport.getMaxZoom())
            this.zoom.max = Math.log(this.viewer.viewport.getMaxZoom())/Math.log(1.1)
            this.zoom.min = Math.log(this.viewer.viewport.getMinZoom())/Math.log(1.1)
            this.limitMaxStepVisibility = Math.log(this.viewer.viewport.getMaxZoom()/4)/Math.log(1.1)
            var nZ = Math.log(e.zoom)/Math.log(1.1)
            this.zoom.current=nZ
            this.zoom.prevValue=nZ

            if(this.viewer.maxZoomLevel)
            if(e.zoom>this.viewer.maxZoomLevel) this.viewer.viewport.zoomTo(this.viewer.maxZoomLevel)
            else if(e.zoom<this.viewer.minZoomLevel) this.viewer.viewport.zoomTo(this.viewer.minZoomLevel)
   
        });
      },
      sliderChange(value){
        //console.log(value, this.zoom.prevValue,this.overlay)
        if(this.viewer.zoomPerScroll===1){
          this.$nextTick(()=>this.zoom.current = this.zoom.prevValue);
          return;
        }

          if(value!=this.zoom.prevValue && !this.overlay){
            var factor = Math.pow( 1.1, value-this.zoom.prevValue );
            console.log(this.zoom.min,'/',value,'/',this.zoom.max)
            this.viewer.viewport.zoomBy(factor, null);
            this.viewer.viewport.applyConstraints();
            this.zoom.prevValue = value
          }
      }
    },
    mounted() {
      scalebar(OpenSeadragon)
      fabricsOverlay(OpenSeadragon)
      maskLayer(OpenSeadragon)
      this.initViewer()
    }
  }
</script>
<style>
.zoom-slider .v-input__details{
 display: none;
}
.zoom-slider .v-slider-track__tick{
  background-color: teal !important;
}
</style>
