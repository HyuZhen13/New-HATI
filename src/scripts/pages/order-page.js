import { getDatabase, ref, set, update, get } from 'firebase/database';
import UserInfo from '../utils/user-info';
import OrderData from '../utils/order-data';

const OrderPage = {
  async render() {
    return `
      <div class="order-page">
        <h1>Detail Pesanan</h1>
        <div id="order-details" class="order-details"></div>
        <h1>Pesanan Selesai</h1>
        <div id="completed-orders" class="completed-orders"></div>
      </div>
    `;
  },
  async afterRender() {
    this.renderCurrentOrder();
    this.renderCompletedOrders();
  },
  async renderCurrentOrder() {
    const orderDetailsContainer = document.querySelector('#order-details');
    const userId = UserInfo.getUserInfo().uid;

    const order = await OrderData.getCurrentOrder();
    if (order) {
      // Mendapatkan total harga dari elemen di halaman keranjang
      const totalPriceElement = document.querySelector('#total-price');
      const totalPrice = totalPriceElement ? parseFloat(totalPriceElement.textContent.replace(/[^\d.-]/g, '')) : order.totalPrice;

      orderDetailsContainer.innerHTML = `
        <h2>Pesanan Anda</h2>
        <p>Total Harga: ${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalPrice)}</p>
        <img src="${order.paymentProof}" alt="Bukti Pembayaran">
        <div id="order-items"></div>
      `;

      const orderItemsContainer = document.querySelector('#order-items');
      order.items.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.classList.add('order-item');
        orderItem.innerHTML = `
          <img src="${item.image}" alt="${item.name}">
          <h4>${item.name}</h4>
          <p>${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}</p>
          <p>Jumlah: ${item.quantity}</p>
          <textarea class="comment-input" placeholder="Tulis komentar..."></textarea>
          <input type="number" class="rating-input" min="1" max="5" placeholder="Rating (1-5)" />
          <button data-id="${item.id}" data-order-id="${order.id}" class="save-feedback-button">Simpan Rating dan Komentar</button>
        `;
        orderItemsContainer.appendChild(orderItem);

        const saveFeedbackButton = orderItem.querySelector('.save-feedback-button');
        saveFeedbackButton.addEventListener('click', async () => {
          const rating = orderItem.querySelector('.rating-input').value;
          const comment = orderItem.querySelector('.comment-input').value;

          if (rating && comment) {
            try {
              await OrderData.saveProductFeedback(order.id, item.id, rating, comment);
              alert('Rating dan komentar berhasil disimpan.');
              saveFeedbackButton.disabled = true; // Disable button after saving
            } catch (error) {
              alert('Gagal menyimpan rating dan komentar: ' + error.message);
            }
          } else {
            alert('Silakan isi rating dan komentar.');
          }
        });
      });
    } else {
      orderDetailsContainer.innerHTML = '<p>Tidak ada pesanan yang sedang diproses.</p>';
    }
  },

  async renderCompletedOrders() {
    const completedOrdersContainer = document.querySelector('#completed-orders');
    const userId = UserInfo.getUserInfo().uid;

    try {
      const orders = await OrderData.getCompletedOrders(userId);
      if (orders.length > 0) {
        orders.forEach(order => {
          const orderElement = document.createElement('div');
          orderElement.classList.add('order');
          orderElement.innerHTML = `
            <h2>Pesanan Selesai - ${order.id}</h2>
            <p>Total Harga: ${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.totalPrice)}</p>
            <img src="${order.paymentProof}" alt="Bukti Pembayaran">
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

export default OrderPage;
