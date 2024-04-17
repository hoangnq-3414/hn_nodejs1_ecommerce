document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (response.ok) {
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else if (data.accountDisable) {
          Swal.fire({
            icon: 'error',
            title: 'Tài khoản của bạn đã bị vô hiệu hóa!',
            showConfirmButton: true,
            confirmButtonText: 'OK'
          });
        }
      } else {
        const errorMessage = data.message || 'Có lỗi xảy ra!';
        console.error(errorMessage);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: errorMessage,
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
