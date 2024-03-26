document.addEventListener('DOMContentLoaded', function () {
  var curPass = document.querySelector('#currentPass');
  var newPass = document.querySelector('#newPass');
  var confirmPass = document.querySelector('#confirmPass');
  var submit = document.querySelector('#send');

  submit.addEventListener('click', function () {
    if (newPass.value !== confirmPass.value) {
      alert('Mật khẩu xác nhận không đúng.');
      return;
    }
    var data = {
      currentPassword: curPass.value,
      newPassword: newPass.value,
    };
    var method = 'POST';

    const apiURL = new URL(
      '/user/changePass',
      window.location.href,
    ).href;

    fetch(apiURL, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data['message']);
        window.location.href = '/user/detail';
      })
      .catch((error) => console.log('Error: ', error));
  });
});
