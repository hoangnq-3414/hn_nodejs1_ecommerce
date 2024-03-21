$(document).ready(function () {
  // Lặp qua mỗi order
  $('.col-md-12').each(function () {
    // Lấy trạng thái của đơn hàng
    var status = $(this).find('.label').text().trim();

    // Nếu trạng thái là "Pending", hiển thị nút "Cancel Order"
    if (status === 'Pending') {
      $(this).find('.cancelOrderBtn').show(); // Sử dụng lớp CSS chung 'cancelOrderBtn' thay vì id
    }

    if (status === 'Pending') {
      $(this).find('.acceptOrderBtn').show();
    }

    if (status === 'Pending') {
      $(this).find('.rejectOrderBtn').show();
    }
  });

  $('.cancelOrderBtn').click(function () {
    var cancelBtn = $(this);
    var orderId = $(this).data('order-id');

    var data = { orderId: orderId, status: 4 };
    $.post('/order/status/', data)
      .done(function (response) {
        console.log('Order canceled successfully.');
        cancelBtn.hide();
        cancelBtn.siblings('.col-md-12').find('.label').text('Cancel');
      })
      .fail(function (xhr, status, error) {
        console.error('Error canceling order:', error);
      });
  });

  $('.rejectOrderBtn').click(function () {
    var rejectBtn = $(this);
    var orderId = $(this).data('order-id');
    var email = rejectBtn
      .closest('.col-md-12')
      .find('.userEmail')
      .next()
      .text()
      .trim();
    const rejectReasonDiv = rejectBtn.next('.reject-reason');
    // const submitRejectBtn = $('#submitReject');
    const submitRejectBtn = rejectReasonDiv.find('#submitReject'); 
    rejectReasonDiv.show();
    // Bỏ sự kiện "click" của nút "Submit" nếu đã được gán trước đó
    submitRejectBtn.off('click');
    submitRejectBtn.click(function () {
      const rejectReason = $('#rejectReason').val();
      const data = {
        orderId: orderId,
        status: 3,
        rejectReason: rejectReason,
        email: email,
      };
      $.post('/order/status/', data)
        .done(function (response) {
          // Ẩn ô nhập lý do từ chối và reset giá trị
          rejectReasonDiv.hide();
          $('#rejectReason').val('');
          // Ẩn nút Reject và hiển thị trạng thái đã từ chối
          rejectBtn.hide();
          rejectBtn.siblings('.acceptOrderBtn').hide();
          rejectBtn.siblings('.col-md-12').find('.label').text('Rejected');
        })
        .fail(function (xhr, status, error) {
          console.error('Error rejecting order:', error);
        });
    });
  });

  $('.acceptOrderBtn').click(function () {
    var acceptBtn = $(this);
    var orderId = $(this).data('order-id');
    var email = acceptBtn
      .closest('.col-md-12')
      .find('.userEmail')
      .next()
      .text()
      .trim();

    var data = { orderId: orderId, status: 2, email: email };
    $.post('/order/status/', data)
      .done(function (response) {
        acceptBtn.hide();
        acceptBtn.siblings('.rejectOrderBtn').hide();
        acceptBtn.siblings('.col-md-12').find('.label').text('Successful');
      })
      .fail(function (xhr, status, error) {
        console.error('Error canceling order:', error);
      });
  });
});

// user
$(document).ready(function () {
  $('#filterForm').submit(function (event) {
    event.preventDefault();

    var statusValue = $('#statusInput').val();

    var dateValue = $('#dateInput').val();
    var url = '/order/filter?status=' + statusValue + '&dateInput=' + dateValue;
    if (statusValue == '0') {
      var url = '/order/filter?dateInput=' + $('#dateInput').val();
    } else {
      var url =
        '/order/filter?status=' +
        statusValue +
        '&dateInput=' +
        $('#dateInput').val();
    }
    window.location.href = url;

    console.log('gui thanh cong');
  });
});

// admin
$(document).ready(function () {
  $('#filterForm').submit(function (event) {
    event.preventDefault();

    var statusValue = $('#statusInput').val();

    var dateValue = $('#dateInput').val();
    var url = '/order/filter?status=' + statusValue + '&dateInput=' + dateValue;
    if (statusValue == '0') {
      var url = '/order/allFilter?dateInput=' + $('#dateInput').val();
    } else {
      var url =
        '/order/allFilter?status=' +
        statusValue +
        '&dateInput=' +
        $('#dateInput').val();
    }
    window.location.href = url;

    console.log('gui thanh cong');
  });
});
