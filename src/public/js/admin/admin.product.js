document.addEventListener('DOMContentLoaded', function () {
  var formUser = document.querySelector('.form-user');
  var wapperForm = document.querySelector('.wapper-form');
  var btnUserOK = document.querySelector('.user-btn-ok');
  var titleFormUser = document.querySelector('.form-user h1');
  var nutThemUser = document.querySelector('.btn-add-user');
  var cancelBtn = document.querySelector('.user-btn-cancel');
  var searchButton = document.querySelector('.nut-search-user');
  var queryTextInput = document.querySelector('#query-text');
  var editUserButtons = document.querySelectorAll('.table-edit');
  var cateDisableBtn = document.querySelectorAll('.cate-disable');
  var cateActiveBtn = document.querySelectorAll('.cate-active');
  var nameCategory = document.querySelector('#user-email');
  var descriptionCategory = document.querySelector('#user-ten');

  searchButton.addEventListener('click', function () {
    let queryText = queryTextInput.value;
    if (!queryText) {
      queryText = '';
    }
    searchUser(queryText);
  });

  // vo hieu hoa
  cateDisableBtn.forEach(function (disableButton) {
    disableButton.addEventListener('click', function () {
      var id = disableButton.getAttribute('data-user-id');
      disableCate(id);
    });
  });

  // kich hoat
  cateActiveBtn.forEach(function (activeButton) {
    activeButton.addEventListener('click', function () {
      var id = activeButton.getAttribute('data-user-id');
      enableCate(id);
    });
  });
});

function disableCate(id) {
  updateCategoryStatus(id, true);
}

function enableCate(id) {
  updateCategoryStatus(id, false);
}

// vô hiệu hóa hoặc kích hoạt category
function updateCategoryStatus(id, disable) {
  Swal.fire({
    title: disable
      ? 'Bạn có chắc chắn muốn vô hiệu hóa product?'
      : 'Bạn có chắc chắn muốn kích hoạt product?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'OK',
  }).then((result) => {
    if (result.isConfirmed) {
      const apiURL = new URL(
        `/product/changeStatus/${id}`,
        window.location.href,
      ).href;
      fetch(apiURL, {
        method: 'POST',
        body: JSON.stringify({ disable }), // Sending the status to backend
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((dataResponse) => {
          Swal.fire({
            title: 'Thành công!',
            text: dataResponse['message'],
            icon: 'success',
            confirmButtonText: 'OK',
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.reload();
            }
          });
        })
        .catch((error) => {
          console.error('Error:', error);
          Swal.fire({
            title: 'Đã có lỗi xảy ra!',
            text: 'Có lỗi khi gửi yêu cầu',
            icon: 'error',
          });
        });
    }
  });
}

function searchUser(text) {
  var url;
  url = '/product/searchProduct?text=' + text;
  window.location.href = url;
}
