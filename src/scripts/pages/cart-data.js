import ProductData from '../utils/product-data';
import UserInfo from '../utils/user-info';

const CartPage = {
  async render() {
    return `
    <article class="cart-page-article">
      <div id="cart-container">
        <h2>Keranjang Belanja</h2>
        <div id="cart-items"></div>
        <div id="total-cost">
          <h3>Total Biaya: <span id="total-price">Rp0</span></h3>
        </div>
        <input type="file" id="payment-proof" style="display:none;">
        <button id="upload-proof">Unggah Bukti Pembayaran</button>
        <button id="checkout" disabled>Checkout</button>
      </div>
    </article>
    `;
  },
  async afterRender() {
    const cartItems = document.querySelector('#cart-items');
    const totalPriceElement = document.querySelector('#total-price');
    const paymentProofInput = document.querySelector('#payment-proof');
    const uploadProofButton = document.querySelector('#upload-proof');
    const checkoutButton = document.querySelector('#checkout');

    // Fetch cart data from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let totalCost = 0;

    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <h4>${item.name}</h4>
        <p>${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}</p>
        <input type="number" value="${item.quantity}" min="1" max="${item.stock}" data-id="${item.id}">
        <button class="remove-item" data-id="${item.id}">Hapus</button>
      </div>
    `).join('');

    cart.forEach(item => {
      totalCost += item.price * item.quantity;
    });
    totalPriceElement.textContent = Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalCost);

    document.querySelectorAll('.remove-item').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.dataset.id;
        const updatedCart = cart.filter(item => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        location.reload();
      });
    });

    document.querySelectorAll('input[type="number"]').forEach(input => {
      input.addEventListener('change', (event) => {
        const id = event.target.dataset.id;
        const quantity = parseInt(event.target.value);
        const item = cart.find(i => i.id === id);
        if (quantity > item.stock) {
          alert('Jumlah melebihi stok');
          event.target.value = item.quantity;
        } else {
          item.quantity = quantity;
          localStorage.setItem('cart', JSON.stringify(cart));
          location.reload();
        }
      });
    });

    uploadProofButton.addEventListener('click', () => {
      paymentProofInput.click();
    });

    paymentProofInput.addEventListener('change', async () => {
      const file = paymentProofInput.files[0];
      if (file) {
        const storageRef = firebase.storage().ref(`payment-proof/${UserInfo.getUserInfo().uid}/${file.name}`);
        await storageRef.put(file);
        const url = await storageRef.getDownloadURL();
        localStorage.setItem('paymentProof', url);
        checkoutButton.disabled = false;
      }
    });

    checkoutButton.addEventListener('click', async () => {
      const paymentProof = localStorage.getItem('paymentProof');
      if (!paymentProof) {
        alert('Unggah bukti pembayaran terlebih dahulu');
        return;
      }
      const userId = UserInfo.getUserInfo().uid;
      const orders = cart.map(item => ({
        ...item,
        paymentProof,
      }));

      // Move to OrderPage
      await ProductData.moveToOrderPage(orders);
      localStorage.removeItem('cart');
      localStorage.removeItem('paymentProof');
      location.href = '#/order';
    });
  },
};

export default CartPage;
