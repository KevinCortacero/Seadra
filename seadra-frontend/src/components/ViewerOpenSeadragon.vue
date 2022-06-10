<template>
    <div id="openseadragon" style="width:100%; height:100%"></div>
</template>

<script>
  import OpenSeadragon from 'openseadragon'
  import axios from 'axios'
  import { mapState } from 'vuex';

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
    computed: mapState(['filepath']),
    watch: {
      filepath(newFilepath){
        this.read_slide(newFilepath)
      }
    },
    methods: {
      read_slide(filepath) {
        var request_url = this.$request_base_url + "get_slide_infos/"
        request_url += window.btoa(unescape(encodeURIComponent(filepath))).replaceAll('=', '')
        console.log("read slide: " , request_url)
        axios.get(request_url).then((result) => {
          console.log(result.data)
          // this.viewer = OpenSeadragon(this.options);
          // this.viewer.canvas.id = "openseadragon_canvas"
          // this.$store.commit('INIT_OSD', this.viewer)
          this.viewer.open(this.$request_base_url+result.data.slide);
          //this.viewer.scalebar({pixelsPerMeter: result.mpp ? (1e6 / result.mpp) : 0});
        });
      },
    },
    mounted() {
      this.viewer = OpenSeadragon(this.options);
      this.viewer.canvas.id = "openseadragon_canvas"
      this.$store.commit('INIT_OSD', this.viewer)

      /*
      this.$root.$on("on_image_changed", (data) => {
        console.log(data["filepath"]);
        this.read_slide(data["filepath"])
      });*/
    }
  }
</script>
