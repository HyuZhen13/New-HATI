import ProductData from '../utils/product-data';

const OrderPage = {
  async render() {
    return `
      <div id="order-history"></div>
    `;
  },

  async afterRender() {
    const userId = UserInfo.getUserInfo().uid;
    const orders = await ProductData.getOrders(userId);
    const orderHistoryContainer = document.querySelector('#order-history');

    Object.values(orders).forEach(order => {
      const orderItem = document.createElement('div');
      orderItem.innerHTML = `
        <h4>Order ID: ${order.id}</h4>
        <div class="order-details">
          ${order.items.map(item => `
            <div class="order-item">
              <img src="${item.image}" alt="${item.name}">
              <h5>${item.name}</h5>
              <p>Price: ${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}</p>
              <p>Quantity: ${item.quantity}</p>
            </div>
          `).join('')}
        </div>
      `;
      orderHistoryContainer.appendChild(orderItem);
    });
  },
};

export default OrderPage;
