import ProductData from '../utils/product-data';
import UserInfo from '../utils/user-info';

const OrderPage = {
  async render() {
    return `
      <div class="order-page">
        <h1>Riwayat Pesanan</h1>
        <div id="order-history" class="order-history"></div>
      </div>
    `;
  },

  async afterRender() {
    try {
      const userId = UserInfo.getUserInfo().uid;
      const orders = await ProductData.getOrders(userId);
      const orderHistoryContainer = document.querySelector('#order-history');

      if (orders && orders.length > 0) {
        orders.forEach(order => {
          const orderItem = document.createElement('div');
          orderItem.classList.add('order-item');
          orderItem.innerHTML = `
            <h4>ID Pesanan: ${order.id}</h4>
            <div class="order-details">
              ${order.items.map(item => `
                <div class="order-item-detail">
                  <img src="${item.image}" alt="${item.name}">
                  <div>
                    <h5>${item.name}</h5>
                    <p>Harga: ${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}</p>
                    <p>Jumlah: ${item.quantity}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          `;
          orderHistoryContainer.appendChild(orderItem);
        });
      } else {
        orderHistoryContainer.innerHTML = '<p>Belum ada pesanan.</p>';
      }
    } catch (error) {
      console.error(error);
      document.querySelector('#order-history').innerHTML = '<p>Gagal memuat riwayat pesanan.</p>';
    }

export default OrderPage; 
