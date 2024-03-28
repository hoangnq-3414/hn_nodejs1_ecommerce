function showCommentsByRating(productId, rating) {
  fetch(`/product/comment?productId=${productId}&rating=${rating}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Lỗi khi lấy dữ liệu bình luận');
      }
      return response.json();
    })
    .then((data) => {
      const container = document.querySelector('.review-p2');

      const reviewElements = document.querySelectorAll('.wapper-review');
      reviewElements.forEach((element) => {
        element.remove();
      });

      data.productReviews.forEach((comment) => {
        const reviewWrapper = document.createElement('div');
        reviewWrapper.classList.add('wapper-review');
        reviewWrapper.innerHTML = `
            <div class='rv-avt'>
              <img width='50px' height='50px' src='${comment.user.image}' />
            </div>
            <div class='rv-detail-content'>
              <div class='rv-name'>${comment.user.fullName}</div>
              <div class='rv-stars'>
                ${Array.from(
                  { length: comment.rating },
                  (_, index) =>
                    `<div class='rv-star star-active'><i class='fa-solid fa-star'></i></div>`,
                ).join('')}
                ${Array.from(
                  { length: 5 - comment.rating },
                  (_, index) =>
                    `<div class='rv-star'><i class='fa-solid fa-star'></i></div>`,
                ).join('')}
              </div>
              <div class='rv-time'>${comment.createdAt}</div>
              <div class='rv-comment'>${comment.comment}</div>
            </div>
          `;
        container.appendChild(reviewWrapper);
      });
      const paginationContainer = document.querySelector('.pagination');
      paginationContainer.innerHTML = data.paginationLinks;
    })
    .catch((error) => {
      console.error(error.message);
    });
}
