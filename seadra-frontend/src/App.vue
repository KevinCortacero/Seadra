<template>
  <v-app id="app">
    <v-navigation-drawer
        absolute
        mini-variant
        :rail="true"
        permanent
      ><img style='width:90%;margin:10px 0 0 3px' src="./assets/logo.png">
      
    <v-dialog v-model="showProjectConfig" persistent transition="dialog-top-transition" content-class="vdialognew" overlay-opacity='0'>
      <config-project v-model:projectDirectory="pathConfig" v-on:done="doneConfig" />
    </v-dialog>


    <v-dialog v-model="stateSave" persistent max-width="500px" overlay-opacity="0.8">
      <v-card outlined>
        <v-card-title>
          <span class="text-h5">Be careful, your labelling is unsaved </span>
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="flat" @click="changeFile"> Discard </v-btn>
          <v-btn color="primary" variant="flat" @click="wantChange = false"> Cancel </v-btn>
          <v-btn color="success" variant="flat" @click="()=>save_json()"> Save </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-list
          density="compact"
          nav
        >
          <v-list-item prepend-icon="mdi-application-cog-outline" @click="eventDisplayConfig"></v-list-item>
          <v-list-item :active="window===0" @click="window=0" prepend-icon="mdi-folder-multiple-image" active-color='primary'></v-list-item>
          <v-list-item :active="window===1" @click="window=1" prepend-icon="mdi-notebook-edit" active-color='primary'></v-list-item>
    </v-list>
       <template v-slot:append>
        <v-list
          density="compact"
          nav
        >
          <v-list-item prepend-icon="mdi-content-save" @click="()=>save_json()"></v-list-item>
          <v-list-item prepend-icon="mdi-theme-light-dark" @click="toggleDarkMode"></v-list-item>
    </v-list>
      </template>
      </v-navigation-drawer>
      <div style="position:absolute;height:100vh;left:60px;right:0" >
    <splitpanes class="customsplit" @resized="fireResizeEvent">
      <pane size="17">
        <v-window
          v-model="window"
          :direction="'vertical'"
        >
          <v-window-item style="height:100vh">
            <list-files 
              v-model:file-path="imageFilePathFromFileExplorer"
              v-model:directory="directory"
              :colored-files="annotated_files"
              :image-preview='true'
              :file-extensions="['.png', '.jpg', '.jpeg', '.mrxs', '.tif', '.tiff', '.svs']"/>
          </v-window-item>
          <v-window-item style="height:100vh">
            <text-annotations
              :template="templateAnnotations"
              v-model:stateSave="stateSaveCustom"
              v-model:annotations="annotations"
              style="height:100%;padding:10px;overflow-y:auto" /> 
          </v-window-item>
        </v-window>
      </pane>

      <pane v-bind:style="{ backgroundColor: theme?.global?.name==='dark'?'#222':'#eee'}">
        <viewer-open-seadragon
          ref="vos"
          :file-path="imageFilePath"
          @selected-box="$refs.aos?.setSelectedBox"
          :labels="labels" />
      </pane>

      <pane size="17" min-size="5" style="overflow:hidden; height:100%;min-width:250px;display:flex;flex-direction:column">

        <!--<div style="width:100%;min-height: 50px;" id='scalebar'></div>-->
        <div style="width:100%;min-height: 250px;max-height: 250px;display: flex;flex-direction: row;justify-content: space-around;background-color:#424242"><div style="width:250px;height:250px;"><div id="view-nav" style="width:250px;height:250px;background-color:#424242"></div></div></div>
        <annotation-open-seadragon
          ref="aos"
          :label-tool="$refs.vos?.labelTool"
          :osd="$refs.vos?.viewer"
          v-model:stateSave="stateSaveBoxes"
          :labels="labels"
          style="height: 100%;"/>
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
  import textAnnotations from '@/components/textAnnotations.vue'
  import ConfigProject from '@/components/ConfigProject.vue'
  import ListFiles from '@/components/ListFiles.vue'
  import { Splitpanes, Pane } from 'splitpanes'
  import 'splitpanes/dist/splitpanes.css'
  import axios from 'axios'
  import { useTheme } from 'vuetify'
  axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

//  import json_file from "./components/label.json";
  export default {
    components: {
        Splitpanes, Pane,
        ViewerOpenSeadragon,
        AnnotationOpenSeadragon,
        textAnnotations,
        ConfigProject,
        ListFiles,
    },
    data: () => ({
      imageFilePathFromFileExplorer:undefined,
      imageFilePath:undefined,
      annotated_files: [],
      directory: localStorage.directory?localStorage.directory:'',
      labels:[],
      templateAnnotations:{},
      showProjectConfig: true,
      window: 0,
      pathConfig: localStorage.directory?localStorage.pathConfig:'',
      annotations:{},
      annotationsBoxes:[],
      notif:{show:false,timeout:2000,text:"",color:"success"},
      stateSaveBoxes: false,
      stateSaveCustom: false,
      wantChange: false,
      theme:undefined
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
        axios.post(this.$request_base_url + "/api/list_files", { directory: this.pathConfig, ext:['.json'] })
        .then(result => {
          this.annotated_files = result.data.files.map(f=>f.substr(6,f.lastIndexOf('.')-6))
          console.log(this.annotated_files)
        })
      },
      fireResizeEvent(){
        window.dispatchEvent(new Event('resize'));
      },
      save_json(success=()=>{}){
        var filenameWithoutExt = this.imageFilePath.substr(this.imageFilePath.lastIndexOf(this.$dirSep)+1,this.imageFilePath.lastIndexOf('.')-this.imageFilePath.lastIndexOf(this.$dirSep)-1)
        var filename = "annot_" + filenameWithoutExt +".json"
        var filepath = this.pathConfig + filename
        let boxes = this.$refs.aos?.getJson()
        console.log(boxes)
        axios.post(this.$request_base_url + "/api/write_json",{
          filepath:filepath,
          data:{path:this.imageFilePath,
                boxes:boxes,
                annotations:this.annotations}}, {
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
          success(filename)

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
        this.theme.global.name = this.theme.global.name==='dark' ? 'light' : 'dark'
        localStorage.setItem("theme", this.theme.global.name);
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
          axios.post(this.$request_base_url + "/api/read_json",{filepath:filepath}, {
              headers: {'Content-Type': 'application/json'}
          }).then(res=>{
            this.annotations = res.data.annotations;
            this.$refs.aos.updateBoxes(res.data.boxes)
          }).catch((error) => {
            this.$refs.aos.updateBoxes([])
              console.log(error);
              this.annotations = {};
          });
        }
      }
    },
    mounted() {

      document.addEventListener('contextmenu', event => {
          if(window.getSelection().type !== "Range")
          event.preventDefault();
      });
      this.theme = useTheme()

      this.fireResizeEvent()


      const themeLocal = localStorage.getItem("theme");
      // Check if the user has set the theme state before
      if (themeLocal) {
        this.theme.global.name = themeLocal;
      } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        this.theme.global.name = 'dark';
      }
      axios.post(this.$request_base_url + "/api/read_json",{filepath:this.pathConfig+'config.seadra'}, {
          headers: {'Content-Type': 'application/json'}
      }).then(res=>{
        if(Object.keys(res.data).length>0){
            this.doneConfig(res.data);
            this.window = 0;
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