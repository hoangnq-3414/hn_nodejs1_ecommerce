var cartItemsData = [];

function updateCartItemsData(cartITemId, quantity) {
    // Kiểm tra xem sản phẩm có trong mảng cartItemsData không
    var existingItem = cartItemsData.find(item => item.cartITemId === cartITemId);
  
    if (existingItem) {
      // Nếu đã tồn tại, cập nhật số lượng
      existingItem.quantity = quantity;
    } else {
      // Nếu chưa tồn tại, thêm sản phẩm mới vào mảng
      cartItemsData.push({ cartITemId: cartITemId, quantity: quantity });
    }
  }
  
// Xử lý sự kiện khi trang đã tải hoàn toàn
document.addEventListener('DOMContentLoaded', function () {
    // Xử lý sự kiện khi người dùng nhấn vào nút tăng số lượng
    var increaseButtons = document.querySelectorAll('.chg-quantity[src="/images/arrow-up.png"]');
    var totalPriceElement = document.querySelector('.total-price');
    var totalPrice = parseInt(totalPriceElement.textContent);
  
    increaseButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var quantityElement = this.closest('.cart-row').querySelector('.quantity');
        var currentQuantity = parseInt(quantityElement.textContent);
        var priceElement = this.closest('.cart-row').querySelector('.product-price');
        var currentPrice = parseInt(priceElement.textContent);
        var totalEachProductElement = this.closest('.cart-row').querySelector('.product-each-total');

        // Lấy id của sản phẩm
        var cartITemId = this.closest('.cart-row').getAttribute('data-id');
  
        currentQuantity = currentQuantity + 1;
        quantityElement.textContent = currentQuantity; // Tăng số lượng lên 1

        // / Cập nhật mảng cartItemsData
        updateCartItemsData(cartITemId, currentQuantity);

        // Gọi hàm cập nhật giỏ hàng ở đây nếu cần
        totalEachProductElement.textContent = `${currentPrice * currentQuantity}`;
  
        totalPrice = totalPrice + currentPrice;
        totalPriceElement.textContent = totalPrice;

        console.log(cartItemsData);
      });
    });
  
    // Xử lý sự kiện khi người dùng nhấn vào nút giảm số lượng
    var decreaseButtons = document.querySelectorAll('.chg-quantity[src="/images/arrow-down.png"]');
    decreaseButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var quantityElement = this.closest('.cart-row').querySelector('.quantity');
        var currentQuantity = parseInt(quantityElement.textContent);
        var priceElement = this.closest('.cart-row').querySelector('.product-price');
        var currentPrice = parseInt(priceElement.textContent);
        var totalEachProductElement = this.closest('.cart-row').querySelector('.product-each-total');

        var cartITemId = this.closest('.cart-row').getAttribute('data-id');
        if (currentQuantity > 1) {
          currentQuantity = currentQuantity - 1;
          quantityElement.textContent = currentQuantity; // Giảm số lượng xuống 1, nhưng không dưới 1

          // Cập nhật mảng cartItemsData
          updateCartItemsData(cartITemId, currentQuantity);

          // Gọi hàm cập nhật giỏ hàng ở đây nếu cần
          totalEachProductElement.textContent = `${currentPrice * currentQuantity}`;
  
          totalPrice = totalPrice - currentPrice;
          totalPriceElement.textContent = totalPrice;

          console.log(cartItemsData);
        }
      });
    });
  });
