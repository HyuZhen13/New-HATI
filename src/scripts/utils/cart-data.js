/* eslint-disable consistent-return */
/* eslint-disable object-shorthand */
import {
  getDatabase, ref, set, update, get,
} from 'firebase/database';
import {
  getStorage, uploadBytes, ref as storageRef, getDownloadURL,
} from 'firebase/storage';
import UserInfo from './user-info';

class CartData {
  static getCartItems() {
    return JSON.parse(localStorage.getItem('cart')) || [];
  }

  static addCartItem(item) {
    const cart = this.getCartItems();
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  static removeCartItem(id) {
    let cart = this.getCartItems();
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  static updateCartItem(id, quantity) {
    const cart = this.getCartItems();
    const item = cart.find(i => i.id === id);
    if (item) {
      item.quantity = quantity;
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }

  static setPaymentProof(url) {
    localStorage.setItem('paymentProof', url);
  }

  static getPaymentProof() {
    return localStorage.getItem('paymentProof');
  }

  static clearCart() {
    localStorage.removeItem('cart');
    localStorage.removeItem('paymentProof');
  }

  static async uploadPaymentProof(file) {
    const userId = UserInfo.getUserInfo().uid;
    const storage = getStorage();
    const storageReference = storageRef(storage, `payment-proof/${userId}/${file.name}`);
    try {
      const uploadTask = await uploadBytes(storageReference, file);
      const url = await getDownloadURL(uploadTask.ref);
      this.setPaymentProof(url);
      return url; // Kembalikan URL untuk digunakan lebih lanjut jika diperlukan
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  static async moveToOrderPage() {
    const db = getDatabase();
    const userId = UserInfo.getUserInfo().uid;
    const orderId = Date.now();
    const orderRef = ref(db, `orders/${userId}/${orderId}`);
    const cartItems = this.getCartItems();
    const paymentProof = this.getPaymentProof();

    if (!cartItems.length) {
      throw new Error('Keranjang belanja kosong.');
    }

    try {
      // Menyimpan pesanan
      await set(orderRef, {
        id: orderId,
        items: cartItems,
        paymentProof: paymentProof,
        timestamp: new Date().toISOString(),
      });

      // Memperbarui stok untuk setiap produk
      for (const order of cartItems) {
        const productRef = ref(db, `products/${order.id}`);
        const productSnapshot = await get(productRef);
        const productData = productSnapshot.val();

        if (!productData) {
          throw new Error(`Produk dengan ID ${order.id} tidak ditemukan.`);
        }

        const newStock = productData.stock - order.quantity;
        if (newStock < 0) {
          throw new Error(`Stok produk ${order.name} tidak mencukupi.`);
        }

        await update(productRef, { stock: newStock });
      }

      // Menghapus keranjang setelah pesanan dipindahkan
      this.clearCart();
    } catch (e) {
      console.log(e.message);
      throw e; // Rethrow error to be handled by the calling function
    }
  }

  static async getOrders(userId) {
    const db = getDatabase();
    const ordersRef = ref(db, `orders/${userId}`);
    try {
      const ordersSnapshot = await get(ordersRef);
      if (!ordersSnapshot.exists()) {
        return [];
      }
      const ordersData = ordersSnapshot.val();
      console.log('Data pesanan yang diambil dari Firebase:', ordersData);
      return Object.values(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }
}

export default CartData;
