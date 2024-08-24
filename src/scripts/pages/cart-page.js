import CartData from '../utils/cart-data';
import UserInfo from '../utils/user-info';
import UrlParser from '../routes/url-parser';

const CartPage = {
  async render() {
    return `
      <div class="cart-page">
        <h1>Keranjang Belanja</h1>
        <div id="cart-items" class="cart-items"></div>
        <div id="total-price" class="total-price"></div>
        <input type="file" id="payment-proof" accept="image/*" />
        <button id="checkout" disabled>Checkout</button>
      </div>
    `;
  },

  async afterRender() {
    // Memeriksa apakah pengguna sudah login
    const user = UserInfo.getUserInfo();
    if (!user) {
      // Jika pengguna belum login, arahkan mereka ke halaman login
      alert('Silakan login terlebih dahulu untuk mengakses keranjang belanja.');
      location.href = '#/login';
      return;
    }

    const cartItems = await CartData.getCartItems();
    const cartItemsContainer = document.querySelector('#cart-items');
    const totalPriceContainer = document.querySelector('#total-price');
    const checkoutButton = document.querySelector('#checkout');
    const paymentProofInput = document.querySelector('#payment-proof');
    let totalPrice = 0;

    cartItems.forEach((item) => {
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
          await CartData.updateCartItem(item.id, quantity);
          location.reload();
        }
      });

      const removeButton = cartItem.querySelector('.remove-button');
      removeButton.addEventListener('click', async () => {
        await CartData.removeCartItem(item.id);
        location.reload();
      });
    });

    totalPriceContainer.innerHTML = `Total Harga: ${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalPrice)}`;

    paymentProofInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        try {
          await CartData.uploadPaymentProof(file);
          checkoutButton.disabled = false;
        } catch (error) {
          alert('Gagal mengunggah bukti pembayaran: ' + error.message);
        }
      } else {
        alert('File yang diunggah harus berupa gambar.');
        paymentProofInput.value = ''; // Reset input file
      }
    });

    checkoutButton.addEventListener('click', async () => {
      const paymentProof = CartData.getPaymentProof();
      if (paymentProof) {
        const userConfirmed = window.confirm("Sudahkah Anda konfirmasi ke penjual melalui WhatsApp?");
        
        if (userConfirmed) {
          try {
            await CartData.moveToOrderPage();
            location.href = '#/order';
          } catch (error) {
            alert('Gagal melakukan checkout: ' + error.message);
          }
        } else {
          alert("Silakan hubungi penjual terlebih dahulu melalui WhatsApp sebelum melanjutkan checkout.");
          location.href = '#/marketplace';
        }
      } else {
        alert('Silakan unggah bukti pembayaran terlebih dahulu.');
      }
    });
  },
};

export default CartPage;
