<template>
  <v-app id="inspire">
    <v-navigation-drawer
      v-model="drawer"
      app
    >
      <annotation-open-seadragon />
    </v-navigation-drawer>

    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title>Seadra</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <viewer-open-seadragon />
    </v-main>
  </v-app>
</template>

<script>
  import axios from 'axios'
  import ViewerOpenSeadragon from '@/components/ViewerOpenSeadragon.vue'
  import AnnotationOpenSeadragon from '@/components/AnnotationOpenSeadragon.vue'

  export default {
    components: {
      ViewerOpenSeadragon,
      AnnotationOpenSeadragon,

    },
    data: () => ({ drawer: null }),
    mounted(){
      //call api to use in component fileExplorer
      axios.post('http://localhost:4000/fileExplorer',{'path':'/home/david/Pictures/labelomon'}).then(response => (console.log(response.data)))
    }
  }
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
