<script setup>
import { toast } from 'vue3-toastify'
import { watch } from 'vue'

const props = defineProps({
  message: String,
  type: {
    type: String,
    default: 'info' // 'success', 'error', 'warning', 'info'
  },
  show: Boolean
})

// Khi prop show đổi sang true thì tự động show toast
watch(() => props.show, (val) => {
  if (val && props.message) {
    toast[props.type](props.message)
  }
})
</script>

<template>
  <span></span>
</template>
