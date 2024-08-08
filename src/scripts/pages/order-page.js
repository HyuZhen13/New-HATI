
import CartData from './cart-data';
import UserInfo from './user-info';

const orderPage = {
  async render() {
    const userId = UserInfo.getUserInfo().uid;
    const orders = await CartData.getOrders(userId);
    const orderList = orders ? Object.values(orders).map(order => `
      <div class="order">
        <h2>Pesanan ID: ${order.id}</h2>
        <ul>
          ${order.items.map(item => `
            <li>
              <img src="${item.image}" alt="${item.name}" />
              <div>Nama: ${item.name}</div>
              <div>Harga: ${item.price}</div>
              <div>Jumlah: ${item.quantity}</div>
              <div>Penjual: ${item.seller}</div>
              <div>Telepon: ${item.phone}</div>
              <div>Pembeli: ${item.buyerName}</div>
            </li>
          `).join('')}
        </ul>
        <div>Total: ${order.items.reduce((total, item) => total + item.price * item.quantity, 0)}</div>
        ${order.paymentProof ? `<img src="${order.paymentProof}" alt="Bukti Pembayaran" />` : ''}
        ${order.status === 'unpaid' ? `
          <input type="file" id="upload-proof" />
          <button id="upload-proof-button">Unggah Bukti Pembayaran</button>
        ` : '<div>Pesanan sudah dibayar.</div>'}
      </div>
    `).join('');

    return `
      <div id="orders">
        <h1>Daftar Pesanan</h1>
        ${orderList}
      </div>
    `;
  },

  async afterRender() {
    document.getElementById('upload-proof-button')?.addEventListener('click', async () => {
      const orderId = document.querySelector('.order h2').textContent.split(': ')[1];
      const paymentProof = document.getElementById('upload-proof').files[0];
      if (paymentProof) {
        await CartData.uploadPaymentProof(orderId, paymentProof);
        location.reload();
      } else {
        alert('Harap unggah bukti pembayaran.');
      }
    });
  }
};

export default orderPage;
