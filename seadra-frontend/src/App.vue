<template>
  <v-app id="app">
    <v-navigation-drawer
        absolute
        mini-variant
        mobile-breakpoint="0"
      ><img style='width:90%;margin:10px 0 0 3px' src="data:image/png;base64,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">
      
    <v-dialog v-model="showProjectConfig" persistent transition="dialog-top-transition" content-class="vdialognew" overlay-opacity='0'>
      <config-project :projectDirectory.sync="pathConfig" v-on:done="doneConfig" />
    </v-dialog>


    <v-dialog v-model="stateSave" persistent max-width="500px" overlay-opacity="0.8">
      <v-card outlined>
        <v-card-title>
          <span class="text-h5">Be careful, your labelling is unsaved </span>
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" depressed @click="changeFile"> Discard </v-btn>
          <v-btn color="primary" depressed @click="wantChange = false"> Cancel </v-btn>
          <v-btn color="success" depressed @click="save_json"> Save </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-btn text outlined color="darkgrey" @click="eventDisplayConfig" style='height:60px;min-width: 100%!important;'>
      <v-icon>mdi-application-cog-outline</v-icon>
    </v-btn>
    <v-item-group
        v-model="window"
        mandatory
      >
        <v-item v-slot="{active, toggle }">
            <v-btn text outlined :color="active?'teal':'darkgrey'" @click="toggle" style='height:60px;min-width: 100%!important;'>
              <v-icon>mdi-folder-multiple-image</v-icon>
            </v-btn>
        </v-item>
        <v-item v-slot="{active, toggle }">
            <v-btn text outlined :color="active?'teal':'darkgrey'" @click="toggle" style='height:60px;min-width: 100%!important;'>
              <v-icon>mdi-notebook-edit</v-icon>
            </v-btn>
        </v-item>
      </v-item-group>
       <template v-slot:append>
        <div>
          <v-btn text outlined color="darkgrey" style='height:60px;min-width: 100%!important;' @click="save_json">
            <v-icon>mdi-content-save</v-icon>
          </v-btn>
          <v-btn text outlined color="darkgrey" style='height:60px;min-width: 100%!important;' @click="toggleDarkMode">
            <v-icon>mdi-theme-light-dark</v-icon>
          </v-btn>
        </div>
      </template>
      </v-navigation-drawer>
      <div style="position:absolute;height:100vh;left:60px;right:0" >
    <splitpanes class="customsplit" @resized="fireResizeEvent">
      <pane size="17">
        <v-window
          v-model="window"
          vertical
        >
          <v-window-item style="height:100vh">
            <list-files :file-path.sync="imageFilePathFromFileExplorer" :directory.sync="directory" :colored-files="annotated_files" :image-preview='true' :file-extensions="['.png', '.jpg', '.jpeg', '.mrxs', '.tif', '.tiff', '.svs']"/>
          </v-window-item>
          <v-window-item style="height:100vh">
            <custom-labels :template="templateAnnotations" :stateSave.sync="stateSaveCustom" :annotations.sync="annotations" style="height:100%;padding:10px;overflow-y:auto" /> 
          </v-window-item>
        </v-window>
      </pane>

      <pane v-bind:style="{ backgroundColor: $vuetify.theme.dark?'#222':'#eee'}">
        <viewer-open-seadragon :file-path="imageFilePath" :osd.sync="osd" />
      </pane>

      <pane size="17" min-size="17" style="overflow:hidden; height:100%;display:flex;flex-direction:column">

        <!--<div style="width:100%;min-height: 50px;" id='scalebar'></div>-->
        <div style="width:100%;min-height: 250px;max-height: 250px;"><div id="view-nav" style="width:100%;height:100%;background-color:#424242"></div></div>
        <annotation-open-seadragon :osd="osd" :get-label-boxes.sync="getBoxes" :stateSave.sync="stateSaveBoxes" :set-label-boxes.sync="setBoxes" :labels="labels" style="height: 100%;"/>
        <v-row align="center" justify="space-around">
  </v-row>
      </pane>
    </splitpanes>
      </div>
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
  </v-app>
</template>

<script>
  import ViewerOpenSeadragon from '@/components/ViewerOpenSeadragon.vue'
  import AnnotationOpenSeadragon from '@/components/AnnotationOpenSeadragon.vue'
  import customLabels from '@/components/customLabels.vue'
  import ConfigProject from '@/components/ConfigProject.vue'
  import ListFiles from '@/components/ListFiles.vue'
  import { Splitpanes, Pane } from 'splitpanes'
  import 'splitpanes/dist/splitpanes.css'
  import axios from 'axios'
