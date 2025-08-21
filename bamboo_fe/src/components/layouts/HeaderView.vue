<script setup>
import router from '@/router';
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

const dropdownOpen = ref(false)
const store = useStore();

const isAuthenticated = computed(() => store.state.auth.isAuthenticated)
const user = computed(() => store.state.auth.user)

const logout = () => {
  store.dispatch('auth/logout')
  router.push('/')
}

const cartItemCount = computed(() => store.getters['cart/cartItemCount'])


const languages = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' }
]

const currentLang = computed(() => store.state.lang.locale)

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const selectLang = (langCode) => {
  store.dispatch('lang/changeLang', langCode)
  dropdownOpen.value = false
}

</script>

<template>
  <header class="header_area sticky-header">
    <div class="main_menu">
      <nav class="navbar navbar-expand-lg navbar-light main_box">
        <div class="container">
          <!-- Brand and toggle get grouped for better mobile display -->
          <router-link class="navbar-brand logo_h" to="/"><img src="/img/logo.png" alt=""></router-link>
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <!-- Collect the nav links, forms, and other content for toggling -->
          <div class="collapse navbar-collapse offset" id="navbarSupportedContent">
            <ul class="nav navbar-nav menu_nav ml-auto">
              <router-link class="nav-item" to="/">
                <li><a class="nav-link" href="">{{ $t('header.home') }}</a></li>
              </router-link>
              <li class="nav-item submenu dropdown">
                <a href="#" class="nav-link dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true"
                  aria-expanded="false">{{ $t('header.shop') }}</a>
                <ul class="dropdown-menu">
                  <router-link to="/category">
                    <li class="nav-item"><a class="nav-link" href="">{{ $t('header.shopCategory') }}</a></li>
                  </router-link>
                  <router-link to="/product/detail">
                    <li class="nav-item"><a class="nav-link" href="">{{ $t('header.productDetails') }}</a></li>
                  </router-link>
                  <router-link to="/checkout">
                    <li class="nav-item"><a class="nav-link" href="">{{ $t('header.productCheckout') }}</a></li>
                  </router-link>
                  <router-link to="/cart">
                    <li class="nav-item"><a class="nav-link" href="">{{ $t('header.shoppingCart') }}</a></li>
                  </router-link>
                  <router-link to="/confirmation">
                    <li class="nav-item"><a class="nav-link" href="">{{ $t('header.confirmation') }}</a></li>
                  </router-link>
                </ul>
              </li>
              <!-- <li class="nav-item submenu dropdown">
                <a href="#" class="nav-link dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true"
                  aria-expanded="false">Blog</a>
                <ul class="dropdown-menu">
                  <li class="nav-item"><a class="nav-link" href="blog.html">Blog</a></li>
                  <li class="nav-item"><a class="nav-link" href="single-blog.html">Blog Details</a></li>
                </ul>
              </li> -->
              <router-link class="nav-item" to="/contact">
                <li><a class="nav-link" href="">{{ $t('header.contact') }}</a></li>
              </router-link>
              <router-link v-if="!isAuthenticated" class="nav-item" to="/login">
                <li><a class="nav-link" href="">{{ $t('header.login') }}</a></li>
              </router-link>
              <li v-if="isAuthenticated" class="nav-item submenu dropdown">
                <a href="#" class="nav-link dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true"
                  aria-expanded="false">{{ user.name }}</a>
                <ul class="dropdown-menu">
                  <router-link :to="{ name: 'profile', params: { username: user.name } }">
                    <li class="nav-item"><a class="nav-link" href="">{{ $t('header.profile') }}</a></li>
                  </router-link>
                  <li class="nav-item"><a class="nav-link" href="">{{ $t('header.settings') }}</a></li>
                  <li class="nav-item" @click.prevent="logout"><a class="nav-link" href="">{{ $t('header.logout') }}</a>
                  </li>
                </ul>
              </li>
              <li class="nav-item submenu dropdown language-dropdown">
                <button class="language-btn nav-link" @click="toggleDropdown">
                  <i class="fa fa-globe"></i> {{ currentLang.toUpperCase() }}
                </button>
                <ul class="dropdown-menu" v-show="dropdownOpen">
                  <li class="nav-item" v-for="lang in languages" :key="lang.code">
                    <button class="dropdown-item nav-link" :class="{ active: currentLang === lang.code }"
                      @click="selectLang(lang.code)">
                      {{ lang.label }}
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
            <ul class="nav navbar-nav navbar-right">
              <router-link to="/cart">
                <li class="nav-item"><a href="#" class="cart">
                    <span class="ti-bag"></span>
                    <span class="cart-count">{{ cartItemCount }}</span>
                  </a></li>
              </router-link>
              <li class="nav-item">
                <button class="search"><span class="lnr lnr-magnifier" id="search"></span></button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
    <div class="search_input" id="search_input_box">
      <div class="container">
        <form class="d-flex justify-content-between">
          <input type="text" class="form-control" id="search_input" :placeholder="$t('header.searchPlaceholder')"
            @focus="event => event.target.placeholder = ''"
            @blur="event => event.target.placeholder = $t('header.searchPlaceholder')">
          <button type="submit" class="btn"></button>
          <span class="lnr lnr-cross" id="close_search" title="{{ $t('header.closeSearch') }}"></span>
        </form>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@media (min-width: 992px) {
  .language-dropdown {
    width: 40px;
  }
}

.language-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px !important;
}

.dropdown-menu {
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  list-style: none;
  padding: 8px;
  margin: 0;
  top: 100%;
  left: 0;
  z-index: 1000;
}

.dropdown-item {
  display: block;
  padding: 6px 12px;
  width: 100%;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
}

.dropdown-item.active {
  background: #ffba00;
  color: #fff !important;
  border-color: #ffba00;
}
</style>
