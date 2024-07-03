$(document).ready(function () {
	$('#profileForm').on('submit', function (event) {
		event.preventDefault();

		const phoneValue = $('#phone').val().trim();

		if (isNaN(phoneValue)) {
			$('#errorAlert').addClass('alert-danger');
			$('#errorAlert').removeClass('alert-success');
			$('#errorAlert')
				.text('Số điện thoại phải là dạng số. VD: 0123456789')
				.show();
			return;
		}

		$.ajax({
			url: '/update',
			type: 'POST',
			data: $(this).serialize(),
			dataType: 'json',
			success: function (data) {
				if (data.success) {
					$('#errorAlert').addClass('alert-success');
					$('#errorAlert').removeClass('alert-danger');
					$('#errorAlert').text(data.message).show();
				} else {
					$('#errorAlert').addClass('alert-danger');
					$('#errorAlert').removeClass('alert-success');
					$('#errorAlert').text(data.message).show();
				}
			},
			error: function (xhr, status, error) {
				alert('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
			},
		});
	});
});

$('#upload').change(function () {
	const formData = new FormData();
	formData.append('image', this.files[0]);

	$.ajax({
		url: '/admin/product/upload-image',
		type: 'POST',
		data: formData,
		processData: false,
		contentType: false,
		success: function (results) {
			if (results.success) {
				$('#image_show').html(
					`<a href="${results.imageUrl}" target="_blank">
						<img src="${results.imageUrl}" width="100px">
					</a>`
				);
				$('#thumb').val(results.imageUrl);
			} else {
				alert(results.message);
			}
		},
		error: function (xhr, status, error) {
			console.error('Lỗi khi gửi form:', error);
			console.error('Phản hồi từ server:', xhr.responseText);
		},
	});
});

function removeRow(url) {
	if (confirm('Xóa mà không thể khôi phục. Bạn có chắc ?')) {
		$.ajax({
			processData: false,
			contentType: false,
			type: 'DELETE',
			dateType: 'json',
			url: url,
			success: function (results) {
				alert(results.message);
				if (results.success === true) {
					location.reload();
				}
			},
		});
	}
}