//  import json_file from "./components/label.json";
  export default {
    components: {
        Splitpanes, Pane,
        ViewerOpenSeadragon,
        AnnotationOpenSeadragon,
        customLabels,
        ConfigProject,
        ListFiles,
    },
    data: () => ({
      imageFilePathFromFileExplorer:undefined,
      imageFilePath:undefined,
      annotated_files: [],
      directory: localStorage.directory?localStorage.directory:'/home/',
      osd:undefined,
      getBoxes:()=>{},
      setBoxes:()=>{},
      labels:[],
      templateAnnotations:{},
      showProjectConfig: true,
      window: undefined,
      pathConfig: localStorage.directory?localStorage.pathConfig:'/home/',
      annotations:{},
      notif:{show:false,timeout:2000,text:"",color:"success"},
      stateSaveBoxes: false,
      stateSaveCustom: false,
      wantChange: false
    }),
    methods: {
      changeFile(){
        this.imageFilePath = this.imageFilePathFromFileExplorer;
        this.stateSaveBoxes = false;
        this.stateSaveCustom = false;
        this.wantChange = false;
      },
      eventDisplayConfig(){
        if(this.imageFilePath && (this.stateSaveCustom || this.stateSaveBoxes))
          this.wantChange = true
        else this.showProjectConfig = true;
      },
      doneConfig(data){
        this.templateAnnotations = data;
        this.showProjectConfig = false;
        this.labels = data.colorsLabels.map((l,i)=>{l.id=i;return l});
        this.imageFilePath = '';
        this.window = 0
        axios.post(this.$request_base_url + "/list_files", { directory: this.pathConfig, ext:['.json'] })
        .then(result => {
          this.annotated_files = result.data.files.map(f=>f.substr(6,f.lastIndexOf('.')-6))
          console.log(this.annotated_files)
        })
      },
      fireResizeEvent(){
        window.dispatchEvent(new Event('resize'));
      },
      save_json(){
        var filenameWithoutExt = this.imageFilePath.substr(this.imageFilePath.lastIndexOf(this.$dirSep)+1,this.imageFilePath.lastIndexOf('.')-this.imageFilePath.lastIndexOf(this.$dirSep)-1)
        var filename = "annot_" + filenameWithoutExt +".json"
        var filepath = this.pathConfig + filename
        axios.post(this.$request_base_url + "/write_json",{filepath:filepath,data:{path:this.imageFilePath,boxes:this.getBoxes(),annotations:this.annotations}}, {
            headers: {'Content-Type': 'application/json'}
        }).then(()=>{
          this.notif = {
            show:true,
            text:"annotation saved",
            color:'success',
            timeout:2000
          }
          this.changeFile()
          if(!this.annotated_files.includes(filenameWithoutExt))this.annotated_files.push(filenameWithoutExt)

        }).catch((error) => {
          this.notif = {
            show:true,
            text:"error while saving",
            color:'error',
            timeout:2000
          }
            this.wantChange = false;
            console.log(error);
        });
      },
    toggleDarkMode: function() {
        this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
        localStorage.setItem("darkTheme", this.$vuetify.theme.dark.toString());
    }
    },
    computed:{
      stateSave(){
        return (this.stateSaveCustom || this.stateSaveBoxes) && this.wantChange
      }
    },
    watch:{
      directory(){
        localStorage.directory = this.directory;
      },
      pathConfig(){
        localStorage.pathConfig = this.pathConfig;
      },
      imageFilePathFromFileExplorer(){
        console.log(this.imageFilePath,this.imageFilePathFromFileExplorer)
        if(this.imageFilePath && (this.stateSaveCustom || this.stateSaveBoxes))
          this.wantChange = true
        else this.imageFilePath=this.imageFilePathFromFileExplorer
      },
      imageFilePath(){
        if(this.imageFilePath!==''){
          this.window = 1
          var dirSep = window.navigator.platform.toLowerCase()==='win32'?'\\':'/'
          var filepath = this.pathConfig+"annot_" + this.imageFilePath.substr(this.imageFilePath.lastIndexOf(dirSep)+1,this.imageFilePath.lastIndexOf('.')-this.imageFilePath.lastIndexOf(dirSep)-1) +".json"
          axios.post(this.$request_base_url + "/read_json",{filepath:filepath}, {
              headers: {'Content-Type': 'application/json'}
          }).then(res=>{
            this.annotations = res.data.annotations;
            this.setBoxes(res.data.boxes);
          }).catch((error) => {
              console.log(error);
              this.annotations = {};
              this.setBoxes([]);
          });
        }
      }
    },
    mounted() {

      this.$vuetify.theme.themes.light.primary = '#009688'
      this.$vuetify.theme.themes.dark.primary = '#009688'

      this.fireResizeEvent()


      const theme = localStorage.getItem("darkTheme");

      // Check if the user has set the theme state before
      if (theme) {
          if (theme === "true") {
              this.$vuetify.theme.dark = true;
          } else {
              this.$vuetify.theme.dark = false;
          }
      } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
          this.$vuetify.theme.dark = true;
          localStorage.setItem(
              "darkTheme",
              this.$vuetify.theme.dark.toString()
          );
      }
      axios.post(this.$request_base_url + "/read_json",{filepath:this.pathConfig+'config.seadra'}, {
          headers: {'Content-Type': 'application/json'}
      }).then(res=>{
        if(Object.keys(res.data).length>0){
            this.doneConfig(res.data);
            console.log('config loaded')
        } else {
            console.log('config file is empty')
        }
      }).catch(() => {
            console.log('file not found : '+this.pathConfig+'config.seadra')
          });
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
.vdialognew{
  margin:0 0 0 57px!important;
  width: calc(100% - 57px)!important;
  height:100vh;
  max-height: 100vh!important;
}
.customsplit {background-color: #f8f8f8;}

.splitpanes__splitter {background-color: #ccc;position: relative;}
.splitpanes__splitter:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  transition: opacity 0.7s;
  background-color: rgba(0, 148, 133, 0.295);
  opacity: 0;
  z-index: 1;
}
.splitpanes__splitter:hover:before {opacity: 1;}
.splitpanes--vertical > .splitpanes__splitter:before {left: -4px;right: -4px;height: 100%;}
.splitpanes--horizontal > .splitpanes__splitter:before {top: -4px;bottom: -4px;width: 100%;}
* {
    -ms-overflow-style: none;
}
</style>
