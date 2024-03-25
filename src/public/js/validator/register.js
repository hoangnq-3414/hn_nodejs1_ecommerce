Validator({
    form: "#form-1",
    formGroupSelector: '.form-group',
    errorSelector: '.form-message',
    rules: [
      Validator.isRequired('#fullName', 'vui long nhap ho va ten'),
      Validator.isRequired('#email'),
      Validator.isEmail('#email'),
      Validator.isRequired('#password'),
      Validator.minLenght('#password', 6),
      Validator.isConfirmed('#password_confirmation', function () {
        return document.querySelector('#form-1 #password').value;
      }, 'mat khau khong chinh xac')
    ],
    onSubmit: function (data) {
    }
  });
