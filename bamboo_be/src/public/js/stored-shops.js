document.addEventListener('DOMContentLoaded', function () {
    var shopId;
    var deleteForm = document.forms['delete-shop-form'];
    var btnDeleteShop = document.getElementById('btn-delete-shop');
    var checkboxAll = $('#checkbox-all');
    var shopItemCheckbox = $('input[name="shopIds[]"]');
    var checkAllSubmitBtn = $('.btn-check-all');

    // Hiển thị modal xóa
    $('#delete-shop-modal').on('show.bs.modal', function (e) {
        var button = $(e.relatedTarget);
        shopId = button.data('id');
    });

    // Xử lý khi nhấn nút xóa
    btnDeleteShop.onclick = function () {
        deleteForm.action = '/shops/' + shopId + '?_method=DELETE';
        deleteForm.submit();
    };

    // Checkbox "Chọn tất cả"
    checkboxAll.change(function () {
        var isCheckedAll = $(this).prop('checked');
        if (isCheckedAll) {
            shopItemCheckbox.prop('checked', true);
        } else {
            shopItemCheckbox.prop('checked', false);
        }
        renderCheckAllSubmitBtn();
    });

    // Checkbox từng mục
    shopItemCheckbox.change(function () {
        var isCheckedAll = shopItemCheckbox.length === $('input[name="shopIds[]"]:checked').length;
        checkboxAll.prop('checked', isCheckedAll);
        renderCheckAllSubmitBtn();
    });

    // Cập nhật trạng thái nút "Xóa tất cả"
    function renderCheckAllSubmitBtn() {
        var checkedCount = $('input[name="shopIds[]"]:checked').length;
        if (checkedCount > 0) {
            checkAllSubmitBtn.removeClass('disabled');
        } else {
            checkAllSubmitBtn.addClass('disabled');
        }
    }
});
