$(document).ready(function () {
  // Lặp qua mỗi order
  $('.col-md-12').each(function () {
    // Lấy trạng thái của đơn hàng
    var status = $(this).find('.label').text().trim();

    // Nếu trạng thái là "Pending", hiển thị nút "Cancel Order"
    if (status === 'Pending') {
      $(this).find('.cancelOrderBtn').show(); // Sử dụng lớp CSS chung 'cancelOrderBtn' thay vì id
    }
  });

  $('.cancelOrderBtn').click(function () {
    var cancelBtn = $(this);
    var orderId = $(this).data('order-id');

    var data = { orderId: orderId };
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
});
