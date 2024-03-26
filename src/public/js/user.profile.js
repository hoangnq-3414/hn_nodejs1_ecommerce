document.addEventListener('DOMContentLoaded', function () {
  var fullName = document.querySelector('input[name="name"]');
  var phone = document.querySelector('input[name="phone"]');
  var address = document.querySelector('input[name="address"]');
  var email = document.querySelector('input[name="email"]');
  var image = document.querySelector('#image');
  var submit = document.querySelector('#submit');

  submit.onclick = function () {
    var data = new FormData();
    data.append('fullName', fullName.value);
    data.append('email', email.value);
    data.append('address', address.value);
    data.append('phone', phone.value);
    data.append('image', image.files[0]);

    var method = 'POST';

    const apiURL = new URL('/user/edit', window.location.href).href;
    fetch(apiURL, {
      method: method,
      body: data,
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data['message']);
      })
      .catch((error) => console.log('Error: ', error));
  };
});
