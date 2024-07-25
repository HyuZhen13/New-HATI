/* eslint-disable max-len */
import UrlParser from '../routes/url-parser';
import ProductData from '../utils/product-data';
import UserData from '../utils/user-data';

const DetailProductPage = {
  async render() {
    return `
    <article class="product-detail-article">
      <div id="product-detail-container">
        
      </div>
      
      <div id="btn-product">
        <button id="store-detail">
          <img>
          <small class="text-muted">Penjual 
          <i class="fa-solid fa-circle-check fa-lg"></i></small>
        </button>
      </div>

      <div id="more-product-container">
        <h2>Other Items</h2>
        <div id="more-product">

        </div>
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
    const storeDetail = document.querySelector('#store-detail');
    const moreProduct = document.querySelector('#more-product');

    productDetailContainer.innerHTML = `
    <img src="${product.image}">
    <div>
      <h3>${product.name}</h3>
      <p>${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}</p>
      <p>Stok: ${product.stock}</p>
      <button id="buy-now">Hubungi Untuk Memesan</button>
      <p>${product.desc}</p>
    </div>
    `;

    const buyNow = document.querySelector('#buy-now');
    buyNow.addEventListener('click', (event) => {
      event.preventDefault();
      window.open(`https://wa.me/${store.phone}`, '_blank');
    });

    storeDetail.innerHTML = `
        <img src="${store.photo ? store.photo : './images/profile.png'}">
        <small class="text-muted">${store.name} ${store.isVerified === 'verified' ? '<i class="fa-solid fa-circle-check fa-lg"></i>' : ''}</small>
    `;
    storeDetail.addEventListener('click', (event) => {
      event.preventDefault();
      location.href = `#/store/${product.uid}`;
    });

    Object.values(productAll).reverse().forEach((item) => {
      const productItem = document.createElement('div');
      productItem.innerHTML = `
          <div class="card">
            <img src="${item.image}" class="card-img-top" alt="...">
            <div class="card-body">
            <p class="card-text">${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}</p>
            <h5 class="card-title">${item.name}</h5>
            </div>
            <div class="card-footer">
            <small class="text-muted">${store.name} ${store.isVerified === 'verified' ? '<i class="fa-solid fa-circle-check fa-lg'></i>' : ''}</small>
          </div>
        `;
      productItem.setAttribute('class', 'product-item');
      productItem.addEventListener('click', (event) => {
        event.preventDefault();
        location.href = `#/detail-product/${item.id}`;
      });
      if (item.uid === product.uid && item.id !== product.id && moreProduct.childElementCount <= 3) {
        moreProduct.appendChild(productItem);
      }
    });
    if (moreProduct.childElementCount === 0) {
      const productText = document.createElement('h5');
      productText.innerText = 'This store just have one product.';
      moreProduct.appendChild(productText);
    }
  },
};
export default DetailProductPage;
