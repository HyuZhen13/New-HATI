/* eslint-disable consistent-return */
/* eslint-disable object-shorthand */
import {
  getDatabase, ref, set, update, get,
} from 'firebase/database';
import {
  getStorage, uploadBytes, ref as storageRef, getDownloadURL,
} from 'firebase/storage';
import UserInfo from './user-info'; // Pastikan ini diimpor

class CartData {
  static getCartItems() {
    return JSON.parse(localStorage.getItem('cart')) || [];
  }

  static addCartItem(item) {
    const cart = this.getCartItems();
    const existingItem = cart.find(i => i.id === item.id);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.push(item);
    }
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
    const userInfo = UserInfo.getUserInfo();
    if (!userInfo || !userInfo.uid) {
      console.error('Pengguna tidak valid:', userInfo); // Log detail dari userInfo jika tidak valid
      throw new Error('Pengguna tidak valid, tidak dapat mengunggah bukti pembayaran.');
    }

    const storage = getStorage();
    const storageReference = storageRef(storage, `payment-proof/${userInfo.uid}/${file.name}`);
    try {
      const uploadTask = await uploadBytes(storageReference, file);
      const url = await getDownloadURL(uploadTask.ref);
      this.setPaymentProof(url);
      return url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  static async moveToOrderPage() {
    const db = getDatabase();
    const userInfo = UserInfo.getUserInfo();
    
    // Validasi data userInfo sebelum digunakan
    if (!userInfo || !userInfo.uid || !userInfo.name) {
      console.error('Informasi pengguna tidak valid:', userInfo); // Log detail dari userInfo jika tidak valid
      alert('Informasi pengguna tidak valid. Silakan periksa login Anda.');
      throw new Error('Informasi pengguna tidak valid.');
    }

    const userId = userInfo.uid;
    const userName = userInfo.name;
    const orderId = Date.now();
    const orderRef = ref(db, `orders/${userId}/${orderId}`);
    const cartItems = this.getCartItems();
    const paymentProof = this.getPaymentProof();

    if (!cartItems.length) {
      throw new Error('Keranjang belanja kosong.');
    }

    try {
      if (!userName) {
        throw new Error('Nama pengguna tidak ditemukan.');
      }

      // Log untuk memastikan data yang akan disimpan sudah benar
      console.log('Menyimpan pesanan untuk pengguna:', userName);
      console.log('Data pesanan:', cartItems);

      await set(orderRef, {
        id: orderId,
        items: cartItems,
        paymentProof: paymentProof,
        timestamp: new Date().toISOString(),
        userName: userName,
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
      throw e;
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
