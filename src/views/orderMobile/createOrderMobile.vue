<template>
  <div>
    <div class="title">新增订单</div>

    <div class="common_vantform_wrapper">
      <van-cell-group>
        <van-form @sunmit='handleSubmit' ref='formData'>
          <van-field class="border" v-model="formData.amount" label="金额" name="account" type="digit"
            :rules="[{ required: true, message: '请输入金额' }]" />

          <van-field v-model="formData.paymentId" label="支付方式" name="paymentId"
            :rules="[{ required: true, message: '请选择支付方式' }]">
            <template #input>
              <van-radio-group v-model="formData.paymentId" direction="horizontal">
                <van-radio v-for='item in tradeDictionary' :key="item.id" :name="item.id"
                  @click='handleChangePaymentName(item)'>{{item.name}}</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <!-- {{typeof formData.isDiscount}} -->
          <van-field v-model="formData.isDiscount" label="贴息" name="isDiscount"
            :rules="[{ required: true, message: '请选择贴息' }]">
            <template #input>
              <van-radio-group v-model="formData.isDiscount" direction="horizontal" :disabled='!hasDiscount'>
                <van-radio name='0'>否</van-radio>
                <van-radio v-if='hasDiscount' name='1'>是</van-radio>
              </van-radio-group>
            </template>
          </van-field>

          <van-field v-model="formData.period" v-if='checkPeriodVisible' label="分期" name="period"
            :rules="[{ required: true, message: '请选择分期' }]">
            <template #input>
              <van-radio-group v-if='formData.isDiscount===0' v-model="formData.period" direction="horizontal">
                <van-radio v-for='item in currentPeriodData.period' :key="item.index" :name="item">{{item}}期</van-radio>
              </van-radio-group>
              <van-radio-group v-else v-model="formData.period" direction="horizontal">
                <van-radio v-for='item in currentPeriodData.periodDiscount' :key="item.index" :name="item">{{item}}期
                </van-radio>
              </van-radio-group>

              <!-- <van-radio-group v-model="formData.period" direction="horizontal">
                <van-radio v-for='item in periodData' :key="item.index" :name="item.value">{{item.name}}</van-radio>
              </van-radio-group> -->
            </template>
          </van-field>
          <van-field class="border" v-model="formData.remark" :rows="remarkRows" autosize type="textarea" label="备注"
            name="remark" :rules="[{ required: false, message: '请输入备注' }]" maxlength='100' show-word-limit />
          <!-- 通过 validator 进行异步函数校验 -->
          <div class="footer">
            <van-button round block type="info" @click='handleSubmit'>收款</van-button>
          </div>
        </van-form>
      </van-cell-group>

    </div>

    <van-action-sheet v-model="show" :actions="actions" @select="onSelect" />
  </div>

</template>

<script>
import { Notify } from 'vant';

