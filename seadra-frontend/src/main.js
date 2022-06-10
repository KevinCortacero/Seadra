import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import store from './store'
Vue.config.productionTip = false

Vue.prototype.$request_base_url = 'http://localhost:4000'

new Vue({
  vuetify,
  store,
  render: h => h(App)
}).$mount('#app')
