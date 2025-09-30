document.addEventListener('DOMContentLoaded', function () {
    const table = document.querySelector('tbody');

    table.addEventListener('click', function (e) {
        const btn = e.target.closest('button');
        if (!btn) return;

        const row = btn.closest('tr');
        const id = row.dataset.id;

        // Bấm Edit
        if (btn.classList.contains('btn-edit')) {
            const nameCell = row.querySelector('.cell-name');
            const dateCell = row.querySelector('.cell-dates');
            const typeCell = row.querySelector('.cell-type');
            const actionsCell = row.querySelector('.cell-actions');

            const currentName = nameCell.textContent.trim();
            const currentType = typeCell.textContent.trim();
            const startDate = dayjs(row.dataset.start).format('YYYY-MM-DD');
            const endDate = dayjs(row.dataset.end).format('YYYY-MM-DD');

            // Lưu giá trị gốc vào dataset để Cancel có thể khôi phục
            row.dataset.originalName = currentName;
            row.dataset.originalType = currentType;
            row.dataset.originalStart = row.dataset.start;
            row.dataset.originalEnd = row.dataset.end;

            nameCell.innerHTML = `<input type="text" class="form-control" value="${currentName}">`;
            typeCell.innerHTML = `
                <select class="form-select">
                    <option value="sale" ${currentType === 'sale' ? 'selected' : ''}>Sale</option>
                    <option value="flash" ${currentType === 'flash' ? 'selected' : ''}>Flash</option>
                    <option value="holiday" ${currentType === 'holiday' ? 'selected' : ''}>Holiday</option>
                    <option value="weekly" ${currentType === 'weekly' ? 'selected' : ''}>Weekly</option>
                    <option value="monthly" ${currentType === 'monthly' ? 'selected' : ''}>Monthly</option>
                    <option value="voucher" ${currentType === 'voucher' ? 'selected' : ''}>Voucher</option>
                </select>
            `;
            dateCell.innerHTML = `
                <input type="text" class="form-control flatpickr" value="${startDate}">
                <span class="mx-1">-</span>
                <input type="text" class="form-control flatpickr" value="${endDate}">
            `;

            actionsCell.innerHTML = `
                <button class="btn btn-success btn-sm btn-save"><i class="fa fa-check"></i></button>
                <button class="btn btn-secondary btn-sm btn-cancel"><i class="fa fa-times"></i></button>
            `;

            flatpickr(row.querySelectorAll('.flatpickr'), {
                locale: 'vn',
                dateFormat: 'Y-m-d',
                altInput: true,
                altFormat: 'd/m/Y',
                allowInput: true,
            });
        }

        // Bấm Save
        if (btn.classList.contains('btn-save')) {
            const nameInput = row.querySelector('.cell-name input');
            const typeSelect = row.querySelector('.cell-type select');
            const dateInputs = row.querySelectorAll('.cell-dates input');

            const newName = nameInput.value;
            const newType = typeSelect.value;
            const newStart = dayjs
                .tz(dateInputs[0].value, 'DD Thg MM YYYY', 'Asia/Ho_Chi_Minh')
                .startOf('day')
                .toDate();
            const newEnd = dayjs.tz(dateInputs[2].value, 'DD Thg MM YYYY', 'Asia/Ho_Chi_Minh').endOf('day').toDate();

            fetch(`/campaigns/${id}/edit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName,
                    type: newType,
                    startDate: newStart,
                    endDate: newEnd,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    row.querySelector('.cell-name').textContent = data.name;
                    row.querySelector('.cell-type').textContent = data.type;
                    row.querySelector('.cell-dates').textContent =
                        `${dayjs(data.startDate).format('D [Thg] MM YYYY')} - ${dayjs(data.endDate).format('D [Thg] MM YYYY')}`;

                    // update lại dataset
                    row.dataset.start = data.startDate;
                    row.dataset.end = data.endDate;

                    row.querySelector('.cell-actions').innerHTML = `
                        <button class="btn btn-warning btn-sm btn-edit"><i class="fa fa-edit"></i></button>
                        <button class="btn btn-danger btn-sm btn-delete" 
                                data-bs-toggle="modal" 
                                data-bs-target="#delete-campaign-modal"
                                data-id="${id}">
                            <i class="fa fa-trash"></i>
                        </button>
                        <a href='/campaigns/${id}/products' class='btn btn-primary btn-sm'>
                            <i class='fa fa-box'></i>
                        </a>
                    `;
                });
        }

        // Bấm Cancel
        if (btn.classList.contains('btn-cancel')) {
            const nameCell = row.querySelector('.cell-name');
            const typeCell = row.querySelector('.cell-type');
            const dateCell = row.querySelector('.cell-dates');
            const actionsCell = row.querySelector('.cell-actions');

            const originalName = row.dataset.originalName;
            const originalType = row.dataset.originalType;
            const originalStart = row.dataset.originalStart;
            const originalEnd = row.dataset.originalEnd;

            nameCell.textContent = originalName;
            typeCell.textContent = originalType;
            dateCell.textContent = `${dayjs(originalStart).format('D [Thg] MM YYYY')} - ${dayjs(originalEnd).format('D [Thg] MM YYYY')}`;

            actionsCell.innerHTML = `
                <button class="btn btn-warning btn-sm btn-edit"><i class="fa fa-edit"></i></button>
                <button class="btn btn-danger btn-sm btn-delete" 
                        data-bs-toggle="modal" 
                        data-bs-target="#delete-campaign-modal"
                        data-id="${id}">
                    <i class="fa fa-trash"></i>
                </button>
                <a href='/campaigns/${id}/products' class='btn btn-primary btn-sm'>
                    <i class='fa fa-box'></i>
                </a>
            `;
        }
    });

    // Khởi tạo flatpickr cho form tạo mới
    $('.flatpickr').flatpickr({
        locale: 'vn',
        dateFormat: 'Y-m-d',
        altInput: true,
        defaultDate: new Date(),
        allowInput: true,
    });

    // Delete modal
    let campaignId;
    let deleteForm = document.forms['delete-campaign-form'];
    let btnDeleteCampaign = document.getElementById('btn-delete-campaign');

    $('#delete-campaign-modal').on('show.bs.modal', function (e) {
        let button = $(e.relatedTarget);
        campaignId = button.data('id');
    });

    btnDeleteCampaign.onclick = function () {
        deleteForm.action = '/campaigns/' + campaignId + '?_method=DELETE';
        deleteForm.submit();
    };
});
