<template>
    <div id="openseadragon" style="width:100%;height:100%"></div>
</template>

<script>
  import OpenSeadragon from 'openseadragon'
  import axios from 'axios'

  export default {
    data: () => ({ 
      options: {
        id: "openseadragon",
        timeout: 120000,
        animationTime: 0.5,
        blendTime: 0.1,
        constrainDuringPan: true,
        maxZoomPixelRatio: 2,
        defaultZoomLevel: 1,
        homeFillsViewer: true,
        minZoomLevel: 1,
        visibilityRatio: 1,
        zoomPerScroll: 2,
        autoResize: false,
        showNavigationControl: false,
        rotationIncrement: 0,
        showNavigator: true,
        //navigatorId: navDivID //id div minimap ???
      },
     }),
    methods: {
      openSlide(path) {
        var url = "http://localhost:4000/get_slide_info/"+window.btoa(unescape(encodeURIComponent( path ))).slice(0, -2)
        console.log(url)
        axios.get(url).then((result) => {
          console.log(result.data)
          this.viewer.open("http://localhost:4000"+result.data.slide);
          //this.viewer.scalebar({pixelsPerMeter: result.mpp ? (1e6 / result.mpp) : 0});
        });
      },
    },
    mounted() {
      this.viewer = OpenSeadragon(this.options);
      this.viewer.canvas.id = "openseadragon_canvas"
      this.$store.commit('INIT_OSD', this.viewer)

      //just for test
      this.openSlide("/home/david/Pictures/labelomon/SB_SBLAMBatch-1_170102433.mrxs")
    }
  }
</script>
