document.addEventListener('DOMContentLoaded', function () {
  var acceptBtns = document.querySelectorAll('.cancel-order');
  acceptBtns.forEach(function (acceptBtn) {
    acceptBtn.addEventListener('click', function (event) {
      event.preventDefault();

      // Hiển thị cảnh báo sử dụng Swal.fire
      Swal.fire({
        title: 'Bạn có chắc chắn muốn hủy đơn hàng không?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Có',
        cancelButtonText: 'Không',
      }).then((result) => {
        if (result.isConfirmed) {
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
            status: 4,
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
        }
      }); 
    });
  });
});


document.addEventListener('DOMContentLoaded', function () {
  const classifyOrdersLinks = document.querySelectorAll(
    '.thanh-classify-orders .classify-orders',
  );

  const savedStatus = sessionStorage.getItem('selectedStatus');

  classifyOrdersLinks.forEach((link) => {
    link.addEventListener('click', function (event) {
      classifyOrdersLinks.forEach((link) => {
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
