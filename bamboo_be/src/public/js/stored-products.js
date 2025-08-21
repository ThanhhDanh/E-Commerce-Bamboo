document.addEventListener('DOMContentLoaded', function () {
    var productId;
    var deleteForm = document.forms['delete-product-form'];
    var btnDeleteProduct = document.getElementById('btn-delete-product');
    var checkboxAll = $('#checkbox-all');
    var productItemCheckbox = $('input[name="productIds[]"]');
    var checkAllSubmitBtn = $('.btn-check-all');

    $('#delete-product-modal').on('show.bs.modal', function (e) {
        var button = $(e.relatedTarget);
        productId = button.data('id');
    });

    btnDeleteProduct.onclick = function () {
        deleteForm.action = '/products/' + productId + '?_method=DELETE';
        deleteForm.submit();
    };

    checkboxAll.change(function () {
        var isCheckedAll = $(this).prop('checked');
        if (isCheckedAll) {
            productItemCheckbox.prop('checked', true);
            renderCheckAllSubmitBtn();
        } else {
            productItemCheckbox.prop('checked', false);
            renderCheckAllSubmitBtn();
        }
    });

    productItemCheckbox.change(function () {
        var isCheckedAll = productItemCheckbox.length === $('input[name="productIds[]"]:checked').length;
        checkboxAll.prop('checked', isCheckedAll);
        renderCheckAllSubmitBtn();
    });

    function renderCheckAllSubmitBtn() {
        var checkedCount = $('input[name="productIds[]"]:checked').length;
        if (checkedCount > 0) {
            checkAllSubmitBtn.removeClass('disabled');
        } else {
            checkAllSubmitBtn.addClass('disabled');
        }
    }
});
