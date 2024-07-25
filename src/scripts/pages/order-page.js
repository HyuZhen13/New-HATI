import OrderData from '../utils/order-data';
import { getDatabase, ref, set, update, get } from 'firebase/database';
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
    const userId = UserInfo.getUserInfo().uid;

    const order = await OrderData.getCurrentOrder();
    if (order) {
      orderDetailsContainer.innerHTML = `
        <h2>Pesanan Anda</h2>
        <p>Total Harga: ${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.totalPrice)}</p>
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
          <button data-id="${item.id}" class="save-feedback-button">Simpan Rating dan Komentar</button>
        `;
        orderItemsContainer.appendChild(orderItem);

        const saveFeedbackButton = orderItem.querySelector('.save-feedback-button');
        saveFeedbackButton.addEventListener('click', async () => {
          const rating = orderItem.querySelector('.rating-input').value;
          const comment = orderItem.querySelector('.comment-input').value;

          if (rating && comment) {
            try {
              await this.saveProductFeedback(item.id, rating, comment);
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

      completeOrderButton.disabled = false;
    } else {
      orderDetailsContainer.innerHTML = '<p>Tidak ada pesanan yang sedang diproses.</p>';
    }

    completeOrderButton.addEventListener('click', async () => {
      try {
        await OrderData.completeOrder();
        alert('Pesanan Anda telah selesai.');
        location.href = '#/completed-orders';
      } catch (error) {
        alert('Gagal menyelesaikan pesanan: ' + error.message);
      }
    });
  },

  async saveProductFeedback(productId, rating, comment) {
    const db = getDatabase();
    const userId = UserInfo.getUserInfo().uid;
    const feedbackRef = ref(db, `product-feedback/${userId}/${productId}`);

    try {
      await set(feedbackRef, { rating, comment });
      await this.moveProductToCompletedOrders(productId);
    } catch (error) {
      console.error('Error saving feedback:', error);
      throw error;
    }
  },

  async moveProductToCompletedOrders(productId) {
    const db = getDatabase();
    const userId = UserInfo.getUserInfo().uid;
    const ordersRef = ref(db, `orders/${userId}`);
    const completedOrdersRef = ref(db, `completed-orders/${userId}`);

    try {
      const ordersSnapshot = await get(ordersRef);
      if (!ordersSnapshot.exists()) {
        throw new Error('Tidak ada pesanan yang ditemukan.');
      }

      const ordersData = ordersSnapshot.val();
      const orderIds = Object.keys(ordersData);

      for (const orderId of orderIds) {
        const orderRef = ref(db, `orders/${userId}/${orderId}`);
        const orderData = ordersData[orderId];
        
        const itemIndex = orderData.items.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
          // Move item to completed orders
          const completedOrderRef = ref(db, `completed-orders/${userId}/${orderId}`);
          const item = orderData.items.splice(itemIndex, 1)[0];
          
          await update(orderRef, { items: orderData.items });
          await set(completedOrderRef, { ...orderData, items: [...orderData.items, item] });
          break;
        }
      }
    } catch (error) {
      console.error('Error moving product to completed orders:', error);
      throw error;
    }
  }
};

export default OrderPage;
