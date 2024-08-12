import CartData from '../utils/cart-data';
import ProductData from '../utils/product-data';
import UserInfo from '../utils/user-info';

const CartPage = {
  async render() {
    return `
      <section id="cart">
        <h2>Keranjang Belanja</h2>
        <div id="cart-items"></div>
        <div id="total-price"></div>
        <input type="file" id="payment-proof" accept="image/*">
        <button id="checkout-button" disabled>Checkout</button>
      </section>
    `;
  },

  async afterRender() {
    const cartItems = CartData.getCartItems();
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceContainer = document.getElementById('total-price');
    const checkoutButton = document.getElementById('checkout-button');
    const paymentProofInput = document.getElementById('payment-proof');

    let totalPrice = 0;

    cartItems.forEach((item) => {
      const itemElement = document.createElement('div');
      itemElement.innerHTML = `
        <img src="${item.image}" alt="${item.name}" />
        <p>${item.name}</p>
        <p>Jumlah: ${item.quantity}</p>
        <p>Harga: Rp ${item.price * item.quantity}</p>
      `;
      cartItemsContainer.appendChild(itemElement);

      totalPrice += item.price * item.quantity;
    });

    totalPriceContainer.innerHTML = `<h3>Total Harga: Rp ${totalPrice}</h3>`;

    paymentProofInput.addEventListener('change', () => {
      checkoutButton.disabled = !paymentProofInput.files.length;
    });

    checkoutButton.addEventListener('click', async () => {
      const paymentProofFile = paymentProofInput.files[0];
      const userId = UserInfo.getUserInfo().uid;

      try {
        await ProductData.moveToOrderPage(cartItems);
        await ProductData.confirmPayment(userId, Date.now(), paymentProofFile);

        CartData.clearCart();
        location.href = '#/order-history';
      } catch (e) {
        console.log(e.message);
      }
    });
  },
};

export default CartPage;
