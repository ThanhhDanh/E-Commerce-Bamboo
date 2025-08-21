<template>
  <!-- Start Banner Area -->
  <section class="banner-area organic-breadcrumb">
    <div class="container">
      <div class="breadcrumb-banner d-flex flex-wrap align-items-center justify-content-end">
        <div class="col-first">
          <h1>Đăng nhập/Đăng ký</h1>
          <nav class="d-flex align-items-center">
            <a href="index.html">Trang chủ<span class="lnr lnr-arrow-right"></span></a>
            <a href="category.html">Đăng nhập/Đăng ký</a>
          </nav>
        </div>
      </div>
    </div>
  </section>
  <!-- End Banner Area -->

  <!--================Login Box Area =================-->
  <section class="login_box_area section_gap">
    <div class="container">
      <div class="row" :class="{ 'reverse-order': !isLoggedIn }">
        <div class="col-lg-6">
          <div class="login_box_img">
            <img class="img-fluid" src="/img/login.jpg" alt="">
            <div class="hover">
              <h4>{{ isLoggedIn ? 'Chào mừng bạn tới cửa hàng?' : 'Đã có tài khoản?' }}</h4>
              <p>Có những tiến bộ được thực hiện trong khoa học và công nghệ hàng ngày, và một ví dụ điển hình về điều
                này là</p>
              <a class="primary-btn" href="#" @click.prevent="isLoggedIn ? showRegisterForm() : showLoginForm()">
                {{ isLoggedIn ? 'Tạo tài khoản' : 'Đăng nhập ngay' }}
              </a>
            </div>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="login_form_inner">
            <h3 v-if="isLoggedIn">Đăng nhập</h3>
            <h3 v-else>Tạo tài khoản</h3>

            <!-- Login Form -->
            <form v-if="isLoggedIn" class="row login_form" @submit.prevent="login" novalidate>
              <div class="col-md-12 form-group">
                <input type="text" class="form-control" autocomplete="username" v-model="name"
                  placeholder="Tên đăng nhập">
              </div>
              <div class="col-md-12 form-group">
                <input type="password" class="form-control" autocomplete="current-password" v-model="password"
                  placeholder="Mật khẩu">
              </div>
              <div class="col-md-12 form-group">
                <div class="creat_account">
                  <input type="checkbox" id="f-option2" name="selector">
                  <label for="f-option2">Ghi nhớ đăng nhập</label>
                </div>
              </div>
              <div class="col-md-12 form-group">
                <button type="submit" class="primary-btn">Đăng nhập</button>
                <a href="#">Quên mật khẩu?</a>
              </div>
            </form>

            <!-- Register Form -->
            <form v-else class="row login_form" @submit.prevent="register" novalidate>
              <div class="col-md-12 form-group">
                <input type="text" class="form-control" placeholder="Tên đăng nhập">
              </div>
              <div class="col-md-12 form-group">
                <input type="email" class="form-control" placeholder="Email">
              </div>
              <div class="col-md-12 form-group">
                <input type="password" class="form-control" placeholder="Mật khẩu">
              </div>
              <div class="col-md-12 form-group">
                <button type="submit" class="primary-btn">Đăng ký</button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  </section>

  <!--================End Login Box Area =================-->
  <ToastView :message="msg" :type="msgType" :show="showToast" />
</template>

<script setup>
import router from '@/router'
import ToastView from '@/utils/ToastView.vue'
import { ref } from 'vue'
import { useStore } from 'vuex'
import { notifyLoginSuccess, notifyLoginError, notifyRegistrationSuccess } from '@/mixins/login'

const msg = ref('')
const msgType = ref('success')
const showToast = ref(false)
const name = ref('')
const password = ref('')
const isLoggedIn = ref(true)

const store = useStore()


function showRegisterForm() {
  isLoggedIn.value = false
}

function showLoginForm() {
  isLoggedIn.value = true
}



const login = () => {
  if (name.value === 'danh' && password.value === '123') {
    store.dispatch('auth/login', { user: { name: name.value }, token: 'access-token' })
    notifyLoginSuccess(msg, msgType, showToast)
    name.value = ''
    password.value = ''
    setTimeout(() => {
      router.push('/')
    }, 1000)
  } else {
    notifyLoginError(msg, msgType, showToast)
  }
}

const register = () => {
  // Registration logic here
  notifyRegistrationSuccess(msg, msgType, showToast)
  setTimeout(() => {
    showLoginForm()
  }, 1000)
}
</script>
