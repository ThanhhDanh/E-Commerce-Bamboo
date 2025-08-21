export function notifyAddCartSuccess(msg, msgType, showToast) {
  msg.value = 'Thêm vào giỏ hàng thành công!'
  msgType.value = 'success'
  showToast.value = false
  setTimeout(() => {
    showToast.value = true
  }, 0)
}

export function notifyAddCartError(msg, msgType, showToast) {
  msg.value = 'Có lỗi xảy ra!'
  msgType.value = 'error'
  showToast.value = false
  setTimeout(() => {
    showToast.value = true
  }, 0)
}
