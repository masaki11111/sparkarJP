import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios' //追記
import VueAxios from 'vue-axios' //追記
import VModal from 'vue-js-modal'//追記
import InfiniteLoading from 'vue-infinite-loading'//追記
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import  VueLoading  from 'vue-loading-template'

library.add(faSearch)

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.config.productionTip = false
Vue.use(VueAxios, axios) //追記
Vue.use(VModal)//追記
Vue.use(InfiniteLoading)//追記
Vue.use(VueLoading)//追記


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
