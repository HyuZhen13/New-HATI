import CartData from '../utils/cart-data';
import UserInfo from '../utils/user-info';

const CartPage = {
  async render() {
    return `
      <div class="cart-page">
        <h2>Keranjang Belanja</h2>
        <div id="cart-items">Memuat item...</div>
        <div id="checkout-section">
          <input type="file" id="payment-proof" accept="image/*" />
          <button id="checkout-button" disabled>Checkout</button>
        </div>
      </div>
    `;
  },

  async afterRender() {
    const cartItems = CartData.getCartItems();
    const cartItemsContainer = document.getElementById('cart-items');
    const checkoutButton = document.getElementById('checkout-button');
    const paymentProofInput = document.getElementById('payment-proof');

    if (!cartItems.length) {
      cartItemsContainer.innerHTML = '<p>Keranjang belanja kosong.</p>';
      return;
    }

    cartItemsContainer.innerHTML = cartItems.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" />
        <p>Nama: ${item.name}</p>
        <p>Jumlah: ${item.quantity}</p>
        <p>Harga: Rp${item.price}</p>
      </div>
    `).join('');

    paymentProofInput.addEventListener('change', (event) => {
      if (event.target.files.length > 0) {
        checkoutButton.disabled = false;
      } else {
        checkoutButton.disabled = true;
      }
    });

    checkoutButton.addEventListener('click', async () => {
      const paymentProofFile = paymentProofInput.files[0];
      await CartData.uploadPaymentProof(paymentProofFile);
      await CartData.moveToOrderPage();
      location.href = '#/order';
    });
  },
};

export default CartPage;
