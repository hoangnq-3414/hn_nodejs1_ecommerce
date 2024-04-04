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
      var reviewForm = document.querySelector('.bg-blur');
      reviewForm.style.display = 'flex';
    });
  });

  var cancelButtons = document.querySelectorAll('.btn-cancel');
  cancelButtons.forEach(function (cancelButton) {
    cancelButton.addEventListener('click', function () {
      var bgblur = cancelButton.closest('.bg-blur');
      bgblur.style.display = 'none';
    });
  });
});

function handleClick(event) {
  event.preventDefault();
}
