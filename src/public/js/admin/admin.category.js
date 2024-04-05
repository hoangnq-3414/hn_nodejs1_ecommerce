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

  nutThemUser.addEventListener('click', function () {
    hienThiFormUser();
  });

  cancelBtn.addEventListener('click', function () {
    closeFormUser();
  });

  editUserButtons.forEach(function (editButton) {
    editButton.addEventListener('click', function () {
      var id = editButton.getAttribute('data-user-id');
      var name =
        editButton.parentElement.parentElement.parentElement.querySelector(
          '.td-div-username',
        ).textContent;
      var description =
        editButton.parentElement.parentElement.parentElement.querySelector(
          '.description',
        ).textContent;

      nameCategory.value = name;
      descriptionCategory.value = description;

      btnUserOK.dataset.userId = id;
      hienThiFormUser();
      titleFormUser.textContent = 'Chỉnh sửa category';
    });
  });

  btnUserOK.onclick = () => {
    const id = btnUserOK.dataset.userId || '';
    const name = nameCategory.value;
    const description = descriptionCategory.value;
    const data = {
      id: id,
      name: name,
      description: description,
    };
    var method = 'POST';
    if (titleFormUser.innerText == 'Chỉnh sửa category') {
      method = 'PUT';
    }

    const apiURL = new URL('/category/create', window.location.href).href;

    fetch(apiURL, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.status === 400) {
          // Xử lý lỗi validation trên giao diện người dùng
          return response.json().then((dataResponse) => {
            if (dataResponse.errors) {
              const errorMessages = dataResponse.errors
                .map((error) => error.msg)
                .join('\n');
              Swal.fire({
                title: 'Lỗi!',
                html: errorMessages.replace(/\n/g, '<br>'),
                icon: 'error',
                confirmButtonText: 'OK',
              });
            }
          });
        } else if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((dataResponse) => {
        if (dataResponse && dataResponse.message) {
          Swal.fire({
            title: 'Thành công!',
            text: dataResponse.message,
            icon: 'success',
            confirmButtonText: 'OK',
          }).then((result) => {
            if (result.isConfirmed) {
              wapperForm.style.display = 'none';
              formUser.style.display = 'none';
              window.location.reload();
            }
          });
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  function hienThiFormUser() {
    formUser.style.display = 'flex';
    wapperForm.style.display = 'block';
  }

  function closeFormUser() {
    formUser.style.display = 'none';
    wapperForm.style.display = 'none';
  }
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
      ? 'Bạn có chắc chắn muốn vô hiệu hóa category?'
      : 'Bạn có chắc chắn muốn kích hoạt category?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'OK',
  }).then((result) => {
    if (result.isConfirmed) {
      const apiURL = new URL(
        `/category/changeStatus/${id}`,
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
  url = '/category/search?text=' + text;
  window.location.href = url;
}
