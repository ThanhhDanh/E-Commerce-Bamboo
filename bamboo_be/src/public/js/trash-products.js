document.addEventListener('DOMContentLoaded', function () {
    var productId;
    var deleteForm = document.forms['delete-product-form'];
    var restoreForm = document.forms['restore-product-form'];
    var btnDeleteProduct = document.getElementById('btn-delete-product');
    var btnRestore = $('.btn-restore');

    // Hiển thị modal xóa
    $('#delete-product-modal').on('show.bs.modal', function (e) {
        var button = $(e.relatedTarget);
        productId = button.data('id');
    });

    // Xử lý khi nhấn nút xóa
    btnDeleteProduct.onclick = function () {
        deleteForm.action = '/products/' + productId + '/force?_method=DELETE';
        deleteForm.submit();
    };

    // Xử lý khi nhấn nút khôi phục
    btnRestore.click(function (e) {
        e.preventDefault();
        var productId = $(this).data('id');
        restoreForm.action = '/products/' + productId + '/restore?_method=PATCH';
        restoreForm.submit();
    });
});
