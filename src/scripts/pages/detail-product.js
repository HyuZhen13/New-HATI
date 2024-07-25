import UrlParser from '../routes/url-parser';
import ProductData from '../utils/product-data';
import UserInfo from '../utils/user-info';

const DetailProductPage = {
  async render() {
    return `
    <article class="product-detail-article">
      <div id="product-detail-container">
        <!-- Detail Product Here -->
      </div>
      
      <div id="btn-product">
        <button id="buy-now">Hubungi Untuk Memesan</button>
      </div>

      <div id="more-product-container">
        <h2>Produk Lainnya</h2>
        <div id="more-product"></div>
      </div>
    </article>
    `;
  },
  async afterRender() {
    const url = UrlParser.parseActiveUrlCaseSensitive();
    const product = await ProductData.getProductById(url.id);
    const productAll = await ProductData.getProduct();
    const store = await UserData.getUserData(product.uid);

    const productDetailContainer = document.querySelector('#product-detail-container');
    const buyNowButton = document.querySelector('#buy-now');
    const moreProduct = document.querySelector('#more-product');

    productDetailContainer.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <div>
      <h3>${product.name}</h3>
      <p>${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}</p>
      <p>Stok: ${product.stock}</p>
      <button id="buy-now">Hubungi Untuk Memesan</button>
      <p>${product.desc}</p>
    </div>
    `;

    buyNowButton.addEventListener('click', (event) => {
      event.preventDefault();
      this.addToCart(product);
    });

    Object.values(productAll).reverse().forEach((item) => {
      if (item.uid === product.uid && item.id !== product.id && moreProduct.childElementCount <= 3) {
        const productItem = document.createElement('div');
        productItem.innerHTML = `
        <div class="card">
          <img src="${item.image}" class="card-img-top" alt="${item.name}">
          <div class="card-body">
            <p class="card-text">${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}</p>
            <h5 class="card-title">${item.name}</h5>
          </div>
          <div class="card-footer">
            <small class="text-muted">${store.name} ${store.isVerified === 'verified' ? '<i class="fa-solid fa-circle-check fa-lg"></i>' : ''}</small>
          </div>
        </div>
        `;
        productItem.setAttribute('class', 'product-item');
        productItem.addEventListener('click', (event) => {
          event.preventDefault();
          location.href = `#/detail-product/${item.id}`;
        });
        moreProduct.appendChild(productItem);
      }
    });

    if (moreProduct.childElementCount === 0) {
      const productText = document.createElement('h5');
      productText.innerText = 'Toko ini hanya memiliki satu produk.';
      moreProduct.appendChild(productText);
    }
  },
  
  async addToCart(product) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex >= 0) {
      alert('Produk sudah ada di keranjang.');
      return;
    }

    if (product.stock <= 0) {
      alert('Stok produk tidak mencukupi.');
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      stock: product.stock,
    };

    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));

    alert('Produk berhasil ditambahkan ke keranjang.');
    location.href = '#/cart';
  }
};

export default DetailProductPage;
