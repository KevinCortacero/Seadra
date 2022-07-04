<template>
  <v-card tile style="height:100%; overflow-y:auto;border-radius:0px;">

      <v-text-field label="current directory" v-model.lazy="directoryEditor">
        <v-icon slot="prepend">
          mdi-folder
        </v-icon>

      </v-text-field>

    <!-- Plain mode -->

    <v-list dense>
      <v-subheader v-text="current_dir"></v-subheader>
      <v-list-item-group mandatory color="primary">
        <v-list-item @click="goback()">
          <v-list-item-icon>
            <v-icon> mdi-folder-arrow-up </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>..</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-for="(foldername, i) in folders" :key="'d'+i" @click="load_dir(foldername)" dense>
          <v-list-item-icon>
            <v-icon> mdi-folder </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="foldername"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item class="tooltip" v-for="(filename, i) in files" :key="'f'+i"
          @click="load_file(filename)">
          <!-- <v-img v-bind:src="image"> -->

          <!-- </v-img> -->
          <v-list-item-icon v-if="imagePreview" @mouseover="mousein(filename, i)" @mouseleave="mouseout()">
            <img v-if="hover == true && i == index" v-bind:src="image" class="tooltiptext">
            <v-icon v-if="coloredFiles.includes(filename.substr(0,filename.lastIndexOf('.')))" style="color: purple"> mdi-image-edit </v-icon>
            <v-icon v-else>mdi-image</v-icon>
          </v-list-item-icon>

          <v-list-item-icon v-else>
            <v-icon v-bind:style="coloredFiles.includes(filename.substr(0,filename.lastIndexOf('.')))?{'color': 'purple'}:{}"> mdi-image </v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title v-text="filename"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-card>
</template>

<script>
import axios from 'axios'

export default {
  data: () => ({
    files: [],
    directoryEditor:'/',
    folders: [],
    timeout: 0,
    hover: false,
    image: "",
    index: -1
  }),
  props:{
    directory: {type:String, default:"/home/"},
    filePath: {type:String},
    fileExtensions: {type:Array,default:()=>[]},
    imagePreview:{type:Boolean, default:false},
    coloredFiles: {type:Array,default:()=>[]},
  },
  emits:['update:filePath'],
  computed: {
    current_dir() {
      let dirs = this.directory.slice(0, -1).split(this.$dirSep)
      return dirs[dirs.length - 1]
      // return this.directory
    }
  },
  watch: {
    directoryEditor(new_dir) {
      if (new_dir[new_dir.length - 1] === this.$dirSep && new_dir !== this.$dirSep) {
        this.list_files(new_dir)
      }
    },
    directory(new_dir) {
      if (new_dir !==this.directoryEditor) {
        this.list_files(new_dir)
      }
    }
  },
  methods: {

    mousein(name, i) {
      this.image = ""
      this.hover = true;
      this.index = i;
      axios.post(this.$request_base_url + "/thumbnail", { directory: this.directory + name })
        .then(result => {
          this.image = "data:image/png;base64," + result.data
        })
    },
    mouseout() {
      this.index = -1; this.hover = false;
      this.image = ""
    },

    load_file(filename) {
      this.$emit('update:filePath',this.directory + filename)
    },
    load_dir(foldername) {
      axios.post(this.$request_base_url + "/list_files", { directory: this.directoryEditor + foldername, ext:this.fileExtensions })
        .then(result => {
          this.update_data(result.data)
        })
    },
    goback() {
      axios.post(this.$request_base_url + "/list_files", { directory: this.directoryEditor + '..', ext:this.fileExtensions })
        .then(result => {
          this.update_data(result.data)

        })
    },

    list_files(dir) {
      axios.post(this.$request_base_url + "/list_files", { directory: dir, ext:this.fileExtensions })
        .then(result => {
          this.update_data(result.data)
        })
    },
    update_data(data) {
      this.files = data.files;
      this.folders = data.folders;
      this.directoryEditor = data.currentPath + ((data.currentPath !== this.$dirSep) ? this.$dirSep : "");
      this.$emit('update:directory',this.directoryEditor);
    }
  },
  mounted() {
    this.directoryEditor = this.directory;
  }
}
</script>

<style>
.v-card--reveal {
  align-items: center;
  bottom: 0;
  justify-content: center;
  opacity: .5;
  position: absolute;
  width: 100%;
}

.tooltip {
  position: relative;
}

.tooltip .tooltiptext {

  position: absolute;
  left: 50%;
  height: 200%;
  margin-left: -25%;
  top: 100%;
  z-index: 9;
  border: black 2px solid;
  border-radius: 3px;
}
</style>