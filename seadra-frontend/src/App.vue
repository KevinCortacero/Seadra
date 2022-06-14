<template>
  <v-app id="app">
    <splitpanes class="default-theme" style="height:100vh" @resized="fireResizeEvent">
      <pane size="17">
      <list-files :file-path.sync="imageFilePath" />
      </pane>

      <pane>
      <viewer-open-seadragon :file-path="imageFilePath" :osd.sync="osd" />
      </pane>

      <pane size="17" min-size="17" style="overflow:auto; height:100%;display:flex;flex-direction:column">
        <div style="width:100%;min-height: 250px;max-height: 250px;"><div id="view-nav" style="width:100%;height:100%;background-color:#424242"></div></div>
        <annotation-open-seadragon :osd="osd" :get-label-boxes.sync="getBoxes" :set-label-boxes.sync="setBoxes" :labels="labels" />
        <custom-labels :data="dataAnnot" :get-annotation.sync="getAnnotation" style="height:100%;"/> 
        <v-row align="center" justify="space-around">
        <v-btn @click="save_json">Sauvegarder</v-btn>
  </v-row>
      </pane>
    </splitpanes>


    
  </v-app>
</template>

<script>
  import ViewerOpenSeadragon from '@/components/ViewerOpenSeadragon.vue'
  import AnnotationOpenSeadragon from '@/components/AnnotationOpenSeadragon.vue'
  import customLabels from '@/components/customLabels.vue'
  import ListFiles from '@/components/ListFiles.vue'
  import { Splitpanes, Pane } from 'splitpanes'
  import 'splitpanes/dist/splitpanes.css'
  import axios from 'axios'
  import json_file from "./components/label.json";
  export default {
    components: {
        Splitpanes, Pane,
        ViewerOpenSeadragon,
        AnnotationOpenSeadragon,
        customLabels,
        ListFiles,
    },
    data: () => ({
      imageFilePath:undefined,
      osd:undefined,
      getBoxes:()=>{},
      setBoxes:()=>{},
      labels:[],
      dataAnnot:{},
      getAnnotation:()=>{},
    }),
    methods: {
      fireResizeEvent(){
        window.dispatchEvent(new Event('resize'));
      },
      load_json(){
          this.labels = json_file.labels.map((l,i)=>{l.id=i;return l});
          this.dataAnnot = json_file.customs;
          //this.$store.state.setBoxLabels()
      },
      save_json(){
        let json_string = JSON.stringify({path:this.imageFilePath,boxes:this.getBoxes(),annotations:this.getAnnotation()});
        axios.post(this.$request_base_url + "/write_json",json_string, {
            headers: {'Content-Type': 'application/json'}
        }).catch((error) => {
            console.error(error);
        });
      }
    },
    mounted() {
      this.fireResizeEvent()
      this.load_json();
    },
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
