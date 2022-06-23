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
  :min="0"
  vertical
  @input="sliderChange"
  style="width:20px;"
  class="large-slider"
  v-model="zoom.current"
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

  export default {
    data: () => ({
      options: {
        id: "openseadragon",
        timeout: 120000,
        animationTime: 0.1,
        blendTime: 0.1,
        constrainDuringPan: true,
        maxZoomPixelRatio: 2,
        defaultZoomLevel: 1,
        minZoomLevel: 1,
        visibilityRatio: 1,
        zoomPerScroll: 2,
        autoResize: true,
        showNavigationControl: false,
        rotationIncrement: 0,
        showNavigator: true,
        preserveImageSizeOnResize:true,
        navigatorId: 'view-nav',
      },
      notif:{show:false,timeout:2000,text:"",color:"success"},
      overlay:false,
      zoom:{min:0,max:1,current:1,prevValue:1}
     }),
    props:{
      filePath: {type:String},
      osd:{type:Object},
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
          this.viewer.open({
            type: 'image',
            url: this.$request_base_url+'/getimg/'+window.btoa(unescape(encodeURIComponent(filepath))).replaceAll('=', '')+'.png',
            buildPyramid: false
          })
          this.viewer.scalebar({pixelsPerMeter: 0});
        } else if(filepath!==''){
          this.overlay = true
          var request_url = this.$request_base_url + "/get_slide_infos/"
          request_url += window.btoa(unescape(encodeURIComponent(filepath))).replaceAll('=', '')
          axios.get(request_url).then((result) => {
            this.viewer.open(this.$request_base_url+result.data.slide);
            this.viewer.scalebar({pixelsPerMeter: result.data.mpp ? (1e6 / parseFloat(result.data.mpp)) : 0});
          //}
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
            //idDOM:'scalebar'
        });
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
          }
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
        this.viewer.addHandler('zoom', (e) => {
            var nZ = Math.log(e.zoom)/Math.log(1.1)
            this.zoom.current=nZ
            this.zoom.prevValue=nZ
        });
      },
      sliderChange(value){
          if(value!=this.zoom.prevValue && !this.overlay){
            var factor = Math.pow( 1.1, value-this.zoom.prevValue );
            this.viewer.viewport.zoomBy(factor, null);
            this.viewer.viewport.applyConstraints();
            this.zoom.prevValue = value
          }
      }
    },
    mounted() {
      scalebar(OpenSeadragon)
      this.initViewer()
    }
  }
</script>
<style>
.large-slider{
  min-height: 100%!important;
}

.v-slider {
  min-height: 100%!important;
}
.v-input__slot{
  min-height: 100%!important;
  padding: 10px 0 10px 0;
}
</style>
