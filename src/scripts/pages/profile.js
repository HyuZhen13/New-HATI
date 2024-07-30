import UserInfo from '../utils/user-info';
import OrderData from '../utils/order-data';
import ProductData from '../utils/product-data'; // Pastikan ProductData diimpor jika digunakan

const ProfilePage = {
  async render() {
    const userId = UserInfo.getUserInfo().uid;
    const completedOrders = await OrderData.getCompletedOrders(userId);
    const soldProducts = await this.getSoldProducts(userId);
    const feedbackData = await this.getFeedbackData(soldProducts);

    return `
    <style>
      .profile-article, .product-article, .order-article {
        margin-bottom: 20px;
      }
      .profile-container, .product-container, .order-container {
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        background: #fff;
      }
      .profile-container img {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
      }
      .product-list, .order-list {
        list-style-type: none;
        padding: 0;
      }
      .product-item, .order-item {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        border-bottom: 1px solid #eee;
      }
      .product-item:last-child, .order-item:last-child {
        border-bottom: none;
      }
      .product-item img {
        width: 50px;
        height: 50px;
        border-radius: 5px;
        object-fit: cover;
      }
      .feedback-container {
        padding: 10px;
        background-color: #f9f9f9;
        border-radius: 5px;
      }
      .feedback-item {
        margin-bottom: 10px;
      }
      .feedback-item:last-child {
        margin-bottom: 0;
      }
      .feedback-rating {
        font-weight: bold;
      }
    </style>
    <div class="profile-article">
      <div class="profile-container">
        <h2>Profil Penjual</h2>
        <!-- Tampilkan informasi profil penjual di sini -->
      </div>
    </div>
    <div class="product-article">
      <div class="product-container">
        <h2>Produk Terjual</h2>
        <ul class="product-list">
          ${soldProducts.map(product => `
            <li class="product-item">
              <img src="${product.image}" alt="${product.name}" />
              <div>
                <h3>${product.name}</h3>
                <p>Terjual: ${product.quantity} pcs</p>
                <div class="feedback-container">
                  ${feedbackData[product.id] ? feedbackData[product.id].map(feedback => `
                    <div class="feedback-item">
                      <p><span class="feedback-rating">Rating: ${feedback.rating}</span> - ${feedback.comment}</p>
                      <p>Oleh: ${feedback.userId}</p>
                    </div>
                  `).join('') : '<p>Belum ada umpan balik.</p>'}
                </div>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
    <div class="order-article">
      <div class="order-container">
        <h2>Pesanan Selesai</h2>
        <ul class="order-list">
          ${completedOrders.map(order => `
            <li class="order-item">
              <div>
                <h3>Pesanan #${order.id}</h3>
                <p>Tanggal: ${new Date(order.timestamp).toLocaleString()}</p>
                <p>Total: ${order.items.reduce((total, item) => total + (item.price * item.quantity), 0)}</p>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
    `;
  },

  async afterRender() {
    // Setelah konten dirender, tambahkan event listener atau manipulasi DOM di sini jika diperlukan
  },

  async getSoldProducts(userId) {
    const products = await ProductData.getProductsByUser(userId); // Pastikan method ini ada dan bekerja dengan benar
    const orders = await OrderData.getOrdersByProducts(products);
    const soldProducts = [];

    orders.forEach(order => {
      order.items.forEach(item => {
        const existingProduct = soldProducts.find(product => product.id === item.id);
        if (existingProduct) {
          existingProduct.quantity += item.quantity;
        } else {
          soldProducts.push({
            id: item.id,
            name: item.name,
            image: item.image,
            quantity: item.quantity,
          });
        }
      });
    });

    return soldProducts;
  },

  async getFeedbackData(products) {
    const feedbackData = {};
    for (const product of products) {
      const feedbacks = await OrderData.getProductFeedback(product.id);
      feedbackData[product.id] = feedbacks;
    }
    return feedbackData;
  }
};

export default ProfilePage;
