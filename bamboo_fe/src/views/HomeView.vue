<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { products } from '@/database/product'
import { useStore } from 'vuex';
import { notifyAddCartSuccess, notifyAddCartError } from '@/mixins/cart'
import ToastView from '@/utils/ToastView.vue';


const store = useStore()
const msg = ref('')
const msgType = ref('success')
const showToast = ref(false)

const handleAddToCart = (product) => {
  if (!product || !product.id) {
    notifyAddCartError(msg, msgType, showToast)
    return
  }
  store.dispatch('cart/addToCart', product)
  notifyAddCartSuccess(msg, msgType, showToast)

}


function setFullscreenHeight() {
  const windowHeight = window.innerHeight;
  const fullscreenEls = document.querySelectorAll('.fullscreen');
  fullscreenEls.forEach(el => {
    el.style.height = windowHeight + 'px';
  });
}

function initOwlCarousel() {
  if (window.$ && $('.owl-carousel').owlCarousel) {
    // Destroy nếu đã khởi tạo trước đó để tránh lỗi
    $('.owl-carousel').each(function () {
      if ($(this).data('owl.carousel')) {
        $(this).trigger('destroy.owl.carousel');
        $(this).removeClass('owl-loaded');
        $(this).find('.owl-stage-outer').children().unwrap();
      }
    });
    // Khởi tạo lại
    $('.active-banner-slider').owlCarousel({
      items: 1,
      autoplay: false,
      autoplayTimeout: 5000,
      loop: true,
      nav: true,
      navText: ["<img src='img/banner/prev.png'>", "<img src='img/banner/next.png'>"],
      dots: false
    });
    $('.active-product-area').owlCarousel({
      items: 1,
      autoplay: false,
      autoplayTimeout: 5000,
      loop: true,
      nav: true,
      navText: ["<img src='img/product/prev.png'>", "<img src='img/product/next.png'>"],
      dots: false
    });
    $('.active-exclusive-product-slider').owlCarousel({
      items: 1,
      autoplay: false,
      autoplayTimeout: 5000,
      loop: true,
      nav: true,
      navText: ["<img src='img/product/prev.png'>", "<img src='img/product/next.png'>"],
      dots: false
    });
  }
}

onMounted(() => {
  setFullscreenHeight();
  window.addEventListener('resize', setFullscreenHeight);
  setTimeout(initOwlCarousel, 0); // Đợi DOM render xong mới khởi tạo
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', setFullscreenHeight);
});
</script>

