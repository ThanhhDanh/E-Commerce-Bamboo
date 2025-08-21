<script setup>
import { RouterView } from 'vue-router'
import HeaderView from './components/layouts/HeaderView.vue';
import FooterView from './components/layouts/FooterView.vue';
</script>

<template>
  <HeaderView />
  <main>
    <RouterView />
  </main>
  <FooterView />
</template>
