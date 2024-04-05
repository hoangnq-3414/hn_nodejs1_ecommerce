document.addEventListener('DOMContentLoaded', function () {
  var formUser = document.querySelector('.form-user');
  var wapperForm = document.querySelector('.wapper-form');
  var searchButton = document.querySelector('.nut-search-user');
  var queryTextInput = document.querySelector('#query-text');
  var cateDisableBtn = document.querySelectorAll('.cate-disable');
  var cateActiveBtn = document.querySelectorAll('.cate-active');

  searchButton.addEventListener('click', function () {
    let queryText = queryTextInput.value;
    if (!queryText) {
      queryText = '';
    }
    searchUser(queryText);
  });


  function hienThiFormUser() {
    formUser.style.display = 'flex'; 
    wapperForm.style.display = 'block'; 
  }

  function closeFormUser() {
    formUser.style.display = 'none'; 
    wapperForm.style.display = 'none'; 
  }

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
  updateUserStatus(id, true);
}

function enableCate(id) {
  updateUserStatus(id, false);
}

function tableUserDelete(id, deleteUserElement) {
  Swal.fire({
    title: 'Bạn có chắc chắn muốn vo hieu hoa danh muc?',
    text: 'Bạn sẽ không thể khôi phục lại được sau khi xóa!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Delete',
  }).then((result) => {
    if (result.isConfirmed) {
      const apiURL = new URL(
        `http://localhost:3000/user/delete/${id}`,
        window.location.href,
      ).href;

      fetch(apiURL, {
        method: 'DELETE',
      })
        .then((response) => response.json())
        .then((dataResponse) => {
          if (response.ok) {
            Swal.fire({
              title: 'Đã xóa thành công!',
              text: dataResponse['message'],
              icon: 'success',
            });
            deleteUserElement.hide();
            timKiem(page);
          } else {
            Swal.fire({
              title: 'Đã có lỗi xảy ra!',
              text: dataResponse['message'],
              icon: 'error',
            });
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          Swal.fire({
            title: 'Đã có lỗi xảy ra!',
            text: 'Có lỗi khi gửi yêu cầu xóa tài khoản.',
            icon: 'error',
          });
        });
    }
  });
}


function updateUserStatus(id, disable) {
  Swal.fire({
    title: disable ? 'Bạn có chắc chắn muốn vô hiệu hóa tài khoản?' : 'Bạn có chắc chắn muốn kích hoạt tài khoản?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'OK',
  }).then((result) => {
    if (result.isConfirmed) {
      const apiURL = new URL(`/user/changeStatus/${id}`, window.location.href).href;
      fetch(apiURL, {
        method: 'POST',
        body: JSON.stringify({ disable }), // Sending the status to backend
        headers: {
          'Content-Type': 'application/json'
        }
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
          })
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
  url = '/user/search?text=' + text;
  window.location.href = url;
}
