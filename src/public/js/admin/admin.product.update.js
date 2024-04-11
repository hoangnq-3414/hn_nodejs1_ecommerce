document.addEventListener('DOMContentLoaded', function () {
  const submitButton = document.getElementById('submit');
  submitButton.addEventListener('click', function (event) {
    event.preventDefault();
    const productIdInput = document.querySelector('#product-id').value;
    const name = document.querySelector('input[name="name"]').value;
    const description = document.querySelector(
      'input[name="description"]',
    ).value;
    const price = document.querySelector('input[name="price"]').value;
    const quantity = document.querySelector('input[name="quantity"]').value;
    const unit = document.querySelector('input[name="unit"]').value;
    const categoryId = document.getElementById('info').value;
    const image = document.querySelector('#image');
    const secondaryImageFiles = document.querySelector('#images-second').files;

    const formData = new FormData();
    formData.append('id', productIdInput);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('quantity', quantity);
    formData.append('unit', unit);
    formData.append('categoryId', categoryId);
    formData.append('primary-image', image.files[0]);
    for (let i = 0; i < secondaryImageFiles.length; i++) {
      formData.append('images-second', secondaryImageFiles[i]);
    }

    // Gửi dữ liệu đến backend
    fetch('/product/update', {
      method: 'PUT',
      body: formData,
    })
      .then((response) => {
        if (response.status === 400) {
          return response.json().then((dataResponse) => {
            if (dataResponse.errors) {
              const errorMessages = dataResponse.errors.map(error => error.msg).join('\n');
                  const errorMessageElement = document.getElementById('error-message');
                        errorMessageElement.innerHTML = errorMessages.replace(/\n/g, "<br>");
                        errorMessageElement.style.display = 'block';
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
              window.location.reload();
            }
          });
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  });
});
