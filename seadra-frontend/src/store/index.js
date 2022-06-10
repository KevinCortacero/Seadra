import Vue from 'vue'
import Vuex from 'vuex'


Vue.use(Vuex)
// https://openclassrooms.com/fr/courses/6390311-creez-une-application-web-avec-vue-js/6870051-recuperez-des-donnees-depuis-vuex
export default new Vuex.Store({
  state: {
    viewerOSD: undefined,
    filepath: undefined,
    selectedLabelIndex:0,
    labels:[],
    getBoxLabels:undefined,
  },
  getters: {
    selected_label(state){
      //if(state.selectedLabelIndex>=state.labels.length) return undefined
      return state.labels[state.selectedLabelIndex];
    }
  },
  mutations: {
    INIT_OSD(state,osd){
      state.viewerOSD = osd;
    },
    CHANGE_FILEPATH(state,filepath){
      state.filepath = filepath;
    },
    CHANGE_SELECTED_LABEL(state,index){
      state.selectedLabelIndex = index;
    },
    UPDATE_LIST_LABEL(state,labels){
      Vue.set(state, 'labels', [...labels]);
    },
    INIT_GETTER_BOXLABELS(state,cb){
      state.getBoxLabels = cb;
//      Vue.set(state,'getBoxLabels', cb);
    }
  },
  actions: {
  },
  modules: {
  }
})
