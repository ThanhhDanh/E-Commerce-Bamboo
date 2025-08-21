document.addEventListener('DOMContentLoaded', function () {
    var shopId;
    var deleteForm = document.forms['delete-shop-form'];
    var restoreForm = document.forms['restore-shop-form'];
    var btnDeleteShop = document.getElementById('btn-delete-shop');
    var btnRestore = $('.btn-restore');

    // Hiển thị modal xóa
    $('#delete-shop-modal').on('show.bs.modal', function (e) {
        var button = $(e.relatedTarget);
        shopId = button.data('id');
    });

    // Xử lý khi nhấn nút xóa
    btnDeleteShop.onclick = function () {
        deleteForm.action = '/shops/' + shopId + '/force?_method=DELETE';
        deleteForm.submit();
    };

    // Xử lý khi nhấn nút khôi phục
    btnRestore.click(function (e) {
        e.preventDefault();
        var shopId = $(this).data('id');
        restoreForm.action = '/shops/' + shopId + '/restore?_method=PATCH';
        restoreForm.submit();
    });
});
