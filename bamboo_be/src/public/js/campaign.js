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
            const actionsCell = row.querySelector('.cell-actions');

            const currentName = nameCell.textContent.trim();
            const startDate = dayjs(row.dataset.start).format('YYYY-MM-DD');
            const endDate = dayjs(row.dataset.end).format('YYYY-MM-DD');

            nameCell.innerHTML = `<input type="text" class="form-control" value="${currentName}">`;
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
            const dateInputs = row.querySelectorAll('.cell-dates input');
            const newName = nameInput.value;
            const newStart = dateInputs[0].value;
            const newEnd = dateInputs[1].value;

            fetch(`/campaigns/${id}/edit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName,
                    startDate: newStart,
                    endDate: newEnd,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    row.querySelector('.cell-name').textContent = data.name;
                    row.querySelector('.cell-dates').textContent =
                        `${dayjs(data.startDate).format('DD/MM/YYYY')} - ${dayjs(data.endDate).format('DD/MM/YYYY')}`;

                    // update lại dataset
                    row.dataset.start = data.startDate;
                    row.dataset.end = data.endDate;

                    row.querySelector('.cell-actions').innerHTML = `
                        <button class="btn btn-warning btn-sm btn-edit"><i class="fa fa-edit"></i></button>
                        <button class="btn btn-danger btn-sm btn-delete" 
                                data-bs-toggle="modal" 
                                data-bs-target="#delete-campaign-modal"><i class="fa fa-trash"></i></button>
                    `;
                });
        }

        // Bấm Cancel
        if (btn.classList.contains('btn-cancel')) {
            const nameCell = row.querySelector('.cell-name');
            const dateCell = row.querySelector('.cell-dates');
            const actionsCell = row.querySelector('.cell-actions');

            // lấy từ dataset (dữ liệu gốc chưa chỉnh)
            const originalName = nameCell.querySelector('input').defaultValue;
            const originalStart = row.dataset.start;
            const originalEnd = row.dataset.end;

            nameCell.textContent = originalName;
            dateCell.textContent = `${dayjs(originalStart).format('DD/MM/YYYY')} - ${dayjs(originalEnd).format('DD/MM/YYYY')}`;

            actionsCell.innerHTML = `
                <button class="btn btn-warning btn-sm btn-edit"><i class="fa fa-edit"></i></button>
                <button class="btn btn-danger btn-sm btn-delete" 
                        data-bs-toggle="modal" 
                        data-bs-target="#delete-campaign-modal"><i class="fa fa-trash"></i></button>
            `;
        }
    });

    $('.flatpickr').flatpickr({
        locale: 'vn',
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'd/m/Y',
        defaultDate: new Date(),
        allowInput: true,
    });

    let campaignId;
    let deleteForm = document.forms['delete-campaign-form'];
    let btnDeleteCampaign = document.getElementById('btn-delete-campaign');

    $('#delete-campaign-modal').on('show.bs.modal', function (e) {
        let button = $(e.relatedTarget);
        campaignId = button.data('id');
    });

    btnDeleteCampaign.onclick = function (e) {
        deleteForm.action = '/campaigns/' + campaignId + '?_method=DELETE';
        deleteForm.submit();
    };
});
