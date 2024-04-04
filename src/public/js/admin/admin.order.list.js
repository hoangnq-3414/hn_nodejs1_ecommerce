document.addEventListener('DOMContentLoaded', function () {
  var cancelBtns = document.querySelectorAll('.cancel-order');

  cancelBtns.forEach(function (cancelBtn) {
    var rejectReasonDiv = cancelBtn.nextElementSibling;
    var rejectReasonInput = rejectReasonDiv.querySelector('input[type="text"]');
    var submitRejectBtn = rejectReasonDiv.querySelector('#submitReject');
    var email = cancelBtn
      .closest('.each-order')
      .querySelector('.email')
      .textContent.trim();
    var orderId = cancelBtn
      .closest('.each-order')
      .querySelector('.orderId')
      .textContent.trim();

    cancelBtn.addEventListener('click', function (event) {
      event.preventDefault();
      rejectReasonDiv.style.display = 'flex';
    });

    submitRejectBtn.addEventListener('click', function (event) {
      event.preventDefault();
      var rejectReasonValue = rejectReasonInput.value;
      var data = {
        orderId: orderId,
        status: 3,
        rejectReason: rejectReasonValue,
        email: email,
      };

      const apiURL = new URL('/order/status/', window.location.href).href;
      fetch(apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          window.location.reload();
        })
        .catch((error) => {
          console.error('There was a problem with the fetch operation:', error);
        });
    });
  });

  var acceptBtns = document.querySelectorAll('.accept-order');
  acceptBtns.forEach(function (acceptBtn) {
    acceptBtn.addEventListener('click', function (event) {
      event.preventDefault();

      var email = acceptBtn
        .closest('.each-order')
        .querySelector('.email')
        .textContent.trim();
      var orderId = acceptBtn
        .closest('.each-order')
        .querySelector('.orderId')
        .textContent.trim();

      var data = {
        orderId: orderId,
        status: 2,
        email: email,
      };

      fetch('/order/status/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          window.location.reload();
        })
        .catch((error) => {
          console.error('Error accepting order:', error);
        });
    });
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const classifyOrdersLinks = document.querySelectorAll('.thanh-classify-orders .classify-orders');

  const savedStatus = sessionStorage.getItem('selectedStatus');

  classifyOrdersLinks.forEach(link => {
    link.addEventListener('click', function (event) {
      classifyOrdersLinks.forEach(link => {
        link.classList.remove('status-active');
      });

      this.classList.add('active');

      const status = this.getAttribute('href').split('/').pop();
      sessionStorage.setItem('selectedStatus', status);
    });

    const status = link.getAttribute('href').split('/').pop();
    if (savedStatus && status === savedStatus) {
      link.classList.add('status-active');
    }
  });
});
