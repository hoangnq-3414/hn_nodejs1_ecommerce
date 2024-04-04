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

    reviewButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var reviewForm = button.closest('.cart-row').nextElementSibling;
        reviewForm.style.display = 'block';
      });
    });

  var cancelButtons = document.querySelectorAll('.btn-cancel');
  cancelButtons.forEach(function (cancelButton) {
    cancelButton.addEventListener('click', function () {
      var reviewForm = cancelButton.closest('.review-form');
      reviewForm.style.display = 'none';
    });
  });
});

function handleClick(event) {
  event.preventDefault();
}
