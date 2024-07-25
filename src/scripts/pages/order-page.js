import ProductData from '../utils/product-data';
import UserInfo from '../utils/user-info';

const OrderPage = {
  async render() {
    return `
    <article class="order-page-article">
      <div id="order-container">
        <h2>Riwayat Pesanan</h2>
        <div id="order-items"></div>
      </div>
    </article>
    `;
  },
  async afterRender() {
    const orderContainer = document.querySelector('#order-items');
    const userId = UserInfo.getUserInfo().uid;

    // Fetch orders from Firebase
    const orders = await ProductData.getOrders(userId);

    if (orders.length === 0) {
      orderContainer.innerHTML = '<p>Belum ada pesanan.</p>';
      return;
    }

    orderContainer.innerHTML = orders.map(order => `
      <div class="order-item">
        <img src="${order.image}" alt="${order.name}">
        <h4>${order.name}</h4>
        <p>${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.price)}</p>
        <p>Jumlah: ${order.quantity}</p>
        <p>Metode Pembayaran: ${order.paymentProof ? '<img src="' + order.paymentProof + '" alt="Payment Proof" style="width:100px;">' : 'Belum diunggah'}</p>
      </div>
    `).join('');
  },
};

export default OrderPage;
