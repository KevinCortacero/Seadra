<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" width="384" app>
      <list-files/>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title>Seadra</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <viewer-open-seadragon/>
    </v-main>

    <v-navigation-drawer app permanent right>
      <annotation-open-seadragon />
    </v-navigation-drawer>
  </v-app>
</template>

<script>
  import ViewerOpenSeadragon from '@/components/ViewerOpenSeadragon.vue'
  import AnnotationOpenSeadragon from '@/components/AnnotationOpenSeadragon.vue'
  import ListFiles from '@/components/ListFiles.vue'

  export default {
    components: {
      ViewerOpenSeadragon,
      AnnotationOpenSeadragon,
      ListFiles,
    },
    data: () => ({
      drawer: null 
    }),
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
