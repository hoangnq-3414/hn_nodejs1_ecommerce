document.addEventListener('DOMContentLoaded', function () {
  var formUser = document.querySelector('.form-user');
  var wapperForm = document.querySelector('.wapper-form');
  var btnUserOK = document.querySelector('.user-btn-ok');
  var titleFormUser = document.querySelector('.form-user h1');
  var userEmail = document.querySelector('#user-email');
  var userTen = document.querySelector('#user-ten');
  var userMatKhau = document.querySelector('#user-mat-khau');
  var userId = document.querySelector('#user-id');
  var userCloseImage = document.querySelector('#user-close-image');
  var userAvatar = document.querySelector('#user-avatar');
  var nutThemUser = document.querySelector('.nut-them-user');
  var cancelBtn = document.querySelector('.user-btn-cancel');
  var deleteUserBtn = document.querySelectorAll('.table-delete');
  var searchButton = document.querySelector('.nut-search-user');
  var queryTextInput = document.querySelector('#query-text');
  var editUserButtons = document.querySelectorAll('.table-edit');

  searchButton.addEventListener('click', function () {
    let queryText = queryTextInput.value;
    if (!queryText) {
      queryText = '';
    }
    searchUser(queryText);
  });

  deleteUserBtn.forEach(function (deleteButton) {
    deleteButton.addEventListener('click', function () {
      var id = deleteButton.getAttribute('data-user-id');
      var deleteUserElement = deleteButton.closest('.detailUser');
      tableUserDelete(id, deleteUserElement);
    });
  });

  nutThemUser.addEventListener('click', function () {
    hienThiFormUser();
  });

  cancelBtn.addEventListener('click', function () {
    closeFormUser();
  });

  editUserButtons.forEach(function (editButton) {
    editButton.addEventListener('click', function () {
      var id = editButton.getAttribute('data-user-id');
      btnUserOK.dataset.userId = id;
      hienThiFormUser();
      titleFormUser.textContent = 'Chỉnh sửa tài khoản';
    });
  });

  btnUserOK.onclick = () => {
    const id = btnUserOK.dataset.userId || '';
    const email = userEmail.value;
    const ten = userTen.value;
    const matKhau = userMatKhau.value;
    const discardImage = userCloseImage.value;

    var data = new FormData();
    data.append('id', id);
    data.append('email', email);
    data.append('fullName', ten);
    data.append('password', matKhau);
    data.append('discardImage', discardImage);
    data.append('image', userAvatar.files[0]);

    var method = 'POST';
    if (titleFormUser.innerText == 'Chỉnh sửa tài khoản') {
      method = 'PUT';
      data.append('id', id);
    }

    const apiURL = new URL(
      '/user/create',
      window.location.href,
    ).href;

    fetch(apiURL, {
      method: method,
      body: data,
    })
      .then((response) => response.json())
      .then((dataResponse) => {
        alert(dataResponse['message']);
        wapperForm.style.display = 'none';
        formUser.style.display = 'none';
        if (response.status === 200) {
          userEmail.value = '';
          userTen.value = '';
          userMatKhau.value = '';
          userAvatar.value = '';
          userId.value = '';
          userCloseImage.value = '0';
          if (method == 'PUT') {
            updateRowTableUser(id, iframe, dataResponse['newUser']);
          }
        }
      })
      .catch((error) => console.error('Error:', error));
  };

  function hienThiFormUser() {
    formUser.style.display = 'flex'; // Hiển thị form-user
    wapperForm.style.display = 'block'; // Hiển thị phần nền
  }

  function closeFormUser() {
    formUser.style.display = 'none'; // Hiển thị form-user
    wapperForm.style.display = 'none'; // Hiển thị phần nền
  }
});

function tableUserDelete(id, deleteUserElement) {
  Swal.fire({
    title: 'Bạn có chắc chắn muốn xóa?',
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

function searchUser(text) {
  var url;
  url = '/user/search?text=' + text;
  window.location.href = url;
}
