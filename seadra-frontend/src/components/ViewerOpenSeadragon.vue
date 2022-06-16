<template>
<div style="width:100%; height:100%">
<v-overlay :value="overlay" :absolute="true">
      <v-progress-circular
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
    <div id="openseadragon" style="width:100%; height:100%"></div>
</div>
</template>

<script>
  import OpenSeadragon from 'openseadragon'
  import axios from 'axios'

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
        navigatorId: 'view-nav'
      },
      overlay:false
     }),
    props:{
      filePath: {type:String},
      osd:{type:Object},
    },
    watch: {
      filePath(newFilepath){
        this.read_slide(newFilepath)
      }
    },
    methods: {
      read_slide(filepath) {
        this.overlay = true
        var ext = filepath.split('.').pop()
        if(['png', 'jpg', 'jpeg'].includes(ext.toLowerCase())){
          this.viewer.open({
            type: 'image',
            url: this.$request_base_url+'/getimg/'+window.btoa(unescape(encodeURIComponent(filepath))).replaceAll('=', '')+'.png',
            buildPyramid: false
          })
        } else {
          var request_url = this.$request_base_url + "/get_slide_infos/"
          request_url += window.btoa(unescape(encodeURIComponent(filepath))).replaceAll('=', '')
          console.log("read slide: " , request_url)
          axios.get(request_url).then((result) => {
            console.log(result.data)
            this.viewer.open(this.$request_base_url+result.data.slide);
            //this.viewer.scalebar({pixelsPerMeter: result.mpp ? (1e6 / result.mpp) : 0});
          //}
          });
        }
      },

      initViewer(){
        this.viewer = OpenSeadragon(this.options);
        this.viewer.canvas.id = "openseadragon_canvas"
        this.$emit('update:osd', this.viewer)
        this.viewer.canvas.addEventListener('keydown', (e) => {
            if(e.key === 'f') {
                return false;
            }
        })
        
        this.viewer.addHandler('viewport-change', () => {
          this.overlay = false
        })
      }
    },
    mounted() {
      this.initViewer()
    }
  }
</script>
