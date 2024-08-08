import CartData from '../utils/cart-data';
import OrderData from '../utils/order-data';
import UserData from '../utils/user-data';

const CartPage = {
  async render() {
    return `
      <section class="cart-page">
        <h2>Keranjang Belanja</h2>
        <div id="cart-items-container"></div>
        <div id="total-price-container">
          <h3>Total: <span id="total-price"></span></h3>
          <button id="checkout-btn" disabled>Checkout</button>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const user = await UserData.getCurrentUser();
    const cartItems = await CartData.getCartItems(user.uid);
    const cartItemsContainer = document.querySelector('#cart-items-container');
    const totalPriceContainer = document.querySelector('#total-price');
    const checkoutBtn = document.querySelector('#checkout-btn');

    let totalPrice = 0;

    Object.values(cartItems).forEach(async (item) => {
      const product = await ProductData.getProductById(item.id);

      const cartItemElement = document.createElement('div');
      cartItemElement.classList.add('cart-item');
      cartItemElement.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h3>${item.name}</h3>
          <p>Penjual: ${item.seller}</p>
          <p>Harga: ${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}</p>
          <div>
            <button class="reduce-quantity" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
            <span>${item.quantity}</span>
            <button class="increase-quantity" ${item.quantity >= product.stock ? 'disabled' : ''}>+</button>
          </div>
          <p>Subtotal: ${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price * item.quantity)}</p>
        </div>
        <button class="remove-item">Hapus</button>
      `;

      cartItemsContainer.appendChild(cartItemElement);

      totalPrice += item.price * item.quantity;
      totalPriceContainer.innerText = Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalPrice);

      const reduceQuantityBtn = cartItemElement.querySelector('.reduce-quantity');
      const increaseQuantityBtn = cartItemElement.querySelector('.increase-quantity');
      const removeItemBtn = cartItemElement.querySelector('.remove-item');

      reduceQuantityBtn.addEventListener('click', async () => {
        item.quantity -= 1;
        await CartData.updateCartItem(user.uid, item.id, { quantity: item.quantity });
        cartItemElement.querySelector('span').innerText = item.quantity;
        reduceQuantityBtn.disabled = item.quantity <= 1;
        increaseQuantityBtn.disabled = false;
        totalPrice -= item.price;
        totalPriceContainer.innerText = Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalPrice);
      });

      increaseQuantityBtn.addEventListener('click', async () => {
        item.quantity += 1;
        await CartData.updateCartItem(user.uid, item.id, { quantity: item.quantity });
        cartItemElement.querySelector('span').innerText = item.quantity;
        increaseQuantityBtn.disabled = item.quantity >= product.stock;
        reduceQuantityBtn.disabled = false;
        totalPrice += item.price;
        totalPriceContainer.innerText = Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalPrice);
      });

      removeItemBtn.addEventListener('click', async () => {
        await CartData.removeCartItem(user.uid, item.id);
        cartItemElement.remove();
        totalPrice -= item.price * item.quantity;
        totalPriceContainer.innerText = Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalPrice);
      });
    });

    checkoutBtn.disabled = Object.keys(cartItems).length === 0;

    checkoutBtn.addEventListener('click', async () => {
      const orderData = Object.values(cartItems).map(item => ({
        id: item.id,
        seller: item.seller,
        phone: item.phone,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        uid: item.uid,
        buyerName: item.buyerName,
        status: 'belum dibayar',
      }));

      await OrderData.addOrder(user.uid, orderData);
      await CartData.clearCart(user.uid);
      alert('Checkout berhasil! Pesanan telah ditambahkan ke halaman pesanan.');
      window.location.href = '#/order-page';
    });
  },
};

export default CartPage;

