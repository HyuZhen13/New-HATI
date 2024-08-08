import CartData from './cart-data';
import UserInfo from './user-info';

const cartPage = {
  async render() {
    const cartItems = await CartData.getCart();
    const totalPrice = cartItems ? Object.values(cartItems).reduce((total, item) => total + item.price * item.quantity, 0) : 0;

    return `
      <div id="cart">
        <h1>Keranjang Belanja</h1>
        <ul id="cart-items">
          ${cartItems ? Object.values(cartItems).map(item => `
            <li>
              <img src="${item.image}" alt="${item.name}" />
              <div>Nama: ${item.name}</div>
              <div>Harga: ${item.price}</div>
              <div>Penjual: ${item.seller}</div>
              <div>Telepon: ${item.phone}</div>
              <div>
                <button data-id="${item.id}" class="decrease-quantity">-</button>
                <span>${item.quantity}</span>
                <button data-id="${item.id}" class="increase-quantity">+</button>
                <button data-id="${item.id}" class="remove-item">Hapus</button>
              </div>
            </li>
          `).join('') : '<li>Keranjang kosong</li>'}
        </ul>
        <div>Total: ${totalPrice}</div>
        <button id="checkout-button">Checkout</button>
      </div>
    `;
  },

  async afterRender() {
    document.querySelectorAll('.increase-quantity').forEach(button => {
      button.addEventListener('click', async (e) => {
        const itemId = e.target.getAttribute('data-id');
        const cartItem = await CartData.getCart();
        const item = cartItem[itemId];
        await CartData.updateItemQuantity(itemId, item.quantity + 1);
        location.reload();
      });
    });

    document.querySelectorAll('.decrease-quantity').forEach(button => {
      button.addEventListener('click', async (e) => {
        const itemId = e.target.getAttribute('data-id');
        const cartItem = await CartData.getCart();
        const item = cartItem[itemId];
        if (item.quantity > 1) {
          await CartData.updateItemQuantity(itemId, item.quantity - 1);
          location.reload();
        }
      });
    });

    document.querySelectorAll('.remove-item').forEach(button => {
      button.addEventListener('click', async (e) => {
        const itemId = e.target.getAttribute('data-id');
        await CartData.removeItemFromCart(itemId);
        location.reload();
      });
    });

    document.getElementById('checkout-button').addEventListener('click', async () => {
      const cartItems = Object.values(await CartData.getCart());
      if (cartItems.length > 0) {
        await CartData.checkout(cartItems);
        location.href = '#/order';
      } else {
        alert('Keranjang kosong, tidak bisa melakukan checkout.');
      }
    });
  }
};

export default cartPage;
