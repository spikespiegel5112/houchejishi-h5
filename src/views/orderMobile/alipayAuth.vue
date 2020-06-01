<template>
  <div class="step3">
    <div class="banner">
      <img src="@/image/mobile/success.png" alt="">
      <label v-if="successFlag!==''" for="">授权{{successFlag?'成功':'失败'}}</label>
      {{authCode}}
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateOrder',
  data() {
    return {
      getAuthTokenRequest: 'authorize/getAuthToken',
      successFlag: '',
    }
  },
  computed: {
    authCode() {
      return this.$route.query.app_auth_code || ''
    }
  },
  beforeCreate() {

  },
  created() {

  },
  mounted() {
    this.checkToken();
  },
  methods: {
    checkToken() {
      this.$http.get(this.getAuthTokenRequest, {
        params: {
          authCode: this.authCode
        }
      }).then(response => {
        this.successFlag = true
      }).catch(error => {
        this.successFlag = false

      })
    }

  }
}

</script>

