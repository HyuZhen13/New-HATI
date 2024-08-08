
import CartData from './cart-data';

class CartPage {
  static async render() {
    const cartItems = await CartData.getCartItems();
    const cartContainer = document.getElementById('cart-page');

    if (!cartItems || Object.keys(cartItems).length === 0) {
      cartContainer.innerHTML = '<p>Cart is empty</p>';
      return;
    }

    cartContainer.innerHTML = '';
    Object.values(cartItems).forEach((item) => {
      cartContainer.innerHTML += `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}">
          <h2>${item.name}</h2>
          <p>Price: ${item.price}</p>
          <p>Quantity: ${item.quantity}</p>
          <p>Seller: ${item.seller}</p> <!-- Tampilkan nama seller -->
          <p>Phone: ${item.phone}</p> <!-- Tampilkan nomor telepon seller -->
          <p>Buyer: ${item.buyerName}</p> <!-- Tampilkan nama pemesan -->
          <button class="remove-button" data-id="${item.id}">Remove</button>
        </div>
      `;
    });

    document.querySelectorAll('.remove-button').forEach((button) => {
      button.addEventListener('click', async (event) => {
        const productId = event.target.dataset.id;
        await CartData.removeFromCart(productId);
        window.location.reload();
      });
    });
  }
}

export default CartPage;
