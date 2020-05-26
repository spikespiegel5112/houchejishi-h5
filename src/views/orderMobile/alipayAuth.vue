<template>
  <div class="step3">
    <div class="banner">
      <img src="@/image/mobile/success.png" alt="">
      <label for="">验证成功</label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateOrder',

  data() {
    return {
      getAuthTokenRequest: 'authorize/getAuthToken',
      active: 1,

    }
  },
  computed: {
    authCode(){
      return this.$route.query.authCode
    }
  },
  beforeCreate() {

  },
  created() {

  },
  mounted() {
    // this.checkToken();
  },
  methods: {
    checkToken() {
      this.$http.post(this.getAuthTokenRequest, {
        authCode: this.authCode
      })
    }

  }
}

</script>

