var cartItemsData = [];

function updateCartItemsData(cartITemId, quantity) {
  // Kiểm tra xem sản phẩm có trong mảng cartItemsData không
  var existingItem = cartItemsData.find(
    (item) => item.cartITemId === cartITemId,
  );
  if (existingItem) {
    // Nếu đã tồn tại, cập nhật số lượng
    existingItem.quantity = quantity;
  } else {
    cartItemsData.push({ cartITemId: cartITemId, quantity: quantity });
  }
}

$(document).ready(function () {
  var totalPriceElement = $('.total-price');
  var totalPrice = parseInt(totalPriceElement.text());

  $('.chg-quantity').click(function () {
    var quantityElement = $(this).closest('.cart-row').find('p.quantity');
    var currentQuantity = parseInt(quantityElement.text());
    var priceElement = $(this).closest('.cart-row').find('.product-price');
    var currentPrice = parseInt(priceElement.text());
    var totalEachProductElement = $(this)
      .closest('.cart-row')
      .find('.product-each-total');
    var cartItemId = $(this).closest('.cart-row').data('id');

    // Kiểm tra nếu là nút tăng số lượng
    if ($(this).attr('src') === '/images/arrow-up.png') {
      currentQuantity++;
      totalPrice += currentPrice;
    } else {
      if (currentQuantity > 1) {
        currentQuantity--;
        totalPrice -= currentPrice;
      }
    }

    quantityElement.text(currentQuantity);
    updateCartItemsData(cartItemId, currentQuantity);
    totalEachProductElement.text(`${currentPrice * currentQuantity}`);
    totalPriceElement.text(totalPrice);
    console.log(cartItemsData);
  });
});

const updateCartBtn = document.getElementById('update-cart-btn');

updateCartBtn.addEventListener('click', function (event) {
  event.preventDefault();

  sendCartItemsDataToServer(cartItemsData, () => {
    window.location.href = this.getAttribute('href');
  });
});

function sendCartItemsDataToServer(cartItemsData) {
  fetch('/cart/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cartItemsData: cartItemsData }),
  })
    .then((response) => response.text())
    .then((data) => {
      alert('Update successfully');
      console.log(data);
    })
    .catch((error) => {
      alert(error);
      console.error('Lỗi:', error);
    });
}

$(document).ready(function () {
  const btnDelete = $('.btn-delete');
  btnDelete.click(function (event) {
    event.preventDefault();

    var itemId = $(this).data('item-id');

    var cartRow = $(this).closest('.cart-row');

    // Hiển thị cửa sổ xác nhận xóa bằng SweetAlert
    Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa?',
      text: 'Bạn sẽ không thể khôi phục lại được sau khi xóa!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Delete',
    }).then((result) => {
      // Nếu người dùng nhấn nút xác nhận
      if (result.isConfirmed) {
        // Gửi yêu cầu AJAX để xóa mục với id đã được lấy
        $.ajax({
          type: 'GET',
          url: '/cart/delete/' + itemId,
          success: function (response) {
            console.log('Mục đã được xóa thành công!');
            cartRow.hide();
          },
          error: function (xhr, status, error) {
            console.error('Đã xảy ra lỗi khi xóa mục:', error);
          },
        });
      }
    });
  });
});
