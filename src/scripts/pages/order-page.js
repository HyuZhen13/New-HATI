import OrderData from '../utils/order-data';
import UserData from '../utils/user-data';
import UrlParser from '../../routes/url-parser';

const OrderPage = {
  async render() {
    return `
      <article class="order-page">
        <h1>Riwayat Pesanan</h1>
        <div id="order-details-container"></div>
      </article>
    `;
  },

  async afterRender() {
    const orderDetailsContainer = document.querySelector('#order-details-container');
    const user = await UserData.getUserInfo();

    try {
      const orders = await OrderData.getOrdersByUserId(user.uid);

      if (orders.length > 0) {
        orders.forEach(order => {
          let orderHtml = `
            <div class="order" id="order-${order.id}">
              <h2>Pesanan #${order.id}</h2>
              <p>Status: ${order.status}</p>
              <p>Tanggal: ${new Date(order.timestamp).toLocaleDateString('id-ID')}</p>
              <h3>Detail Pesanan:</h3>
              <div class="order-items">
          `;

          order.items.forEach(item => {
            orderHtml += `
              <div class="order-item">
                <img src="${item.image}" alt="${item.name}">
                <div>
                  <h4>${item.name}</h4>
                  <p>${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}</p>
                  <p>Kuantitas: ${item.quantity}</p>
                  <p>Seller: ${item.seller}</p>
                </div>
              </div>
            `;
          });

          orderHtml += `</div>`;

          if (order.paymentProof) {
            orderHtml += `
              <h3>Bukti Pembayaran:</h3>
              <img src="${order.paymentProof}" alt="Bukti Pembayaran" style="max-width: 300px;">
            `;
          } else {
            orderHtml += `<p>Bukti pembayaran belum diterima.</p>`;
          }

          orderHtml += `</div>`;
          orderDetailsContainer.innerHTML += orderHtml;
        });
      } else {
        orderDetailsContainer.innerHTML = '<p>Anda belum memiliki riwayat pesanan.</p>';
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      orderDetailsContainer.innerHTML = '<p>Terjadi kesalahan saat mengambil detail pesanan.</p>';
    }
  },
};

export default OrderPage;
