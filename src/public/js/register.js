document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fullName, email, password, confirmPassword })
      });
      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Tài khoản đã được tạo thành công!',
          showConfirmButton: true,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = '/auth/login';
          }
        });
      } else {
        const errorMessage = Array.isArray(data.message) ? data.message.join('<br>') : data.message || 'Có lỗi xảy ra!';
        console.error(errorMessage);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          html: errorMessage, 
          showConfirmButton: true,
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Có lỗi xảy ra khi thực hiện yêu cầu!',
        showConfirmButton: true,
        confirmButtonText: 'OK'
      });
    }
  });
});
