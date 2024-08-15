import UrlParser from '../routes/url-parser';
import ProductData from '../utils/product-data';
import UserData from '../utils/user-data';
import CartData from '../utils/cart-data';
import OrderData from '../utils/order-data';
import UserInfo from '../utils/user-info'; // Pastikan modul ini diimpor

const DetailProductPage = {
  async render() {
    return `
      <article class="product-detail-article">
        <div id="product-detail-container"></div>
        <div id="btn-product">
          <button id="store-detail">
            <img>
            <small class="text-muted">Penjual 
            <i class="fa-solid fa-circle-check fa-lg"></i></small>
          </button>
        </div>
        <div id="more-product-container">
          <h2>Other Items</h2>
          <div id="more-product"></div>
        </div>
        <div id="feedback-container">
          <h2>Ulasan Produk</h2>
          <div id="feedback-list"></div>
        </div>
      </article>
    `;
  },

  async afterRender() {
    const url = UrlParser.parseActiveUrlCaseSensitive();
    const product = await ProductData.getProductById(url.id);
    const productAll = await ProductData.getProduct();
    const store = await UserData.getUserData(product.uid);
    const userInfo = UserInfo.getUserInfo(); // Inisialisasi userInfo dengan benar

    const productDetailContainer = document.querySelector('#product-detail-container');
    const storeDetail = document.querySelector('#store-detail');
    const moreProduct = document.querySelector('#more-product');
    const feedbackList = document.querySelector('#feedback-list');
    
    productDetailContainer.innerHTML = `
      <img src="${product.image}">
      <div>
        <h3>${product.name}</h3>
        <p>${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}</p>
        <p>Stok: ${product.stock}</p>
        <button id="buy-now">Hubungi Untuk Memesan</button>
        <button id="add-to-cart" ${product.stock <= 0 ? 'disabled' : ''}>Tambah ke Keranjang</button>
        <p>${product.desc}</p>
      </div>
    `;

    const buyNow = document.querySelector('#buy-now');
    buyNow.addEventListener('click', (event) => {
      event.preventDefault();
      window.open(`https://wa.me/${store.phone}`, '_blank');
    });

    const addToCart = document.querySelector('#add-to-cart');
    addToCart.addEventListener('click', async (event) => {
      event.preventDefault();

      const cartItem = {
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: 1, // default quantity to 1
        uid: product.uid,
        userName: userInfo.name, // Menggunakan nama pengguna yang sedang login
      };
      
      if (product.stock > 0) {
        await CartData.addCartItem(cartItem);
        alert('Produk telah ditambahkan ke keranjang');
        window.location.href = '#/cart';
      } else {
        alert('Produk tidak tersedia dalam stok.');
      }
    });

    storeDetail.innerHTML = `
      <img src="${store.photo ? store.photo : './Images/profile.png'}">
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
            <small class="text-muted">${store.name} ${store.isVerified === 'verified' ? '<i class="fa-solid fa-circle-check fa-lg"></i>' : ''}</small>
          </div>
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
      productText.innerText = 'Toko ini hanya memiliki satu produk.';
      moreProduct.appendChild(productText);
    }

    // Menambahkan bagian untuk menampilkan komentar dan rating produk
    try {
      const feedbacks = await OrderData.getProductFeedback(product.id);
      if (feedbacks.length > 0) {
        feedbacks.forEach(feedback => {
          const feedbackItem = document.createElement('div');
          feedbackItem.classList.add('feedback-item');
          feedbackItem.innerHTML = `
            <p><strong>${feedback.userName}</strong></p>
            <p>Rating: ${feedback.rating} / 5</p>
            <p>${feedback.comment}</p>
            <p><small>Diberikan pada: ${new Date(feedback.timestamp).toLocaleString()}</small></p>
          `;
          feedbackList.appendChild(feedbackItem);
        });
      } else {
        feedbackList.innerHTML = '<p>Tidak ada ulasan untuk produk ini.</p>';
      }
    } catch (error) {
      console.error('Error fetching product feedback:', error);
      feedbackList.innerHTML = '<p>Gagal memuat ulasan produk.</p>';
    }
  },
};

export default DetailProductPage;
