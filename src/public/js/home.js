function searchProducts() {
    const priceRanges = [];
    document.querySelectorAll('input[name="priceRange"]:checked').forEach(checkbox => {
        priceRanges.push(checkbox.value);
    });

    const categories = [];
    document.querySelectorAll('input[name="category"]:checked').forEach(checkbox => {
        categories.push(checkbox.value);
    });

    // Gửi dữ liệu đến backend
    fetch('/product/multisearch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ priceRanges, categories })
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            displayProducts(data.searchProducts);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function displayProducts(products) {
    const dataProduct = document.getElementById('home_product');
    dataProduct.innerHTML = '';
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
    products.forEach(product => {
        const productHTML = `
            <div class='col-lg-4'>
                <a href='/product/detail/${product.id}'>
                    <img src='${product.image}' class='thumbnail' style='object-fit: cover; width: 300px;' />
                </a>
                <div class='box-element product' style='width: 300px;'>
                    <h6><strong>${product.name}</strong></h6>
                    <h6>Luot ban: ${product.numberSold}</h6>
                    <p>${product.description}</p>
                    <hr />
                    <form action='/cart/add/${product.id}' method='post' style='display: inline;'>
                        <button type='submit' class='btn btn-outline-success'>Add to Cart</button>
                    </form>
                    <a class='btn btn-outline-success' href='/product/detail/${product.id}'>View</a>
                    <h4 style='display: inline-block;' class='float-right'><strong>${product.price}</strong></h4>
                </div>
            </div>
        `;
        productList.innerHTML += productHTML;
    });
}
