<template>
	<NavbarComponent></NavbarComponent>
  <h1>{{userName}}的購物車</h1>
<table class="table table-bordered col-md-8 col-lg-6 ">
  <thead>
    <tr class="table-secondary">
      <th scope="col">商品名稱</th>
      <th scope="col">圖片</th>
      <th scope="col">數量</th>
      <th scope="col">單價</th>
      <th scope="col">小計</th>
      <th scope="col"></th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="(data, index) of userCartInfo">
      <th scope="row" class="align-middle" >{{data.title}}</th>
      <td>
        <img :src="`http://localhost:3000/${data.url}`" class="imgSize">
      </td>
      <td class="align-middle">{{data.quantity}}</td>
      <td class="align-middle">NT${{data.price}}</td>
      <td class="align-middle">NT${{data.quantity * data.price}}</td>
      <td class="align-middle"><i class="fa-solid fa-trash trashSize btnPointer" @click="removeCart(data.userCartItemId)"></i></td>
    </tr>
  </tbody>
    <tfoot>
    <tr class="table-secondary">
      <th scope="col">Total</th>
      <th scope="col"></th>
      <th scope="col">{{ totalNumber }}</th>
      <th scope="col"></th>
      <th scope="col">NT${{ totalPrice }}</th>
      <th scope="col"></th>
    </tr>
  </tfoot>
</table>
  <div class="btn-group mt-3 mb-3" role="group" aria-label="Basic example">
    <router-link to="/checkout"  class="btn btn-secondary me-3 rounded-3">結帳</router-link>
    <router-link to='/products' class="btn btn-secondary me-3 rounded-3">回到產品列表</router-link>
  </div>
	<FooterComponent></FooterComponent>
</template>

<script type="text/javascript">
import NavbarComponent from '@/components/NavbarComponent'
import FooterComponent from '@/components/FooterComponent'

import axios from "axios";

export default {
  name: 'ShopCart',
  components:{
    NavbarComponent,
    FooterComponent
  },
  data(){
    return{
      productentryIdQuantityArr:[],
      userCartInfo: []
    }
  },
  computed:{
    cart(){
      return this.$store.state.cart 
    },
    userName(){
      return this.$store.state.userName 
    },
    totalNumber () {
      let sum = 0
      this.userCartInfo.forEach(function(item, index){
        sum+=item.quantity
      })
      return sum
    },
    totalPrice() {
      let total = 0
      this.userCartInfo.forEach(function(item, index){
        total+=Number(item.price)*item.quantity
      })
      return total     
    }
  },
  watch:{
    // 一旦storage cart資料變動，就執行下面api
    // cart(){
    //    // 從後端獲得使用者cart 資訊，並且顯示在畫面上
    //   this.getUserCart()
    // }
  },
  mounted(){
    // axios arr
    let promises = [];
    const vm = this; // 取得vue實體

    // 如果有localStorage將使用者購物車傳到後端，並且刪除storage
    if(vm.cart.length > 0){
      for(let value of vm.cart){
        let data = {
          productsId: value.productsId,
          productId: value.productId,
          number: value.number
        }
        promises.push(axios.post("/addCart", data))
      }         
      vm.$store.commit('emptyCart')
    }     

    // 從後端獲得使用者cart 資訊，並且顯示在畫面上
    vm.getUserCart();
  },
  methods:{
    getUserCart(){
      let promises = [];
      const vm = this;
      axios.get("/userCartApi")
      .then((res)=>{
        for(let value of res.data){

          //將productentryIdQuantit儲存，前者用來判斷商品，後者顯示數量
          vm.productentryIdQuantityArr.push({
            productId: value.productentryId,
            productsId: value.bananaproductId,
            quantity: value.quantity,
            userCartItemId: value.id,

          })

          // bananaproductId用來使用api
          let data = {
            productsId: value.bananaproductId
          }  
           promises.push(axios.post('/productApi', data))     
        }
        Promise.all(promises)
          .then((res) => {
            for(let value of vm.productentryIdQuantityArr){
              let userCartInfoItem = {}
              userCartInfoItem.userCartItemId = value.userCartItemId
              userCartInfoItem.quantity = value.quantity
              for(let resValue of res){
                if(resValue.data.id == value.productsId){
                  userCartInfoItem.title = resValue.data.title
                  userCartInfoItem.price = resValue.data.price  
                }
                for(let imgInfo of resValue.data.imgurls){
                  if(imgInfo.id == value.productId){
                    userCartInfoItem.url = imgInfo.url
                  }
                }               
              }
              vm.userCartInfo.push(userCartInfoItem)                      
            }
          })
          // console.log(vm.userCartInfo)        
        })
    },
    removeCart(data){
      const yes = confirm('確定要整個刪除該商品嗎？！');
      if(yes){
        let postData = {
          id: data
        }
        axios.post('/removeCartItem', postData)
        .then((res)=>{
          if(res.data.status == 1){
            alert("已經刪除該筆商品")
            this.$router.push('/shopcart')
          }
          else{
            alert("發生錯誤")
          }
        })
        .catch((err)=>{
          console.log(err)
        })
      }
    }
  }
}  	

</script>

<style type="text/css">
  .imgSize{
    /*max-height: 25vh;*/
    max-width: 200px;
  }
  .trashSize{
    font-size: 1.5rem
  }
  .btnPointer{
    cursor: pointer;
  }
</style>