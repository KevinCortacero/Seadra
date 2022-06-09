import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
// https://openclassrooms.com/fr/courses/6390311-creez-une-application-web-avec-vue-js/6870051-recuperez-des-donnees-depuis-vuex
export default new Vuex.Store({
  state: {
    viewerOSD: {}
  },
  getters: {
  },
  mutations: {
    INIT_OSD(state,osd){
      state.viewerOSD = osd;
    }
  },
  actions: {
  },
  modules: {
  }
})
