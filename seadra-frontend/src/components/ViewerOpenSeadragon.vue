<template>
    <div id="openseadragon" style="width:100%;height:100%"></div>
</template>

<script>
  import OpenSeadragon from 'openseadragon'
  import axios from 'axios'

  export default {
    data: () => ({
      image_directory: "seadra-local/dataset/",
      image_name: "693f5bbb777dcf650ce6c75f42919794.png",
      options: {
        id: "openseadragon",
        timeout: 120000,
        animationTime: 0.5,
        blendTime: 0.1,
        constrainDuringPan: true,
        minZoomPixelRatio: 0.9,
        maxZoomPixelRatio: 2,
        defaultZoomLevel: 0,
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
        var request_url = "http://localhost:4000/get_slide_info/"
        request_url += window.btoa(unescape(encodeURIComponent(path)))
        console.log(request_url)
        axios.get(request_url).then((result) => {
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
      this.openSlide(this.image_directory + this.image_name)
    }
  }
</script>
