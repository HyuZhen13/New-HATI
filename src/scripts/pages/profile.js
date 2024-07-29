import UserInfo from '../utils/user-info';
import OrderData from '../utils/order-data';
import ProductData from '../utils/product-data';

const ProfilePage = {
  async render() {
    return `
      <div class="profile-page">
        <h1>Profil Penjual</h1>
        <div id="sold-products-container">
          <h2>Produk Terjual</h2>
          <div id="sold-products-list"></div>
        </div>
        <div id="completed-orders-container">
          <h2>Pesanan Selesai</h2>
          <div id="completed-orders-list"></div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    await this.renderSoldProducts();
    await this.renderCompletedOrders();
  },

  async renderSoldProducts() {
    const soldProductsContainer = document.querySelector('#sold-products-list');
    const userId = UserInfo.getUserInfo().uid;

    try {
      const orders = await OrderData.getCompletedOrders(userId);
      const productIds = new Set();
      
      orders.forEach(order => {
        order.items.forEach(item => {
          productIds.add(item.id);
        });
      });

      const products = await Promise.all(
        Array.from(productIds).map(id => ProductData.getProductById(id))
      );

      if (products.length > 0) {
        products.forEach(product => {
          const productElement = document.createElement('div');
          productElement.classList.add('product');
          productElement.innerHTML = `
            <h3>${product.name}</h3>
            <img src="${product.image}" alt="${product.name}">
            <p>${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}</p>
            <p>Stok: ${product.stock}</p>
            <button data-id="${product.id}" class="view-feedback-button">Lihat Ulasan</button>
          `;
          soldProductsContainer.appendChild(productElement);

          const viewFeedbackButton = productElement.querySelector('.view-feedback-button');
          viewFeedbackButton.addEventListener('click', async () => {
            try {
              const feedbacks = await OrderData.getProductFeedback(product.id);
              const feedbackList = document.createElement('div');
              feedbackList.classList.add('feedback-list');
              feedbacks.forEach(feedback => {
                const feedbackItem = document.createElement('div');
                feedbackItem.classList.add('feedback-item');
                feedbackItem.innerHTML = `
                  <p><strong>${feedback.userId}</strong></p>
                  <p>Rating: ${feedback.rating} / 5</p>
                  <p>${feedback.comment}</p>
                `;
                feedbackList.appendChild(feedbackItem);
              });
              document.body.appendChild(feedbackList);
            } catch (error) {
              console.error('Error fetching product feedback:', error);
              alert('Gagal memuat ulasan produk.');
            }
          });
        });
      } else {
        soldProductsContainer.innerHTML = '<p>Tidak ada produk yang terjual.</p>';
      }
    } catch (error) {
      console.error('Error fetching sold products:', error);
      soldProductsContainer.innerHTML = '<p>Gagal memuat produk yang terjual.</p>';
    }
  },

  async renderCompletedOrders() {
    const completedOrdersContainer = document.querySelector('#completed-orders-list');
    const userId = UserInfo.getUserInfo().uid;

    try {
      const orders = await OrderData.getCompletedOrders(userId);
      if (orders.length > 0) {
        orders.forEach(order => {
          const orderElement = document.createElement('div');
          orderElement.classList.add('order');
          orderElement.innerHTML = `
            <h3>Pesanan ${order.id}</h3>
            <p>Bukti Pembayaran: <img src="${order.paymentProof}" alt="Bukti Pembayaran"></p>
            <div class="order-items">
              ${order.items.map(item => `
                <div class="order-item">
                  <img src="${item.image}" alt="${item.name}">
                  <h4>${item.name}</h4>
                  <p>${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}</p>
                  <p>Jumlah: ${item.quantity}</p>
                  <p>Rating: ${item.rating || 'Belum diberi rating'}</p>
                  <p>Komentar: ${item.comment || 'Belum ada komentar'}</p>
                </div>
              `).join('')}
            </div>
          `;
          completedOrdersContainer.appendChild(orderElement);
        });
      } else {
        completedOrdersContainer.innerHTML = '<p>Tidak ada pesanan yang selesai.</p>';
      }
    } catch (error) {
      console.error('Error fetching completed orders:', error);
      completedOrdersContainer.innerHTML = '<p>Gagal memuat pesanan selesai.</p>';
    }
  }
};

export default ProfilePage;
