<template>
  <div class="innerlayoutmobile">
    <div class="header">
      <img src="@/image/mobile/logo.png" alt="">
    </div>
    <router-view class="main" />

  </div>
</template>

<script>
import Vue from 'vue';
import { Col, Row, Form, Field, Button, Toast, NavBar, Cell, CellGroup, Step, Steps, RadioGroup, Radio, ActionSheet, DropdownMenu, DropdownItem, Notify } from 'vant';


import 'vant/lib/button/style';

export default {
  name: "MobileLayout",
  components: {
    Col, Row, Form, Field, Button, Toast, NavBar, Cell, CellGroup, Step, Steps, RadioGroup, Radio, ActionSheet, DropdownMenu, DropdownItem, Notify
  },
  data() {
    return {
      getUserInfoRequest: '/manager/getUserInfo'
    };
  },
  computed: {
    userInfo() {
      return this.$store.state.user.userInfo
    }
  },
  watch: {

  },
  created() {
    this.getUserInfo()
    this.$remResizing({
      baseline: 320,
      fontSize: 20,
      threshold: 640,

    })
    this.importVantComponents()

  },
  mounted() {
  },
  methods: {
    importVantComponents() {
      Vue.use(Col);
      Vue.use(Row);
      Vue.use(Form);
      Vue.use(Field);
      Vue.use(Button);
      Vue.use(Toast);
      Vue.use(NavBar);
      Vue.use(Cell);
      Vue.use(CellGroup);
      Vue.use(Step);
      Vue.use(Steps);
      Vue.use(RadioGroup);
      Vue.use(Radio);
      Vue.use(ActionSheet);
      Vue.use(DropdownMenu);
      Vue.use(DropdownItem);
      Vue.use(Notify);


    },
    getUserInfo() {


      if (this.userInfo === {}) {
        return
      }
      console.log(this.userInfo)
      this.$http.post(this.getUserInfoRequest, {}).then(response => {
        console.log('getUsercInfo+++', response)
        this.$store.commit('setUserInfo', response.data)
        localStorage.setItem('userInfo', JSON.stringify(response.data))

      }).catch(error => {
        // this.$store.commit('setUserInfo', JSON.parse(localStorage.getItem('userInfo')))

        console.log('用户信息获取失败')
      })
    }
  }
};

</script>

<style lang='scss'>
// @import "../sassmobile/ordermobile.scss";
</style>
 

