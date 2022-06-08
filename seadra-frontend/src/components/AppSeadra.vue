<template>
  <v-app id="inspire">
    <v-navigation-drawer
      v-model="drawer"
      app
    >
      <!--  -->
    </v-navigation-drawer>

    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title>Seadra</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <!--  -->
    </v-main>
  </v-app>
</template>

<script>
import axios from 'axios'
  export default {
    name: 'AppSeadra',
    data: () => ({ drawer: null }),
    mounted(){
      axios.post('http://localhost:4000/fileExplorer',{'path':'./'}).then(response => (console.log(response.data)))
    }
  }
</script>

