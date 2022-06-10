<template>
    <v-card
      id="list-files"
      class="mx-auto"
      max-width="384"
      tile
    >
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
        <v-list-item v-for="(filename, i) in files" :key="i+filename.length" @click="load_file(filename)">
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
        directory: "seadra-local/dataset",
        files: [],
        folders :[]
    }),
    computed:{
      current_dir(){
        let dirs = this.directory.split('/')
        return dirs[dirs.length-1]
        }
    },
    methods: {

        load_file(filename){
          this.$store.commit('CHANGE_FILEPATH', this.directory+'/'+filename)
        },
        load_dir(foldername){
          axios.post(this.$request_base_url + "list_files", {'directory': this.directory+'/'+foldername})
            .then( result =>{
                this.files = result.data.files;
                this.folders = result.data.folders;
                this.directory = result.data.currentPath;
            })
        },
        goback(){
          axios.post(this.$request_base_url + "list_files", {'directory': this.directory+'/..'})
            .then( result =>{
                this.files = result.data.files;
                this.folders = result.data.folders;
                this.directory = result.data.currentPath;
            })
        },
        list_files(){
          axios.post(this.$request_base_url + "list_files", {'directory': this.directory})
          .then( result =>{
              this.files = result.data.files;
              this.folders = result.data.folders;
              this.directory = result.data.currentPath;
          })
        },
    },
    mounted(){
      this.list_files()
    }
  }
</script>
