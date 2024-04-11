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
      .then((response) => {
        if (response.status === 200) {
          return response.json().then((data) => {
            Swal.fire({
              title: 'Thành công!',
              text: data.message,
              icon: 'success',
              confirmButtonText: 'OK',
            }).then(() => {
              window.location.href = '/user/detail';
            });
          });
        } else if (response.status === 400) {
          return response.json().then((data) => {
            const errorMessage = data.message.replace(/\n/g, "<br>"); 
            const errorMessageElement = document.getElementById('error-message');
            errorMessageElement.innerHTML = errorMessage; 
            errorMessageElement.style.display = 'block'; 
          });
        } else {
          throw new Error('Network response was not ok');
        }
      })
      .catch((error) => console.log('Error: ', error));
  };
});



document.getElementById('image').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const imageURL = e.target.result;
    document.getElementById('avatar-img').src = imageURL;
  };
  reader.readAsDataURL(file);
});
