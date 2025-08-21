export function notifyLoginSuccess(msg, msgType, showToast) {
  msg.value = 'Đăng nhập thành công!'
  msgType.value = 'success'
  showToast.value = false
  setTimeout(() => {
    showToast.value = true
  }, 0)
}

export function notifyLoginError(msg, msgType, showToast) {
  msg.value = 'Có lỗi xảy ra!'
  msgType.value = 'error'
  showToast.value = false
  setTimeout(() => {
    showToast.value = true
  }, 0)
}

export function notifyRegistrationSuccess(msg, msgType, showToast) {
  msg.value = 'Đăng ký thành công!'
  msgType.value = 'success'
  showToast.value = false
  setTimeout(() => {
    showToast.value = true
  }, 0)
}
