<template>
  <div>
    <van-nav-bar title="创建订单" @click-left="logOut" @click-right="onClickRight" />
    <div class="common_vantstep_wrapper">
      <van-steps :active="active">
        <van-step>创建订单</van-step>
        <van-step>扫描二维码</van-step>
        <van-step>交易完成</van-step>
      </van-steps>
    </div>

    <div class="order_qrcodemobile_wrapper">
      <p class="hint">恭喜，二维码创建成功</p>
      <div class="qrcode_wrapper">
        <div class="qrcode" ref='qrcode'></div>
        <!-- <canvas id="canvas"></canvas> -->
      </div>
      <div v-if='failedFlag' class="error">当前二维码已超时，请重新创建订单</div>
    </div>

  </div>

</template>

<script>
import QRCode from 'qrcode'
import QRCode2 from 'qrcodejs2'
export default {
  name: 'ShowQRCode',
  
  data() {
    return {
      findOrderByOrderNoRequest: '/manager/order/findOrderByOrderNo',
      alipayNotifyRequest: '/notify/alipayNotify',
      timesLimit: 25,
      qrCodeData: '',
      failedFlag: false,
      active: 1
    }
  },
  computed: {

    tableHeight() {
      return 'calc(100vh - 320px)'
    },
  },
  beforeCreate() {

  },
  created() {
  },
  mounted() {
    this.getQrCode()
  },
  beforeDestroy() {
    this.timer = null
  },
  methods: {
    getQrCode() {
      

      if (this.$store.state.app.qrCodeData !== '') {
        this.qrCodeData = this.$store.state.app.qrCodeData
      } else {
        this.qrCodeData = localStorage.getItem('qrCodeData')
      }
      // QRCode.toCanvas(canvas, this.qrCodeData, function (error) {
      //   if (error) console.error(error)
      //   console.log('success!');
      // })

      new QRCode2(this.$refs.qrcode, {
        text: this.qrCodeData,
        width: 600,
        height: 600,
        colorDark: "#000000",
        colorLight: "#ffffff",
        // correctLevel: QRCode.CorrectLevel.H
      });
      this.getPaymentStatusTimer()
    },
    notifyAlipay() {
      return new Promise((resolve, reject) => {
        this.$http.post(this.alipayNotifyRequest, {}).then(response => {
          resolve(true)
        })
      })

    },
    getPaymentStatusTimer() {
      this.timer = () => {
        setTimeout(() => {
          this.timesLimit--
          this.getPaymentStatusPromise().then(() => {
            // this.getPaymentStatusTimer()
            this.timer = null
          }).catch(error => {
            if (!!this.timer) {
              this.timer()
            }
          })
        }, 3000)
      }
      this.timer()
    },
    getPaymentStatusPromise() {
      const orderNo = localStorage.getItem('orderNo')
      return new Promise((resolve, reject) => {
        this.$http.post(this.findOrderByOrderNoRequest, {
          orderNo: orderNo
        }).then(response => {
          response = response.data
          if (this.timesLimit === 0) {
            this.failedFlag = true
            this.$message.error('当前二维码已超时，请重新创建订单')
            resolve()

          }
          if (response.order.status !== 2) {
            reject()

          } else {
            this.$router.push({
              name: 'congratulation'
            })
            resolve()

          }
        }).catch(error => {
          reject(error)
        })
      })

    },
    onClickRight() {

    },
    logOut() {
      this.$router.go(-1)
    },


  }
}

</script>
<style scoped lang='scss'>
@import "../../sassmobile/ordermobile.scss";
</style>
