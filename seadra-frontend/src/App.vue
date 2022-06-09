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

      <v-toolbar-title>Application</v-toolbar-title>
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
      axios.post('http://localhost:4000/fileExplorer',{'path':'/home/david/Pictures/labelomon'}).then(response => (console.log(response.data)))
    }
  }
</script>
