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
        <v-list-item v-for="(filename, i) in files" :key="i + filename.length" @click="load_file(filename)">
          <v-list-item-icon>
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
    timeout: 0
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


    load_file(filename) {
      this.$store.commit('CHANGE_FILEPATH', this.directory + filename)
    },
    load_dir(foldername) {
      axios.post(this.$request_base_url + "list_files", { 'directory': this.directory + foldername })
        .then(result => {
          this.update_data(result.data)
        })
    },
    goback() {
      axios.post(this.$request_base_url + "list_files", { 'directory': this.directory + '..' })
        .then(result => {
          this.update_data(result.data)

        })
    },

    list_files() {

      axios.post(this.$request_base_url + "list_files", { 'directory': this.directory })
        .then(result => {
          this.update_data(result.data)

        })
    },
    update_data(data) {
      this.files = data.files;
      this.folders = data.folders;
      this.directory = data.currentPath + ((data.currentPath !== "/") ? "/" : "");


    }
  },
  mounted() {
    this.list_files()
  }
}
</script>
