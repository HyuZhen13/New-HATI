import CartData from '../utils/cart-data';
import UserInfo from '../utils/user-info';

const CartPage = {
  async render() {
    return `
      <div class="cart-page">
        <h1>Keranjang Belanja</h1>
        <div id="cart-items" class="cart-items"></div>
        <div id="total-price" class="total-price"></div>
        <input type="file" id="payment-proof" />
        <button id="checkout" disabled>Checkout</button>
      </div>
    `;
  },

  async afterRender() {
    const cartItems = await CartData.getCartItems();
    const cartItemsContainer = document.querySelector('#cart-items');
    const totalPriceContainer = document.querySelector('#total-price');
    const checkoutButton = document.querySelector('#checkout');
    const paymentProofInput = document.querySelector('#payment-proof');
    let totalPrice = 0;

    cartItems.forEach(item => {
      const cartItem = document.createElement('div');
      cartItem.classList.add('cart-item');
      cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <h4>${item.name}</h4>
        <p>${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}</p>
        <input type="number" value="${item.quantity}" min="1" max="${item.stock}" data-id="${item.id}" class="quantity-input" />
        <button data-id="${item.id}" class="remove-button">Hapus</button>
      `;
      cartItemsContainer.appendChild(cartItem);
      totalPrice += item.price * item.quantity;

      const quantityInput = cartItem.querySelector('.quantity-input');
      quantityInput.addEventListener('change', async (e) => {
        const quantity = parseInt(e.target.value);
        if (quantity > item.stock) {
          alert('Jumlah melebihi stok yang tersedia.');
          e.target.value = item.quantity;
        } else {
          try {
            await CartData.updateCartItem(item.id, quantity);
            location.reload();
          } catch (error) {
            console.error('Gagal memperbarui item keranjang:', error);
          }
        }
      });

      const removeButton = cartItem.querySelector('.remove-button');
      removeButton.addEventListener('click', async () => {
        try {
          await CartData.removeCartItem(item.id);
          location.reload();
        } catch (error) {
          console.error('Gagal menghapus item keranjang:', error);
        }
      });
    });

    totalPriceContainer.innerHTML = `Total Harga: ${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalPrice)}`;

    paymentProofInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const url = await CartData.uploadPaymentProof(file);
          CartData.setPaymentProof(url);
          checkoutButton.disabled = false;
        } catch (error) {
          console.error('Gagal mengunggah bukti pembayaran:', error);
        }
      }
    });

    checkoutButton.addEventListener('click', async () => {
      const paymentProof = CartData.getPaymentProof();
      if (paymentProof) {
        try {
          await CartData.moveToOrderPage();
          location.href = '#/order';
        } catch (error) {
          alert('Gagal melakukan checkout: ' + error.message);
        }
      } else {
        alert('Silakan unggah bukti pembayaran terlebih dahulu.');
      }
    });
  },
};

export default CartPage;
