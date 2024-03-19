$(document).ready(function () {
  // Lặp qua mỗi order
  $('.col-md-12').each(function () {
    // Lấy trạng thái của đơn hàng
    var status = $(this).find('.label').text().trim();

    // Nếu trạng thái là "Pending", hiển thị nút "Cancel Order"
    if (status === 'Pending') {
      $(this).find('.cancelOrderBtn').show();
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

    var data = { orderId: orderId, status: 3 };
    $.post('/order/status/', data)
      .done(function (response) {
        console.log('Order reject successfully.');
        rejectBtn.hide();
        rejectBtn.siblings('.acceptOrderBtn').hide();
        rejectBtn.siblings('.col-md-12').find('.label').text('Rejected');
      })
      .fail(function (xhr, status, error) {
        console.error('Error canceling order:', error);
      });
  });

  $('.acceptOrderBtn').click(function () {
    var acceptBtn = $(this);
    var orderId = $(this).data('order-id');

    var data = { orderId: orderId, status: 2 };
    $.post('/order/status/', data)
      .done(function (response) {
        console.log('Order successfully.');
        acceptBtn.hide();
        acceptBtn.siblings('.rejectOrderBtn').hide();
        acceptBtn.siblings('.col-md-12').find('.label').text('Successful');
      })
      .fail(function (xhr, status, error) {
        console.error('Error canceling order:', error);
      });
  });

  $('#statusButton').click(function () {
    $('#statusModal').modal('show');
    console.log('successfull');
  });
});