<template>
  <ToastView :message="msg" :type="msgType" :show="showToast" />
  <!-- start banner Area -->
  <section class="banner-area">
    <div class="container">
      <div class="row fullscreen align-items-center justify-content-start">
        <div class="col-lg-12">
          <div class="active-banner-slider owl-carousel">
            <!-- single-slide -->
            <div class="row single-slide align-items-center d-flex">
              <div class="col-lg-5 col-md-6">
                <div class="banner-content">
                  <h1>Nike Mới <br>Bộ sưu tập!</h1>
                  <p></p>
                  <div class="add-bag d-flex align-items-center">
                    <a class="add-btn" href=""><span class="lnr lnr-cross"></span></a>
                    <span class="add-text text-uppercase">Thêm vào giỏ</span>
                  </div>
                </div>
              </div>
              <div class="col-lg-7">
                <div class="banner-img">
                  <img class="img-fluid" src="/img/banner/banner-img.png" alt="">
                </div>
              </div>
            </div>
            <!-- single-slide -->
            <div class="row single-slide">
              <div class="col-lg-5">
                <div class="banner-content">
                  <h1>Nike Mới <br>Bộ sưu tập!</h1>
                  <p></p>
                  <div class="add-bag d-flex align-items-center">
                    <a class="add-btn" href=""><span class="lnr lnr-cross"></span></a>
                    <span class="add-text text-uppercase">Thêm vào giỏ</span>
                  </div>
                </div>
              </div>
              <div class="col-lg-7">
                <div class="banner-img">
                  <img class="img-fluid" src="/img/banner/banner-img.png" alt="">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <!-- End banner Area -->

  <!-- start features Area -->
  <section class="features-area section_gap">
    <div class="container">
      <div class="row features-inner">
        <!-- single features -->
        <div class="col-lg-3 col-md-6 col-sm-6">
          <div class="single-features">
            <div class="f-icon">
              <img src="/img/features/f-icon1.png" alt="">
            </div>
            <h6>Giao hàng miễn phí</h6>
            <p>Miễn phí vận chuyển cho tất cả các đơn hàng</p>
          </div>
        </div>
        <!-- single features -->
        <div class="col-lg-3 col-md-6 col-sm-6">
          <div class="single-features">
            <div class="f-icon">
              <img src="/img/features/f-icon2.png" alt="">
            </div>
            <h6>Chính sách đổi trả</h6>
            <p>Miễn phí vận chuyển cho tất cả các đơn hàng</p>
          </div>
        </div>
        <!-- single features -->
        <div class="col-lg-3 col-md-6 col-sm-6">
          <div class="single-features">
            <div class="f-icon">
              <img src="/img/features/f-icon3.png" alt="">
            </div>
            <h6>24/7 Hỗ trợ</h6>
            <p>Miễn phí vận chuyển cho tất cả các đơn hàng</p>
          </div>
        </div>
        <!-- single features -->
        <div class="col-lg-3 col-md-6 col-sm-6">
          <div class="single-features">
            <div class="f-icon">
              <img src="/img/features/f-icon4.png" alt="">
            </div>
            <h6>Thanh toán an toàn</h6>
            <p>Miễn phí vận chuyển cho tất cả các đơn hàng</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  <!-- end features Area -->

  <!-- Start category Area -->
  <section class="category-area">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8 col-md-12">
          <div class="row">
            <div class="col-lg-8 col-md-8">
              <div class="single-deal">
                <div class="overlay"></div>
                <img class="img-fluid w-100" src="/img/category/c1.jpg" alt="">
                <a href="img/category/c1.jpg" class="img-pop-up" target="_blank">
                  <div class="deal-details">
                    <h6 class="deal-title">Giày thể thao</h6>
                  </div>
                </a>
              </div>
            </div>
            <div class="col-lg-4 col-md-4">
              <div class="single-deal">
                <div class="overlay"></div>
                <img class="img-fluid w-100" src="/img/category/c2.jpg" alt="">
                <a href="img/category/c2.jpg" class="img-pop-up" target="_blank">
                  <div class="deal-details">
                    <h6 class="deal-title">Giày thể thao</h6>
                  </div>
                </a>
              </div>
            </div>
            <div class="col-lg-4 col-md-4">
              <div class="single-deal">
                <div class="overlay"></div>
                <img class="img-fluid w-100" src="/img/category/c3.jpg" alt="">
                <a href="img/category/c3.jpg" class="img-pop-up" target="_blank">
                  <div class="deal-details">
                    <h6 class="deal-title">Sản phẩm cho cặp đôi</h6>
                  </div>
                </a>
              </div>
            </div>
            <div class="col-lg-8 col-md-8">
              <div class="single-deal">
                <div class="overlay"></div>
                <img class="img-fluid w-100" src="/img/category/c4.jpg" alt="">
                <a href="img/category/c4.jpg" class="img-pop-up" target="_blank">
                  <div class="deal-details">
                    <h6 class="deal-title">Giày thể thao</h6>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-4 col-md-6">
          <div class="single-deal">
            <div class="overlay"></div>
            <img class="img-fluid w-100" src="/img/category/c5.jpg" alt="">
            <a href="img/category/c5.jpg" class="img-pop-up" target="_blank">
              <div class="deal-details">
                <h6 class="deal-title">Giày thể thao</h6>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
  <!-- End category Area -->

  <!-- start product Area -->
  <section class="owl-carousel active-product-area section_gap">
    <!-- single product slide -->
    <div class="single-product-slider">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-6 text-center">
            <div class="section-title">
              <h1>Sản phẩm mới nhất</h1>
              <p></p>
            </div>
          </div>
        </div>
        <div class="row">
          <div v-for="product in products" :key="product.id" class="col-lg-3 col-md-6">
            <div class="single-product">
              <img class="img-fluid" :src="product.image" :alt="product.name">
              <div class="product-details">
                <h6>{{ product.name }}</h6>
                <div class="price">
                  <h6>${{ product.price }}.00</h6>
                  <h6 class="l-through">${{ product.oldPrice }}.00</h6>
                </div>
                <div class="prd-bottom">
                  <a @click.prevent="handleAddToCart(product)" href="" class="social-info">
                    <span class="ti-bag"></span>
                    <p class="hover-text">Thêm vào giỏ hàng</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-heart"></span>
                    <p class="hover-text">Danh sách yêu thích</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-sync"></span>
                    <p class="hover-text">So sánh</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-move"></span>
                    <p class="hover-text">Xem thêm</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- single product slide -->
    <div class="single-product-slider">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-6 text-center">
            <div class="section-title">
              <h1>Sản phẩm ra mắt</h1>
              <p></p>
            </div>
          </div>
        </div>
        <div class="row">
          <!-- single product -->
          <div class="col-lg-3 col-md-6">
            <div class="single-product">
              <img class="img-fluid" src="/img/product/p6.jpg" alt="">
              <div class="product-details">
                <h6>Giày thể thao</h6>
                <div class="price">
                  <h6>$150.00</h6>
                  <h6 class="l-through">$210.00</h6>
                </div>
                <div class="prd-bottom">

                  <a href="" class="social-info">
                    <span class="ti-bag"></span>
                    <p class="hover-text">Thêm vào giỏ hàng</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-heart"></span>
                    <p class="hover-text">Danh sách yêu thích</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-sync"></span>
                    <p class="hover-text">So sánh</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-move"></span>
                    <p class="hover-text">Xem thêm</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <!-- single product -->
          <div class="col-lg-3 col-md-6">
            <div class="single-product">
              <img class="img-fluid" src="/img/product/p8.jpg" alt="">
              <div class="product-details">
                <h6>Giày thể thao</h6>
                <div class="price">
                  <h6>$150.00</h6>
                  <h6 class="l-through">$210.00</h6>
                </div>
                <div class="prd-bottom">

                  <a href="" class="social-info">
                    <span class="ti-bag"></span>
                    <p class="hover-text">Thêm vào giỏ hàng</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-heart"></span>
                    <p class="hover-text">Danh sách yêu thích</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-sync"></span>
                    <p class="hover-text">So sánh</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-move"></span>
                    <p class="hover-text">Xem thêm</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <!-- single product -->
          <div class="col-lg-3 col-md-6">
            <div class="single-product">
              <img class="img-fluid" src="/img/product/p3.jpg" alt="">
              <div class="product-details">
                <h6>Giày thể thao</h6>
                <div class="price">
                  <h6>$150.00</h6>
                  <h6 class="l-through">$210.00</h6>
                </div>
                <div class="prd-bottom">

                  <a href="" class="social-info">
                    <span class="ti-bag"></span>
                    <p class="hover-text">Thêm vào giỏ hàng</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-heart"></span>
                    <p class="hover-text">Danh sách yêu thích</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-sync"></span>
                    <p class="hover-text">So sánh</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-move"></span>
                    <p class="hover-text">Xem thêm</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <!-- single product -->
          <div class="col-lg-3 col-md-6">
            <div class="single-product">
              <img class="img-fluid" src="/img/product/p5.jpg" alt="">
              <div class="product-details">
                <h6>Giày thể thao</h6>
                <div class="price">
                  <h6>$150.00</h6>
                  <h6 class="l-through">$210.00</h6>
                </div>
                <div class="prd-bottom">

                  <a href="" class="social-info">
                    <span class="ti-bag"></span>
                    <p class="hover-text">Thêm vào giỏ hàng</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-heart"></span>
                    <p class="hover-text">Danh sách yêu thích</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-sync"></span>
                    <p class="hover-text">So sánh</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-move"></span>
                    <p class="hover-text">Xem thêm</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <!-- single product -->
          <div class="col-lg-3 col-md-6">
            <div class="single-product">
              <img class="img-fluid" src="/img/product/p1.jpg" alt="">
              <div class="product-details">
                <h6>Giày thể thao</h6>
                <div class="price">
                  <h6>$150.00</h6>
                  <h6 class="l-through">$210.00</h6>
                </div>
                <div class="prd-bottom">

                  <a href="" class="social-info">
                    <span class="ti-bag"></span>
                    <p class="hover-text">Thêm vào giỏ hàng</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-heart"></span>
                    <p class="hover-text">Danh sách yêu thích</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-sync"></span>
                    <p class="hover-text">So sánh</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-move"></span>
                    <p class="hover-text">Xem thêm</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <!-- single product -->
          <div class="col-lg-3 col-md-6">
            <div class="single-product">
              <img class="img-fluid" src="/img/product/p4.jpg" alt="">
              <div class="product-details">
                <h6>Giày thể thao</h6>
                <div class="price">
                  <h6>$150.00</h6>
                  <h6 class="l-through">$210.00</h6>
                </div>
                <div class="prd-bottom">

                  <a href="" class="social-info">
                    <span class="ti-bag"></span>
                    <p class="hover-text">Thêm vào giỏ hàng</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-heart"></span>
                    <p class="hover-text">Danh sách yêu thích</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-sync"></span>
                    <p class="hover-text">So sánh</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-move"></span>
                    <p class="hover-text">Xem thêm</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <!-- single product -->
          <div class="col-lg-3 col-md-6">
            <div class="single-product">
              <img class="img-fluid" src="/img/product/p1.jpg" alt="">
              <div class="product-details">
                <h6>Giày thể thao</h6>
                <div class="price">
                  <h6>$150.00</h6>
                  <h6 class="l-through">$210.00</h6>
                </div>
                <div class="prd-bottom">

                  <a href="" class="social-info">
                    <span class="ti-bag"></span>
                    <p class="hover-text">Thêm vào giỏ hàng</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-heart"></span>
                    <p class="hover-text">Danh sách yêu thích</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-sync"></span>
                    <p class="hover-text">So sánh</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-move"></span>
                    <p class="hover-text">Xem thêm</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <!-- single product -->
          <div class="col-lg-3 col-md-6">
            <div class="single-product">
              <img class="img-fluid" src="/img/product/p8.jpg" alt="">
              <div class="product-details">
                <h6>Giày thể thao</h6>
                <div class="price">
                  <h6>$150.00</h6>
                  <h6 class="l-through">$210.00</h6>
                </div>
                <div class="prd-bottom">

                  <a href="" class="social-info">
                    <span class="ti-bag"></span>
                    <p class="hover-text">Thêm vào giỏ hàng</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-heart"></span>
                    <p class="hover-text">Danh sách yêu thích</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-sync"></span>
                    <p class="hover-text">So sánh</p>
                  </a>
                  <a href="" class="social-info">
                    <span class="lnr lnr-move"></span>
                    <p class="hover-text">Xem thêm</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <!-- end product Area -->

  <!-- Start exclusive deal Area -->
  <section class="exclusive-deal-area">
    <div class="container-fluid">
      <div class="row justify-content-center align-items-center">
        <div class="col-lg-6 no-padding exclusive-left">
          <div class="row clock_sec clockdiv" id="clockdiv">
            <div class="col-lg-12">
              <h1>Thời gian sẽ kết thúc sớm!</h1>
              <p>Những người yêu thích hệ thống thân thiện với môi trường.</p>
            </div>
            <div class="col-lg-12">
              <div class="row clock-wrap">
                <div class="col clockinner1 clockinner">
                  <h1 class="days">150</h1>
                  <span class="smalltext">Ngày</span>
                </div>
                <div class="col clockinner clockinner1">
                  <h1 class="hours">23</h1>
                  <span class="smalltext">Tiếng</span>
                </div>
                <div class="col clockinner clockinner1">
                  <h1 class="minutes">47</h1>
                  <span class="smalltext">Phút</span>
                </div>
                <div class="col clockinner clockinner1">
                  <h1 class="seconds">59</h1>
                  <span class="smalltext">Giây</span>
                </div>
              </div>
            </div>
          </div>
          <a href="" class="primary-btn">Mua ngay</a>
        </div>
        <div class="col-lg-6 no-padding exclusive-right">
          <div class="active-exclusive-product-slider">
            <!-- single exclusive carousel -->
            <div class="single-exclusive-slider">
              <img class="img-fluid" src="/img/product/e-p1.png" alt="">
              <div class="product-details">
                <div class="price">
                  <h6>$150.00</h6>
                  <h6 class="l-through">$210.00</h6>
                </div>
                <h4>Giày thể thao</h4>
                <div class="add-bag d-flex align-items-center justify-content-center">
                  <a class="add-btn" href=""><span class="ti-bag"></span></a>
                  <span class="add-text text-uppercase">Thêm vào giỏ hàng</span>
                </div>
              </div>
            </div>
            <!-- single exclusive carousel -->
            <div class="single-exclusive-slider">
              <img class="img-fluid" src="/img/product/e-p1.png" alt="">
              <div class="product-details">
                <div class="price">
                  <h6>$150.00</h6>
                  <h6 class="l-through">$210.00</h6>
                </div>
                <h4>Giày thể thao</h4>
                <div class="add-bag d-flex align-items-center justify-content-center">
                  <a class="add-btn" href=""><span class="ti-bag"></span></a>
                  <span class="add-text text-uppercase">Thêm vào giỏ hàng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <!-- End exclusive deal Area -->

  <!-- Start brand Area -->
  <section class="brand-area section_gap">
    <div class="container">
      <div class="row">
        <a class="col single-img" href="#">
          <img class="img-fluid d-block mx-auto" src="/img/brand/1.png" alt="">
        </a>
        <a class="col single-img" href="#">
          <img class="img-fluid d-block mx-auto" src="/img/brand/2.png" alt="">
        </a>
        <a class="col single-img" href="#">
          <img class="img-fluid d-block mx-auto" src="/img/brand/3.png" alt="">
        </a>
        <a class="col single-img" href="#">
          <img class="img-fluid d-block mx-auto" src="/img/brand/4.png" alt="">
        </a>
        <a class="col single-img" href="#">
          <img class="img-fluid d-block mx-auto" src="/img/brand/5.png" alt="">
        </a>
      </div>
    </div>
  </section>
  <!-- End brand Area -->

  <!-- Start related-product Area -->
  <section class="related-product-area section_gap_bottom">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-6 text-center">
          <div class="section-title">
            <h1>Ưu đãi trong tuần</h1>
            <p></p>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-9">
          <div class="row">
            <div class="col-lg-4 col-md-4 col-sm-6 mb-20">
              <div class="single-related-product d-flex">
                <a href="#"><img src="/img/r1.jpg" alt=""></a>
                <div class="desc">
                  <a href="#" class="title">Giày cao gót đen</a>
                  <div class="price">
                    <h6>$189.00</h6>
                    <h6 class="l-through">$210.00</h6>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-4 col-md-4 col-sm-6 mb-20">
              <div class="single-related-product d-flex">
                <a href="#"><img src="/img/r2.jpg" alt=""></a>
                <div class="desc">
                  <a href="#" class="title">Giày cao gót đen</a>
                  <div class="price">
                    <h6>$189.00</h6>
                    <h6 class="l-through">$210.00</h6>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-4 col-md-4 col-sm-6 mb-20">
              <div class="single-related-product d-flex">
                <a href="#"><img src="/img/r3.jpg" alt=""></a>
                <div class="desc">
                  <a href="#" class="title">Giày cao gót đen</a>
                  <div class="price">
                    <h6>$189.00</h6>
                    <h6 class="l-through">$210.00</h6>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-4 col-md-4 col-sm-6 mb-20">
              <div class="single-related-product d-flex">
                <a href="#"><img src="/img/r5.jpg" alt=""></a>
                <div class="desc">
                  <a href="#" class="title">Giày cao gót đen</a>
                  <div class="price">
                    <h6>$189.00</h6>
                    <h6 class="l-through">$210.00</h6>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-4 col-md-4 col-sm-6 mb-20">
              <div class="single-related-product d-flex">
                <a href="#"><img src="/img/r6.jpg" alt=""></a>
                <div class="desc">
                  <a href="#" class="title">Giày cao gót đen</a>
                  <div class="price">
                    <h6>$189.00</h6>
                    <h6 class="l-through">$210.00</h6>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-4 col-md-4 col-sm-6 mb-20">
              <div class="single-related-product d-flex">
                <a href="#"><img src="/img/r7.jpg" alt=""></a>
                <div class="desc">
                  <a href="#" class="title">Giày cao gót đen</a>
                  <div class="price">
                    <h6>$189.00</h6>
                    <h6 class="l-through">$210.00</h6>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-4 col-md-4 col-sm-6">
              <div class="single-related-product d-flex">
                <a href="#"><img src="/img/r9.jpg" alt=""></a>
                <div class="desc">
                  <a href="#" class="title">Giày cao gót đen</a>
                  <div class="price">
                    <h6>$189.00</h6>
                    <h6 class="l-through">$210.00</h6>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-4 col-md-4 col-sm-6">
              <div class="single-related-product d-flex">
                <a href="#"><img src="/img/r10.jpg" alt=""></a>
                <div class="desc">
                  <a href="#" class="title">Giày cao gót đen</a>
                  <div class="price">
                    <h6>$189.00</h6>
                    <h6 class="l-through">$210.00</h6>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-4 col-md-4 col-sm-6">
              <div class="single-related-product d-flex">
                <a href="#"><img src="/img/r11.jpg" alt=""></a>
                <div class="desc">
                  <a href="#" class="title">Giày cao gót đen</a>
                  <div class="price">
                    <h6>$189.00</h6>
                    <h6 class="l-through">$210.00</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3">
          <div class="ctg-right">
            <a href="#" target="_blank">
              <img class="img-fluid d-block mx-auto" src="/img/category/c5.jpg" alt="">
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
  <!-- End related-product Area -->
</template>
