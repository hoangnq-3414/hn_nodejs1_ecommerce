document.addEventListener('DOMContentLoaded', function () {
  var cartRows = document.querySelectorAll('.cart-row');
  var reviewButtons = document.querySelectorAll('.btn-review');

  cartRows.forEach(function (cartRow) {
    var priceElement = cartRow.querySelector('.price');
    var quantityElement = cartRow.querySelector('.quantity');
    var totalElement = cartRow.querySelector('.total');

    if (priceElement && quantityElement) {
      var price = parseFloat(priceElement.innerText.replace('$', ''));
      var quantity = parseFloat(quantityElement.innerText);

      var total = price * quantity;
      totalElement.innerText = total + '$';
    }
  });

  reviewButtons.forEach(function (button, index) {
    button.addEventListener('click', function () {
      var reviewFormBlur = button.closest('.cart-row').nextElementSibling;
      reviewFormBlur.style.display = 'flex';
    });
  });

  var cancelButtons = document.querySelectorAll('.btn-cancel');
  cancelButtons.forEach(function (cancelButton) {
    cancelButton.addEventListener('click', function () {
      var bgblur = cancelButton.closest('.bg-blur');
      bgblur.style.display = 'none';
    });
  });

  const reviewForms = document.querySelectorAll('.rating');

  reviewForms.forEach((form) => {
    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      const productId = form.querySelector('input[name="productId"]').value;
      const orderDetailId = form.querySelector(
        'input[name="orderDetailId"]',
      ).value;
      const rating = form.querySelector('input[name="rating"]:checked').value;
      const comment = form.querySelector('textarea[name="comment"]').value;

      const data = {
        productId: productId,
        orderDetailId: orderDetailId,
        rating: rating,
        comment: comment,
      };

      try {
        const response = await fetch('/product/rating', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          window.location.reload();
        } else {
          console.error('Đã xảy ra lỗi khi gửi đánh giá');
        }
      } catch (error) {
        console.error('Đã xảy ra lỗi khi gửi đánh giá:', error);
      }
    });
  });
});

function handleClick(event) {
  event.preventDefault();
}
