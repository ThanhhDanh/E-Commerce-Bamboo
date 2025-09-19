// Check email
function verifyEmail(input) {
    var iconSuccess = document.getElementById('email-success');
    var iconError = document.getElementById('email-error');
    let email = input.value;
    let regex = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
    if (email === '') {
        iconSuccess.style.display = 'none';
        iconError.style.display = 'none';
        return;
    }
    if (regex.test(email)) {
        iconSuccess.style.display = 'flex';
        iconError.style.display = 'none';
    } else {
        iconError.style.display = 'flex';
        iconSuccess.style.display = 'none';
    }
}

document.querySelector('tbody').addEventListener('keydown', function (e) {
    if (e.target.classList.contains('quantity') && e.key === 'Enter') {
        e.preventDefault();
    }
});

//Khi thêm sản phẩm mới
document.getElementById('product').addEventListener('change', function () {
    const selectedOption = this.options[this.selectedIndex];
    const productId = selectedOption.value;
    if (!productId) return;

    const name = selectedOption.dataset.name;
    const price = parseFloat(selectedOption.dataset.price);
    const colors = JSON.parse(selectedOption.dataset.colors || '[]');
    const sizes = JSON.parse(selectedOption.dataset.sizes || '[]');
    const quantity = 1;
    const tax = 0.01;
    const total = price * quantity * (1 + tax);

    const colorOptions = colors.map((color) => `<option value="${color.id}">${color.name}</option>`).join('');
    const sizeOptions = sizes.map((size) => `<option value="${size.id}">${size.name}</option>`).join('');

    const row = `
    <tr>
      <td><span class='table-name'>${name}</span></td>
      <td>
        <input type="number" class="form-control quantity" value="${quantity}" min="1" style="width: 70px;">
      </td>
      <td>
        <select class="form-select">${colorOptions}</select>
      </td>
      <td>
        <select class="form-select">${sizeOptions}</select>
      </td>
      <td name='orderDetails[0][unitPrice]' class="price">${price.toLocaleString()}</td>
      <td class="tax">1%</td>
      <td class="total">${total.toLocaleString()}</td>
      <td><button class="btn btn-danger remove-row">Xóa</button></td>
    </tr>
  `;

    document.querySelector('tbody').insertAdjacentHTML('beforeend', row);
    updateTotals();
});

let currentDiscountPercent = 0;

document.getElementById('discountId').addEventListener('change', function () {
    const selectedOption = this.options[this.selectedIndex];
    const discount = selectedOption.dataset.discount;

    currentDiscountPercent = discount ? parseFloat(discount) : 0;

    updateTotals();
});

//Thay đổi số lượng sản phẩm
document.querySelector('tbody').addEventListener('input', function (e) {
    if (e.target.classList.contains('quantity')) {
        const row = e.target.closest('tr');
        const quantity = parseInt(e.target.value) || 1;
        const price = parseFloat(row.querySelector('.price').textContent.replace(/,/g, ''));
        const tax = 0.01;
        const total = price * quantity * (1 + tax);
        row.querySelector('.total').textContent = total.toLocaleString();
        updateTotals();
    }
});

//Khi xóa sản phẩm
document.querySelector('tbody').addEventListener('click', function (e) {
    if (e.target.classList.contains('remove-row')) {
        e.target.closest('tr').remove();
        updateTotals();
    }
});

function updateTotals() {
    let totalAmount = 0;

    document.querySelectorAll('tbody tr').forEach((row) => {
        const price = parseFloat(row.querySelector('.price').textContent.replace(/,/g, ''));
        const quantity = parseInt(row.querySelector('.quantity').value);
        const tax = 0.01;
        const rowTotal = price * quantity * (1 + tax);

        row.querySelector('.total').textContent = rowTotal.toLocaleString();
        totalAmount += rowTotal;
    });

    // Tính giảm giá
    const discountAmount = totalAmount * (currentDiscountPercent / 100);
    const finalTotal = totalAmount - discountAmount;

    // Cập nhật vào giao diện
    document.querySelector('.taxable-amount').textContent = '1%';
    document.querySelectorAll('.money-item')[1].textContent = `${discountAmount.toLocaleString()} VNĐ`;
    document.querySelectorAll('.money-item')[2].textContent = `${finalTotal.toLocaleString()} VNĐ`;
}

document.getElementById('form').addEventListener('submit', function (e) {
    e.preventDefault();

    const orderDetails = [];

    document.querySelectorAll('tbody tr').forEach((row) => {
        const name = row.querySelector('.table-name').textContent;
        const quantity = parseInt(row.querySelector('.quantity').value);
        const unitPrice = parseFloat(row.querySelector('.price').textContent.replace(/,/g, ''));
        const productId = [...document.getElementById('product').options].find((opt) => opt.text === name)?.value;
        const colorId = row.querySelector('select').value;
        const sizeId = row.querySelectorAll('select')[1].value;

        orderDetails.push({
            productId: parseInt(productId),
            quantity,
            unitPrice,
            tax: 0.01,
            discountId: parseInt(document.getElementById('discountId').value),
            // methodPayment: document.getElementById('methodPayment')?.value || 'Cash',
            // statusPayment: document.getElementById('statusPayment')?.value || 'Pending',
            colorIds: [parseInt(colorId)],
            sizeIds: [parseInt(sizeId)],
        });
    });

    const methodPayment = document.getElementById('methodPayment')?.value || '';

    const data = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        description: document.getElementById('description')?.value || '',
        signature: document.getElementById('signature')?.value || '',
        discountId: document.getElementById('discountId').value,
        statusPayment: document.getElementById('statusPayment')?.value || 'Pending',
        methodPayment,
        orderDetails: orderDetails,
    };

    switch (methodPayment) {
        case 'Cash':
            fetch('/orders/store', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
                .then((res) => res.json())
                .then((resData) => {
                    if (resData.success) {
                        showSuccessToast('Tạo hóa đơn thành công!');
                        window.location.href = '/orders/show';
                    }
                })
                .catch((err) => {
                    showErrorToast('Lỗi thanh toán Cash: ', err);
                    console.error('Lỗi thanh toán Cash: ', err);
                });
            break;

        case 'Momo':
            fetch('/api/payment/momo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: data.name,
                    orderInfo: data.description,
                    amount: data.amount,
                    discountId: data.discountId,
                    signatureName: data.signature,
                    methodPayment: 'Momo',
                    orderDetails: data.orderDetails,
                }),
            })
                .then((res) => res.json())
                .then((resData) => {
                    if (resData.payUrl) {
                        window.location.href = resData.payUrl;
                    }
                })
                .catch((err) => {
                    console.log('Lỗi thanh toán MoMo: ', err);
                });
            break;

        case 'VNPay':
            fetch('/api/payment/vnpay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: data.name,
                    orderInfo: data.description,
                    amount: data.amount,
                    discountId: data.discountId,
                    signatureName: data.signature,
                    methodPayment: 'VNPay',
                    orderDetails: data.orderDetails,
                }),
            })
                .then((res) => res.json())
                .then((resData) => {
                    if (resData.payUrl) {
                        window.location.href = resData.payUrl;
                    }
                })
                .catch((err) => {
                    console.log('Lỗi thanh toán VNPay:', err);
                });

        default:
            break;
    }
});

// Hàm xử lý gắn thông tin người dùng khi đã chọn
function handleUserChange(selectElement) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];

    const email = selectedOption.getAttribute('data-email');
    const phone = selectedOption.getAttribute('data-phone');

    if (email) {
        document.getElementById('email').value = email;
    }

    if (phone) {
        document.getElementById('phone').value = phone;
    }
}
