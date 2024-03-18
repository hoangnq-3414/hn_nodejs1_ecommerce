$(document).ready(function () {
  $('#payment-type').change(function () {
    if ($(this).val() === '2') {
      // Nếu lựa chọn là thanh toán online
      $('#image-upload').show(); // Hiển thị trường tải ảnh lên
    } else {
      $('#image-upload').hide(); // Ẩn trường tải ảnh lên
    }
  });
});

$(document).ready(function () {
  $('#form').submit(function (event) {
    event.preventDefault();

    var outOfStockProducts = [];

    $('.cart-row').each(function () {
      const quantity = parseInt($(this).find('.quantity').text());
      const productQuantity = parseInt($(this).find('.product-quantity').text());

      if (quantity > productQuantity) {
        var productName = $(this).find('.product-name').text();
        outOfStockProducts.push(productName);
      }
    });

    if (outOfStockProducts.length > 0) {
      alert('The following products are out of stock: ' + outOfStockProducts.join(', '));
    } else {
      // Nếu không có sản phẩm nào hết hàng, tiến hành submit form
      $(this).unbind('submit').submit();
    }
  });
});

