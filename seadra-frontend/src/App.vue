<template>
  <v-app id="app">
    <splitpanes class="default-theme" style="height:100vh" @resized="fireResizeEvent">
      <pane size="17">
      <list-files/>
      </pane>

      <pane>
      <viewer-open-seadragon/>
      </pane>

      <pane size="17" min-size="17" style="overflow:auto; height:100%;display:flex;flex-direction:column">
        <div style="width:100%;min-height: 250px;max-height: 250px;"><div id="view-nav" style="width:100%;height:100%;background-color:#424242"></div></div>
        <annotation-open-seadragon />
        <custom-labels style="height:100%;"/> 
      </pane>
    </splitpanes>


    
  </v-app>
</template>

<script>
  import ViewerOpenSeadragon from '@/components/ViewerOpenSeadragon.vue'
  import AnnotationOpenSeadragon from '@/components/AnnotationOpenSeadragon.vue'
  import customLabels from '@/components/customLabels.vue'
  import CustomLabels from './components/customLabels.vue'
  import ListFiles from '@/components/ListFiles.vue'
  import { Splitpanes, Pane } from 'splitpanes'
  import 'splitpanes/dist/splitpanes.css'
  export default {
    components: {
        Splitpanes, Pane,
        ViewerOpenSeadragon,
        AnnotationOpenSeadragon,
        customLabels,
        CustomLabels,
        ListFiles,
    },
    methods: {
      fireResizeEvent(){
        window.dispatchEvent(new Event('resize'));
      }
    },
    mounted() {
      this.fireResizeEvent()
    }
  }
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
