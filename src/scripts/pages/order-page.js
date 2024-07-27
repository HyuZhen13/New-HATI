import UserInfo from '../utils/user-info';
import OrderData from '../utils/order-data';

const OrderPage = {
  // Menghasilkan HTML dasar untuk halaman pesanan
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

  // Memanggil fungsi render untuk pesanan saat ini dan pesanan yang selesai setelah halaman dimuat
  async afterRender() {
    await this.renderCurrentOrder();
    await this.renderCompletedOrders();
  },

  // Merender pesanan saat ini
  async renderCurrentOrder() {
    const orderDetailsContainer = document.querySelector('#order-details');
    const userId = UserInfo.getUserInfo().uid;

    const order = await OrderData.getCurrentOrder();
    if (order) {
      // Mendapatkan total harga dari elemen di halaman keranjang
      const totalPriceElement = document.querySelector('.total-price');
      let totalPrice = order.totalPrice;
      if (totalPriceElement) {
        totalPrice = parseFloat(totalPriceElement.textContent.replace(/[^\d.-]/g, ''));
      }

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

              // Pindahkan pesanan ke completed-orders dan reload halaman
              await OrderData.completeOrder();
              await this.renderCurrentOrder(); // Render ulang pesanan saat ini setelah dipindahkan
              await this.renderCompletedOrders(); // Render ulang pesanan selesai setelah pesanan saat ini dipindahkan
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

  // Merender pesanan yang telah selesai
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
            <button data-id="${order.id}" class="delete-order-button">Hapus Pesanan</button>
          `;
          completedOrdersContainer.appendChild(orderElement);

          const deleteOrderButton = orderElement.querySelector('.delete-order-button');
          deleteOrderButton.addEventListener('click', async () => {
            try {
              await OrderData.deleteCompletedOrder(order.id);
              alert('Pesanan berhasil dihapus.');
              await this.renderCompletedOrders(); // Render ulang pesanan selesai setelah penghapusan
            } catch (error) {
              alert('Gagal menghapus pesanan: ' + error.message);
            }
          });
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
