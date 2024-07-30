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
    await this.renderCurrentOrder();
    await this.renderCompletedOrders();
  },

  async renderCurrentOrder() {
    const orderDetailsContainer = document.querySelector('#order-details');
    const userId = UserInfo.getUserInfo().uid;

    try {
      const order = await OrderData.getCurrentOrder();
      if (order) {
        orderDetailsContainer.innerHTML = `
          <h2>Pesanan Anda</h2>
          <img src="${order.paymentProof}" alt="Bukti Pembayaran">
          <div id="order-items"></div>
        `;

        const orderItemsContainer = document.querySelector('#order-items');
        if (Array.isArray(order.items)) {
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
              const comment = orderItem.querySelector('.comment-input').value;
              const rating = parseInt(orderItem.querySelector('.rating-input').value, 10);
              if (rating < 1 || rating > 5) {
                alert('Rating harus antara 1 hingga 5.');
                return;
              }
              try {
                await OrderData.saveProductFeedback(saveFeedbackButton.dataset.orderId, saveFeedbackButton.dataset.id, rating, comment);
                alert('Feedback berhasil disimpan!');
                console.log('Feedback saved successfully');
              } catch (error) {
                console.error('Error saving feedback:', error);
                alert('Terjadi kesalahan saat menyimpan feedback.');
              }
            });
          });
        }
      } else {
        orderDetailsContainer.innerHTML = '<p>Anda tidak memiliki pesanan saat ini.</p>';
      }
    } catch (error) {
      console.error('Error rendering current order:', error);
      orderDetailsContainer.innerHTML = '<p>Terjadi kesalahan saat memuat pesanan.</p>';
    }
  },

  async renderCompletedOrders() {
    const completedOrdersContainer = document.querySelector('#completed-orders');
    const userId = UserInfo.getUserInfo().uid;

    try {
      const completedOrders = await OrderData.getCompletedOrders(userId);
      if (completedOrders.length > 0) {
        completedOrdersContainer.innerHTML = '';
        completedOrders.forEach(order => {
          const completedOrder = document.createElement('div');
          completedOrder.classList.add('completed-order');
          completedOrder.innerHTML = `
            <h3>Pesanan ID: ${order.id}</h3>
            <img src="${order.paymentProof}" alt="Bukti Pembayaran">
            <div class="completed-order-items"></div>
          `;
          completedOrdersContainer.appendChild(completedOrder);

          const completedOrderItemsContainer = completedOrder.querySelector('.completed-order-items');
          if (Array.isArray(order.items)) {
            order.items.forEach(item => {
              const orderItem = document.createElement('div');
              orderItem.classList.add('completed-order-item');
              orderItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <h4>${item.name}</h4>
                <p>${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}</p>
                <p>Jumlah: ${item.quantity}</p>
                <p>Rating: ${item.rating || 'Belum ada rating'}</p>
                <p>Komentar: ${item.comment || 'Belum ada komentar'}</p>
              `;
              completedOrderItemsContainer.appendChild(orderItem);
            });
          }
        });
      } else {
        completedOrdersContainer.innerHTML = '<p>Tidak ada pesanan yang selesai.</p>';
      }
    } catch (error) {
      console.error('Error rendering completed orders:', error);
      completedOrdersContainer.innerHTML = '<p>Terjadi kesalahan saat memuat pesanan selesai.</p>';
    }
  }
};

export default OrderPage;
