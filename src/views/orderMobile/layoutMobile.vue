<template>
  <div class="order_qrcode_wrapper">
    <p class="hint">支付完成</p>
   
  </div>
</template>

<script>
export default {
  name: 'CreateOrder',
  
  data() {
    return {
      findOrderByOrderNoRequest: 'order/findOrderByOrderNo',
      qrCode: 'aaa'
    }
  },
  computed: {
    tableHeight() {
      return 'calc(100vh - 320px)'
    },
    qrCode() {
      return this.$store.state.app.qrCode
    }
  },
  beforeCreate() {

  },
  created() {
  },
  mounted() {
  },
  methods: {
    


  }
}

</script>

