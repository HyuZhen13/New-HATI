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
      const order = await OrderData.getCurrentOrder(userId);
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
                await OrderData.moveOrderToCompleted(saveFeedbackButton.dataset.orderId); // Pindahkan pesanan ke daftar selesai
                await this.renderCurrentOrder(); // Render ulang daftar pesanan saat ini
                await this.renderCompletedOrders(); // Render ulang daftar pesanan selesai
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
            <button data-order-id="${order.id}" class="delete-order-button">Hapus Pesanan</button>
            <button data-order-id="${order.id}" data-seller-number="${order.sellerNumber}" class="contact-seller-button">Hubungi Penjual</button>
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

          const deleteOrderButton = completedOrder.querySelector('.delete-order-button');
          deleteOrderButton.addEventListener('click', async () => {
            try {
              await OrderData.deleteCompletedOrder(deleteOrderButton.dataset.orderId);
              alert('Pesanan berhasil dihapus!');
              console.log('Order deleted successfully');
              await this.renderCompletedOrders(); // Render ulang daftar pesanan selesai
            } catch (error) {
              console.error('Error deleting order:', error);
              alert('Terjadi kesalahan saat menghapus pesanan.');
            }
          });

          const contactSellerButton = completedOrder.querySelector('.contact-seller-button');
          contactSellerButton.addEventListener('click', async () => {
            try {
              const orderData = await OrderData.getCompletedOrderDetails(contactSellerButton.dataset.orderId);
              const pdfUrl = await OrderData.createOrderPdf(orderData);
              const sellerNumber = contactSellerButton.dataset.sellerNumber;
              const whatsappUrl = `https://wa.me/${sellerNumber}?text=${encodeURIComponent(`Berikut adalah PDF pesanan Anda: ${pdfUrl}`)}`;
              window.open(whatsappUrl, '_blank');
            } catch (error) {
              console.error('Error contacting seller:', error);
              alert('Terjadi kesalahan saat menghubungi penjual.');
            }
          });
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