export default {
  name: "createOrderMobile",
  components: {
  },
  data() {
    return {
      findMerchantPeriodRequest: '/manager/trade/findMerchantPeriod',
      findMerchantDetailRequest: '/manager/merchant/findMerchantDetail',
      saveOrderRequest: '/manager/order/saveOrder',
      getOrderPaymentRequest: '/manager/payment/orderPayment',
      formData: {
        amount: "",
        isDiscount: null,
        paymentName: '',
        paymentId: '',
        period: "",
        remark: ""
      },
      value1: '',
      value2: '',
      value3: '',
      pattern: /\d{6}/,
      active: 0,
      show: false,
      actions: [
        { name: '选项' },
        { name: '选项' },
        { name: '选项', subname: '描述信息' },
      ],

      pagination: {
        page: 1,
        size: 10,
        limit: 0
      },
      tableData: [],
      tradesData: [],
      tradeDictionary: [],
      periodData: {},
      tradeIndex: 0,
      currentPeriodData: {},
      remarkRows: 1
    };
  },
  computed: {
    dialogStatus() {
      return this.dialogType === 0 ? '添加' : '编辑'
    },
    tableHeight() {
      return 'calc(100vh - 320px)'
    },
    userInfo() {
      return this.$store.state.user.userInfo
    },
    pollingCheckOrderStatusTimesLimit() {
      return this.$store.state.app.pollingCheckOrderStatusTimesLimit
    },

    hasDiscount() {
      let result = false
      const periodDiscount = this.currentPeriodData.periodDiscount
      // debugger
      if (periodDiscount instanceof Array && periodDiscount.length > 0) {
        result = true
      }
      return result

    },
    checkPeriodVisible() {
      let result = true
      // let currentPeriodData = this.currentPeriodData
      if (Object.keys(this.currentPeriodData).length === 0 || !this.currentPeriodData.periodDiscount) {
        return false
      }
      if (this.currentPeriodData.isDiscount === 0) {
        console.log('this.currentPeriodData.isDiscount === 0+++', result)
        if (this.currentPeriodData.period.length === 0 || (this.currentPeriodData.period.length === 1 && this.currentPeriodData.period[0] === '0')) {
          result = false
        } else {
          result = true
        }
      } else {
        console.log('this.currentPeriodData.isDiscount !== 0+++', result)
        if (this.currentPeriodData.periodDiscount.length === 0 || (this.currentPeriodData.periodDiscount.length === 1 && this.currentPeriodData.periodDiscount[0] === '0')) {
          result = false
        } else {
          result = true
        }
      }
      console.log('this.currentPeriodData', this.currentPeriodData)

      return result
    },

  },
  watch: {

  },
  created() {
    this.getPeriodData()
  },
  async mounted() {

  },
  methods: {
    getPeriodData() {
      console.log(this.userInfo)
      this.$http.post(this.findMerchantDetailRequest, {
        id: this.userInfo.merchant.id
      }).then(async response => {
        console.log('response+++++', response)

        let responseData = response.data
        this.paymentData = responseData.trades.filter(item => item.status !== 0)
        this.tradeDictionary = responseData.trades.filter(item => item.status !== 0).map(item => {
          return Object.assign(item, {
            period: item.period.split(',').sort((a, b) => a - b)
          })
        })
        console.log('this.tradeDictionary++++++', this.tradeDictionary)
      }).catch(error => {
        this.tableLoading = false
        console.log(error)
      })
    },
    // 校验函数返回 true 表示校验通过，false 表示不通过
    validator(val) {
      return /1\d{10}/.test(val);
    },
    // 异步校验函数返回 Promise
    asyncValidator(val) {
      return new Promise((resolve) => {
        this.$toast.loading('验证中...');;

        setTimeout(() => {
          this.$toast.clear();
          resolve(/\d{6}/.test(val));
        }, 1000);
      });
    },
    onFailed(errorInfo) {
      console.log('failed', errorInfo);
    },
    handleSubmit() {
      console.log(this.formData)
      this.$refs.formData.validate().then(async valid => {
        try {
          await this.handleSubmitPromise()
          await this.getQRCodePromise()
          Notify({
            type: 'success',
            message: '获取二维码成功',
            duration: 1000,
          });
          this.$router.push({
            name: 'showQRCodeMobile',
            query: {
              paymentName: this.formData.paymentName,
            }
          })
        } catch (error) {
          // Notify('获取二维码失败');
          Notify({
            message: error,
            duration: 1000,
          });


        }
      }).catch(error => {

        Notify({
          message: '表单校验未通过',
          duration: 1000,
        });

      })
    },
    handleSubmitPromise() {

      return new Promise((resolve, reject) => {
        this.$http.post(this.saveOrderRequest, Object.assign(this.formData, {
          amount: Number(this.formData.amount),
          paymentId: this.formData.paymentId,
          paymentName: this.tradeDictionary.find(item => item.id === this.formData.paymentId).name,
          period: this.formData.period === '' ? 0 : this.formData.period
        })).then(response => {
          this.orderNo = response.data.orderNo
          localStorage.setItem('orderNo', this.orderNo)
          resolve(response)
        }).catch(error => {
          console.log(error)
          reject(error)
        })
      })


    },
    getQRCodePromise() {
      return new Promise((resolve, reject) => {
        this.$http.post(this.getOrderPaymentRequest, {
          orderNo: this.orderNo
        }).then(response => {
          this.qrCode = response.data

          this.$store.commit('app/setQrCode', this.qrCode)
          localStorage.setItem('qrCodeData', response.data)
          resolve(response.data)
        }).catch(error => {
          console.log(error)
          Notify({
            type: 'error',
            message: error,
            duration: 1000,
          });
          reject(error)
        })
      })
    },
    onClickRight() {

    },
    logOut() {
      this.$router.go(-1)
    },
    onSelect() {

    },
    async handleChangePaymentName(data) {
      console.log('handleChangePaymentName+++++', data)
      console.log('this.tradeDictionary+++++', this.tradeDictionary)
      this.formData.isDiscount = '0'
      let currentPeriodData = this.tradeDictionary.find(item => item.id === data.id)
      const checkTradeIndex = id => {
        this.tradeDictionary.forEach((item, index) => {
          if (item.id === id) {
            this.tradeIndex = index
          }
        })
      }

      if (currentPeriodData.hasDiscountData) {
        this.currentPeriodData = currentPeriodData
      } else {
        const paymentData = await this.getPaymentDataPromise(data)
        let periodDiscountResult = []
        if (paymentData.data) {
          let responseData = paymentData.data
          checkTradeIndex(data.id)
          this.currentPeriodData = this.tradeDictionary[this.tradeIndex]
          periodDiscountResult = responseData.period && this.currentPeriodData.isDiscount !== 0 ? responseData.period.split(',').sort((a, b) => a - b) : []
          periodDiscountResult = this.currentPeriodData.period.filter(item => {
            return periodDiscountResult.find(item2 => item2 === item)
          })


          console.log('this.periodData++++', this.tradeDictionary[this.tradeIndex].periodDiscount)
          console.log('this.currentPeriodData++++', this.currentPeriodData)
        } else {
          checkTradeIndex(data.id)
          this.currentPeriodData = this.tradeDictionary[this.tradeIndex]
          this.formData = Object.assign(this.formData, {
            period: ''
          })
        }
        this.tradeDictionary[this.tradeIndex].periodDiscount = periodDiscountResult
        this.tradeDictionary[this.tradeIndex].hasDiscountData = true

      }
    },
    getPaymentDataPromise(data) {
      return new Promise((resolve, reject) => {
        this.$http.post(this.findMerchantPeriodRequest, {
          merchantId: this.userInfo.merchant.id,
          tradeId: data.id
        }).then(response => {
          console.log('findMerchantPeriodRequest++++', response)

          resolve(response)
        }).catch(error => {
          console.log(error)
          reject(error)

        })
      })
    },
    getChosenPeriod() {
      let result = this.formData.isDiscount === 0 ? this.periodData.period : this.periodData.periodDiscount

      return result.map(item => {
        return {
          name: item + '期',
          value: item
        }
      })
    },
    handleFocusRemark() {
      this.remarkRows = 2
    },
    handleBlurRemark() {
      this.remarkRows = 2

    }
  }
};

</script>

