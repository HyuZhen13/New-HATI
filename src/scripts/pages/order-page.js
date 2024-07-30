import jsPDF from 'jspdf'; // Import jsPDF library
import UserInfo from '../utils/user-info';
import OrderData from '../utils/order-data';
import ProductData from '../utils/product-data';

const OrderPage = {
  async render() {
    return `
      <div class="order-page">
	@@ -14,21 +15,18 @@ const OrderPage = {
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
              const rating = orderItem.querySelector('.rating-input').value;
              const comment = orderItem.querySelector('.comment-input').value;
              if (rating && comment) {
                try {
                  await OrderData.saveProductFeedback(order.id, item.id, rating, comment);

                  // Create PDF
                  const pdf = new jsPDF();
                  pdf.text('Detail Pesanan', 10, 10);
                  pdf.text(`Order ID: ${order.id}`, 10, 20);
                  pdf.text(`Date: ${new Date(order.timestamp).toLocaleDateString()}`, 10, 30);
                  order.items.forEach((item, index) => {
                    pdf.text(`Item ${index + 1}:`, 10, 40 + (index * 10));
                    pdf.text(`Name: ${item.name}`, 10, 50 + (index * 10));
                    pdf.text(`Price: ${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}`, 10, 60 + (index * 10));
                    pdf.text(`Quantity: ${item.quantity}`, 10, 70 + (index * 10));
                    pdf.text(`Rating: ${rating}`, 10, 80 + (index * 10));
                    pdf.text(`Comment: ${comment}`, 10, 90 + (index * 10));
                  });
                  const pdfOutput = pdf.output('blob');

                  // Get seller's WhatsApp number from ProductData
                  const product = await ProductData.getProductById(item.id);
                  const sellerPhone = product.sellerPhone;

                  // Send PDF to seller's WhatsApp (replace with actual API call or method)
                  await this.sendPdfToWhatsApp(pdfOutput, sellerPhone);

                  // Move order to completed and reload
                  await OrderData.completeOrder();
                  location.reload();
                } catch (error) {
                  console.error('Gagal menyimpan rating dan komentar:', error);
                  alert('Gagal menyimpan rating dan komentar: ' + error.message);
                }
              } else {
                alert('Silakan isi rating dan komentar.');
              }
            });
          });
        } else {
          orderItemsContainer.innerHTML = '<p>Tidak ada barang dalam pesanan ini.</p>';
        }
      } else {
        orderDetailsContainer.innerHTML = '<p>Tidak ada pesanan yang sedang diproses.</p>';
      }
    } catch (error) {
      console.error('Error fetching current order:', error);
      orderDetailsContainer.innerHTML = '<p>Gagal memuat detail pesanan.</p>';
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
              console.log('Pesanan berhasil dihapus.');
              location.reload();
            } catch (error) {
              console.error('Gagal menghapus pesanan:', error);
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
  },

  async sendPdfToWhatsApp(pdfBlob, phoneNumber) {
    // Replace with actual API call or method to send PDF via WhatsApp
    // This is a placeholder implementation
    console.log('Sending PDF to WhatsApp:', phoneNumber);
    // Use WhatsApp API or another method to send the PDF
  }
};

export default OrderPage;
