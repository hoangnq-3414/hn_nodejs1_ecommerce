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
            <div class='col-lg-4' style="margin-left:-10px" >
                <a href='/product/detail/${product.id}'>
                    <img src='${product.image}' class='thumbnail' />
                </a>
                <div class='box-element product'>
                    <h6><strong>${product.name}</strong></h6>
                    <h6>Lượt bán: ${product.numberSold}</h6>
                        <div class='description-wrapper'>
                            <p class='description'>${product.description}</p>
                        <button class='expand-button'>...</button>
                    </div>
                    <hr />
                    <form action='/cart/add/${product.id}' method='post' class="form-cart">
                        <button type='submit' class='btn btn-outline-success'>Add to Cart</button>
                    </form>
                    <a class='btn btn-outline-success' href='/product/detail/${product.id}'>View</a>
                    <h4 class='float-right'><strong>${product.price}$</strong></h4>
                </div>
            </div>
        `;
        productList.innerHTML += productHTML;
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const classifyOrdersLinks = document.querySelectorAll('.selection-a');
    const savedStatus = sessionStorage.getItem('selectedStatus');

    classifyOrdersLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            classifyOrdersLinks.forEach(link => {
                link.classList.remove('status-active');
            });
            this.classList.add('status-active');
            const status = this.getAttribute('href').split('/').pop();
            sessionStorage.setItem('selectedStatus', status);
        });

        const status = link.getAttribute('href').split('/').pop();
        if (savedStatus && status === savedStatus) {
            link.classList.add('status-active');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');

    searchButton.addEventListener('click', (event) => {
        event.preventDefault();

        const dataProduct = document.getElementById('home_product');
        dataProduct.innerHTML = '';

        const searchText = searchInput.value;
        fetch(`/product/search?searchText=${searchText}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch search results');
                }
                return response.json();
            })
            .then(data => {
                const productList = document.getElementById('searchResults');
                productList.innerHTML = '';
                data.products.forEach(product => {
                    const productHTML = `
            <div class='col-lg-4' style="margin-left:-10px" >
                <a href='/product/detail/${product.id}'>
                    <img src='${product.image}' class='thumbnail' />
                </a>
                <div class='box-element product'>
                    <h6><strong>${product.name}</strong></h6>
                    <h6>Lượt bán: ${product.numberSold}</h6>
                        <div class='description-wrapper'>
                            <p class='description'>${product.description}</p>
                        <button class='expand-button'>...</button>
                    </div>
                    <hr />
                    <form action='/cart/add/${product.id}' method='post' class="form-cart">
                        <button type='submit' class='btn btn-outline-success'>Add to Cart</button>
                    </form>
                    <a class='btn btn-outline-success' href='/product/detail/${product.id}'>View</a>
                    <h4 class='float-right'><strong>${product.price}$</strong></h4>
                </div>
            </div>
        `;
                    productList.innerHTML += productHTML;
                });
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
});
