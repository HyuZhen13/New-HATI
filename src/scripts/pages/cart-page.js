import ProductData from '../utils/product-data';
import UserInfo from '../utils/user-info';
import CartData from '../utils/cart-data'; // Pastikan file ini ada

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
        <input type="file" id="payment-proof" style="display:none;" accept="image/*">
        <button id="upload-proof">Unggah Bukti Pembayaran</button>
        <button id="checkout" disabled>Checkout</button>
      </div>
      <div id="notification" style="display: none;">Bukti pembayaran berhasil diunggah</div>
    </article>
    `;
  },
  async afterRender() {
    const cartItems = document.querySelector('#cart-items');
    const totalPriceElement = document.querySelector('#total-price');
    const paymentProofInput = document.querySelector('#payment-proof');
    const uploadProofButton = document.querySelector('#upload-proof');
    const checkoutButton = document.querySelector('#checkout');
    const notification = document.querySelector('#notification');

    const cart = CartData.getCartItems();
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
        CartData.removeCartItem(id);
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
          CartData.updateCartItem(id, quantity);
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
        const uploadTask = storageRef.put(file);

        uploadTask.on('state_changed', 
          (snapshot) => {
            // Optional: can show progress here
          }, 
          (error) => {
            console.error('Error uploading file:', error);
          }, 
          async () => {
            const url = await uploadTask.snapshot.ref.getDownloadURL();
            CartData.setPaymentProof(url);
            checkoutButton.disabled = false; // Enable the checkout button
            notification.style.display = 'block'; // Show notification
            setTimeout(() => notification.style.display = 'none', 3000); // Hide notification after 3 seconds
          }
        );
      }
    });

    checkoutButton.addEventListener('click', async () => {
      const paymentProof = CartData.getPaymentProof();
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
      CartData.clearCart();
      location.href = '#/order';
    });
  },
};

export default CartPage;
