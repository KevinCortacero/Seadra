<template>
  <v-card id="list-files" class="mx-auto" max-width="384" tile>


    <template>
      <v-text-field label="current directory" v-model.lazy="directory">
        <v-icon slot="prepend">
          mdi-folder
        </v-icon>

      </v-text-field>
    </template>

    <!-- Plain mode -->

    <v-list flat>
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
        <v-list-item v-for="(foldername, i) in folders" :key="i" @click="load_dir(foldername)">
          <v-list-item-icon>
            <v-icon> mdi-folder </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="foldername"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item class="tooltip" v-for="(filename, i) in files" :key="i + filename.length"
          @click="load_file(filename)">
          <!-- <v-img v-bind:src="image"> -->

          <!-- </v-img> -->
          <v-list-item-icon @mouseover="mousein(filename, i)" @mouseleave="mouseout()">
            <img v-if="hover == true && i == index" v-bind:src="image" class="tooltiptext">
            <v-icon> mdi-image </v-icon>

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
    directory: "/home/",

    files: [],
    folders: [],
    timeout: 0,
    hover: false,
    image: "",
    index: -1,
  }),
  computed: {
    current_dir() {
      let dirs = this.directory.slice(0, -1).split('/')
      return dirs[dirs.length - 1]
      // return this.directory
    }
  },
  watch: {
    directory(new_dir) {
      if (new_dir[new_dir.length - 1] === "/" && new_dir !== "/") {
        this.list_files()
      }
    }
  },
  methods: {

    mousein(name, i) {
      this.image = ""
      this.hover = true;
      this.index = i;
      axios.post(this.$request_base_url + "/thumbnail", { 'directory': this.directory + name })
        .then(result => {
          this.image = "data:image/png;base64," + result.data
        })
    },
    mouseout() {
      this.index = -1; this.hover = false;
      this.image = ""
    },

    load_file(filename) {
      this.$store.commit('CHANGE_FILEPATH', this.directory + filename)
    },
    load_dir(foldername) {
      axios.post(this.$request_base_url + "/list_files", { 'directory': this.directory + foldername })
        .then(result => {
          this.update_data(result.data)
        })
    },
    goback() {
      axios.post(this.$request_base_url + "/list_files", { 'directory': this.directory + '..' })
        .then(result => {
          this.update_data(result.data)

        })
    },

    list_files() {

      axios.post(this.$request_base_url + "/list_files", { 'directory': this.directory })
        .then(result => {
          this.update_data(result.data)

        })
    },
    update_data(data) {
      this.files = data.files;
      this.folders = data.folders;
      this.directory = data.currentPath + ((data.currentPath !== "/") ? "/" : "");
      localStorage.directory = this.directory;


    }
  },
  mounted() {
    if(localStorage.directory)
      this.directory = localStorage.directory;
    else
      this.list_files()
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