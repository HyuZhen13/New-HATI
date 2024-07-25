import OrderData from '../utils/order-data';
import UserInfo from '../utils/user-info';

const OrderPage = {
  async render() {
    return `
      <div class="order-page">
        <h1>Detail Pesanan</h1>
        <div id="order-details" class="order-details"></div>
        <button id="complete-order" disabled>Pesanan Selesai</button>
      </div>
    `;
  },
  async afterRender() {
    const orderDetailsContainer = document.querySelector('#order-details');
    const completeOrderButton = document.querySelector('#complete-order');

    const order = await OrderData.getCurrentOrder();
    if (order) {
      orderDetailsContainer.innerHTML = `
        <div class="order-item">
          <h2>Pesanan Anda</h2>
          <p>Total Harga: ${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.totalPrice)}</p>
          <img src="${order.paymentProofUrl}" alt="Bukti Pembayaran">
        </div>
      `;

      completeOrderButton.disabled = false;
    } else {
      orderDetailsContainer.innerHTML = '<p>Tidak ada pesanan yang sedang diproses.</p>';
    }

    completeOrderButton.addEventListener('click', async () => {
      try {
        await OrderData.completeOrder();
        alert('Pesanan Anda telah selesai.');
        location.href = '#/';
      } catch (error) {
        alert('Gagal menyelesaikan pesanan: ' + error.message);
      }
    });
  },
};

export default OrderPage;
