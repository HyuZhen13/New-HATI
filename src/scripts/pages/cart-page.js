import CartData from '../utils/cart-data';
import ProductData from '../utils/product-data';
import UserData from '../utils/user-data';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const CartPage = {
  async render() {
    return `
      <article class="cart-page">
        <h1>Keranjang Belanja</h1>
        <div id="cart-items-container"></div>
        <div id="checkout-container">
          <input type="file" id="payment-proof" accept="image/*">
          <button id="checkout-button" disabled>Checkout</button>
        </div>
      </article>
    `;
  },

  async afterRender() {
    const cartItemsContainer = document.querySelector('#cart-items-container');
    const checkoutButton = document.querySelector('#checkout-button');
    const paymentProofInput = document.querySelector('#payment-proof');

    // Fetch cart items
    const cartItems = await CartData.getCartItems();
    let totalCost = 0;

    // Render cart items
    cartItems.forEach((item) => {
      const cartItem = document.createElement('div');
      cartItem.classList.add('cart-item');
      cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h3>${item.name}</h3>
          <p>${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}</p>
          <p>Stok: ${item.stock}</p>
          <label for="quantity-${item.id}">Kuantitas:</label>
          <input type="number" id="quantity-${item.id}" value="${item.quantity}" min="1" max="${item.stock}">
          <button id="remove-${item.id}">Hapus</button>
        </div>
      `;
      cartItemsContainer.appendChild(cartItem);

      totalCost += item.price * item.quantity;

      // Event listener for quantity change
      const quantityInput = document.querySelector(`#quantity-${item.id}`);
      quantityInput.addEventListener('change', async (event) => {
        const newQuantity = parseInt(event.target.value, 10);
        if (newQuantity > 0 && newQuantity <= item.stock) {
          item.quantity = newQuantity;
          await CartData.updateCartItem(item.id, newQuantity);
          totalCost = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
          updateTotalCost();
        } else {
          alert('Kuantitas tidak valid.');
        }
      });

      // Event listener for removing item
      const removeButton = document.querySelector(`#remove-${item.id}`);
      removeButton.addEventListener('click', async () => {
        await CartData.removeCartItem(item.id);
        cartItem.remove();
        totalCost = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        updateTotalCost();
      });
    });

    const updateTotalCost = () => {
      if (totalCostContainer) {
        totalCostContainer.innerHTML = `
          <h2>Total: ${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalCost)}</h2>
        `;
        checkoutButton.disabled = totalCost === 0;
      }
    };

    // Render total cost
    const totalCostContainer = document.createElement('div');
    totalCostContainer.id = 'total-cost-container';
    cartItemsContainer.appendChild(totalCostContainer);
    updateTotalCost();

    // Enable checkout button if payment proof is uploaded
    paymentProofInput.addEventListener('change', () => {
      checkoutButton.disabled = paymentProofInput.files.length === 0;
    });

    // Checkout functionality
    checkoutButton.addEventListener('click', async () => {
      const paymentProofFile = paymentProofInput.files[0];
      if (paymentProofFile) {
        try {
          // Upload payment proof
          const paymentProofUrl = await uploadPaymentProof(paymentProofFile);

          // Create order data
          const user = await UserData.getUserInfo();
          const orderItems = cartItems.map(item => ({
            id: item.id,
            seller: item.seller,
            phone: item.phone,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
            uid: item.uid,
            buyerName: user.name,
            paymentProofUrl, // Include payment proof URL in the order data
          }));

          // Save order data to database
          await ProductData.moveToOrderPage(orderItems);

          // Clear cart
          await CartData.clearCart();

          alert('Pesanan berhasil diproses.');
          window.location.href = '#/order';
        } catch (error) {
          console.error('Gagal memproses pesanan:', error);
          alert('Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.');
        }
      } else {
        alert('Silakan unggah bukti pembayaran.');
      }
    });
  },
};

// Helper function to upload payment proof
async function uploadPaymentProof(file) {
  const storage = getStorage();
  const storageReference = storageRef(storage, `payment-proofs/${Date.now()}-${file.name}`);
  await uploadBytes(storageReference, file);
  return await getDownloadURL(storageReference);
}

export default CartPage;
