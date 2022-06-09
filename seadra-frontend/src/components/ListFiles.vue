<template>
    <v-card
      id="list-files"
      class="mx-auto"
      max-width="384"
      tile
    >
      <v-list flat>
        <v-subheader>FILES</v-subheader>
        <v-list-item-group mandatory v-model="selected_file" color="primary" @change="change_file()">
        <v-list-item v-for="(filename, i) in files" :key="i">
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
        request_base_url: "http://localhost:4000/",
        request_name: "list_files",
        directory: "seadra-local/dataset/",
        selected_file: 0,
        files: []
    }),
    methods: {
        list_files(){
            axios.post(this.request_base_url + this.request_name, {'directory': this.directory})
            .then( result =>{
                this.files = result.data.files;
            })},
        change_file(){
            //TODO: use store ?
            var data = {
                "filepath": this.directory + this.files[this.selected_file]
            }
            console.log(data)
            this.$root.$emit("on_image_changed", data);
        }
    },
    mounted(){
      this.list_files()
    }
  }
</script>
