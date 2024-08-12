import ProductData from '../utils/product-data';
import UserInfo from '../utils/user-info';

const OrderPage = {
  async render() {
    return `
      <section id="orders">
        <h2>Daftar Pesanan</h2>
        <div id="orders-container"></div>
      </section>
    `;
  },

  async afterRender() {
    const userId = UserInfo.getUserInfo().uid;
    const ordersContainer = document.getElementById('orders-container');

    try {
      const orders = await ProductData.getOrders(userId);

      for (const orderId in orders) {
        const order = orders[orderId];
        const orderElement = document.createElement('div');
        orderElement.classList.add('order-item');

        orderElement.innerHTML = `
          <h3>Pesanan ID: ${orderId}</h3>
          <p>Status: ${order.status}</p>
          <p>Waktu: ${new Date(order.timestamp).toLocaleString()}</p>
          <div class="order-items">
            ${order.items.map((item) => `
              <div class="order-item">
                <img src="${item.image}" alt="${item.name}" />
                <p>${item.name}</p>
                <p>Jumlah: ${item.quantity}</p>
                <p>Harga: Rp ${item.price * item.quantity}</p>
              </div>
            `).join('')}
          </div>
        `;

        ordersContainer.appendChild(orderElement);
      }
    } catch (e) {
      console.log(e.message);
    }
  },
};

export default OrderPage;
