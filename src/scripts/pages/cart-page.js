/* eslint-disable max-len */
import CartData from '../utils/cart-data';
import OrderData from '../utils/order-data';
import ProductData from '../utils/product-data';

const CartPage = {
  async render() {
    return `
      <article class="cart-article">
        <h1>Keranjang Belanja</h1>
        <div id="cart-container"></div>
        <button id="checkout-button">Checkout</button>
      </article>
    `;
  },

  async afterRender() {
    const cartItems = await CartData.getCartItems();
    const cartContainer = document.querySelector('#cart-container');

    if (cartItems.length === 0) {
      cartContainer.innerHTML = '<p>Keranjang Anda kosong.</p>';
      return;
    }

    cartItems.forEach(async (item) => {
      const product = await ProductData.getProductById(item.id);
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <div>
          <h3>${product.name}</h3>
          <p>${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}</p>
          <p>Jumlah: ${item.quantity}</p>
        </div>
      `;
      cartContainer.appendChild(cartItem);
    });

    const checkoutButton = document.querySelector('#checkout-button');
    checkoutButton.addEventListener('click', async () => {
      const proofOfPayment = prompt('Masukkan URL bukti pembayaran:'); // Bisa diubah menjadi input file
      if (proofOfPayment) {
        await OrderData.createOrder(cartItems, proofOfPayment);
        alert('Pemesanan berhasil. Terima kasih!');
        CartData.clearCart();
        location.href = '#/order';
      } else {
        alert('Bukti pembayaran diperlukan untuk checkout.');
      }
    });
  },
};

export default CartPage;
