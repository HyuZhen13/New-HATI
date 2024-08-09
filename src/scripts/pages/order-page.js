import ProductData from '../utils/product-data';
import UserData from '../utils/user-data';

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
    const url = UrlParser.parseActiveUrlWithoutCombiner();
    const orderId = url.id;

    try {
      const user = await UserData.getUserInfo();
      const order = await ProductData.getOrderById(user.uid, orderId);

      if (order) {
        const orderItems = order.items;
        let orderHtml = `<h2>Pesanan #${orderId}</h2>
                         <p>Status: ${order.status}</p>
                         <p>Tanggal: ${order.timestamp}</p>
                         <h3>Detail Pesanan:</h3>`;

        orderItems.forEach(item => {
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

        if (order.paymentProof) {
          orderHtml += `<h3>Bukti Pembayaran:</h3>
                        <img src="${order.paymentProof}" alt="Bukti Pembayaran" style="max-width: 300px;">`;
        } else {
          orderHtml += `<p>Bukti pembayaran belum diterima.</p>`;
        }

        orderDetailsContainer.innerHTML = orderHtml;
      } else {
        orderDetailsContainer.innerHTML = '<p>Pesanan tidak ditemukan.</p>';
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      orderDetailsContainer.innerHTML = '<p>Terjadi kesalahan saat mengambil detail pesanan.</p>';
    }
  },
};

export default OrderPage;
