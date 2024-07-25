import { getDatabase, ref, get } from 'firebase/database';
import UserInfo from '../utils/user-info';
import ProductData from '../utils/product-data';

const OrderPage = {
  async render() {
    return `
      <div class="order-page">
        <h2>Riwayat Pesanan</h2>
        <div id="order-list">Memuat pesanan...</div>
      </div>
    `;
  },

  async afterRender() {
    const userId = UserInfo.getUserInfo().uid;
    const orders = await ProductData.getOrders(userId);

    const orderListContainer = document.getElementById('order-list');

    if (!orders || Object.keys(orders).length === 0) {
      orderListContainer.innerHTML = '<p>Belum ada pesanan.</p>';
      return;
    }

    orderListContainer.innerHTML = Object.values(orders).map(order => `
      <div class="order-item">
        <h3>Pesanan ID: ${order.id}</h3>
        <p>Tanggal: ${new Date(order.timestamp).toLocaleString()}</p>
        <div class="order-details">
          ${order.items.map(item => `
            <div class="order-product">
              <img src="${item.image}" alt="${item.name}" />
              <p>Nama: ${item.name}</p>
              <p>Jumlah: ${item.quantity}</p>
              <p>Harga: Rp${item.price}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  },
};

export default OrderPage;
