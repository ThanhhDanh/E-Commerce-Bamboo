<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';


const store = useStore()
const cartItems = computed(() => store.getters['cart/cartItems'])
const cartTotalPrice = computed(() => store.getters['cart/cartTotalPrice'])

const increaseQty = (productId) => {
  store.dispatch('cart/increaseCartQty', productId)
}
const decreaseQty = (productId) => {
  store.dispatch('cart/decreaseCartQty', productId)
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

</script>


<template>
  <!-- Start Banner Area -->
  <section class="banner-area organic-breadcrumb">
    <div class="container">
      <div class="breadcrumb-banner d-flex flex-wrap align-items-center justify-content-end">
        <div class="col-first">
          <h1>Giỏ hàng của bạn</h1>
          <nav class="d-flex align-items-center">
            <a href="index.html">Trang chủ<span class="lnr lnr-arrow-right"></span></a>
            <a href="category.html">Giỏ hàng</a>
          </nav>
        </div>
      </div>
    </div>
  </section>
  <!-- End Banner Area -->

  <!--================Cart Area =================-->
  <section class="cart_area">
    <div class="container">
      <div class="cart_inner">
        <div class="table-responsive">
          <div v-if="cartItems.length === 0">Giỏ hàng trống</div>
          <button v-if="cartItems.length > 0" class="btn btn-delete-all" @click="store.dispatch('cart/clearCart')">Xóa
            tất cả</button>
          <table class="table">
            <thead>
              <tr>
                <th scope="col">Sản phẩm</th>
                <th scope="col">Giá</th>
                <th scope="col">Số lượng</th>
                <th scope="col">Tổng</th>
                <th style="text-align: center;" scope="col">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in cartItems" :key="item.id">
                <td>
                  <div class="media">
                    <div class="d-flex">
                      <img :src="item.image" alt="">
                    </div>
                    <div class="media-body">
                      <p>{{ item.name }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <h5>{{ formatPrice(item.price) }}</h5>
                </td>
                <td>
                  <div class="product_count">
                    <input type="text" :value="item.quantity" class="input-text qty" readonly />
                    <button @click="increaseQty(item.id)" class="increase items-count" type="button">
                      <i class="lnr lnr-chevron-up"></i>
                    </button>
                    <button @click="decreaseQty(item.id)" class="reduced items-count" type="button">
                      <i class="lnr lnr-chevron-down"></i>
                    </button>
                  </div>
                </td>
                <td>
                  <h5>{{ formatPrice(item.totalPrice) }}</h5>
                </td>
                <td style="text-align: center;">
                  <a class="btn-action" href="#" @click=" store.dispatch('cart/removeFromCart', item.id)">
                    <i class="lnr lnr-cross"></i>
                  </a>
                </td>
              </tr>
              <tr class="bottom_button">
                <td>
                  <a class="gray_btn" href="#">Cập nhật giỏ hàng</a>
                </td>
                <td>

                </td>
                <td>

                </td>
                <td>

                </td>
                <td>
                  <div class="cupon_text d-flex align-items-center">
                    <input type="text" placeholder="Mã giảm giá">
                    <a class="primary-btn" href="#">Áp dụng</a>
                    <a class="gray_btn" href="#">Đóng mã giảm giá</a>
                  </div>
                </td>
              </tr>
              <tr>
                <td>

                </td>
                <td>

                </td>
                <td>

                </td>
                <td>
                  <h5>Tổng cộng</h5>
                </td>
                <td>
                  <h5>{{ formatPrice(cartTotalPrice) }}</h5>
                </td>
              </tr>
              <tr class="shipping_area">
                <td>

                </td>
                <td>

                </td>
                <td>
                  <h5>Chi phí vận chuyển</h5>
                </td>
                <td>
                  <div class="shipping_box">
                    <ul class="list">
                      <li><a href="#">Flat Rate: $5.00</a></li>
                      <li><a href="#">Free Shipping</a></li>
                      <li><a href="#">Flat Rate: $10.00</a></li>
                      <li class="active"><a href="#">Local Delivery: $2.00</a></li>
                    </ul>
                    <h6>Calculate Shipping <i class="fa fa-caret-down" aria-hidden="true"></i></h6>
                    <select class="shipping_select">
                      <option value="1">Bangladesh</option>
                      <option value="2">India</option>
                      <option value="4">Pakistan</option>
                    </select>
                    <select class="shipping_select">
                      <option value="1">Select a State</option>
                      <option value="2">Select a State</option>
                      <option value="4">Select a State</option>
                    </select>
                    <input type="text" placeholder="Postcode/Zipcode">
                    <a class="gray_btn" href="#">Update Details</a>
                  </div>
                </td>
              </tr>
              <tr class="out_button_area">
                <td>

                </td>
                <td>

                </td>
                <td>

                </td>
                <td>

                </td>
                <td>
                  <div class="checkout_btn_inner d-flex align-items-center">
                    <a class="gray_btn" href="#">Tiếp tục mua sắm</a>
                    <a class="primary-btn" href="#">Tiến hành thanh toán</a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
  <!--================End Cart Area =================-->
</template>

<style lang="scss" scoped>
.btn-action {
  color: #999;
  font-size: 20px;

  i {
    font-weight: 600;
  }
}

.container {
  .table-responsive {
    .btn-delete-all {
      margin: 0 0 10px 30px;
      border-radius: 10px;

      &:focus {
        box-shadow: none;
      }
    }
  }
}
</style>
