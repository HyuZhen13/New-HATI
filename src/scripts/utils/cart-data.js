/* eslint-disable consistent-return */
/* eslint-disable object-shorthand */
import {
  getDatabase, ref, set, update, get
} from 'firebase/database';
import {
  getStorage, uploadBytes, ref as storageRef, getDownloadURL
} from 'firebase/storage';
import UserInfo from './user-info';

class CartData {
  static getUserCartRef() {
    const userId = UserInfo.getUserInfo().uid;
    const db = getDatabase();
    return ref(db, `carts/${userId}`);
  }

  static async getCartItems() {
    const cartRef = this.getUserCartRef();
    try {
      const cartSnapshot = await get(cartRef);
      if (!cartSnapshot.exists()) {
        return [];
      }
      return cartSnapshot.val().items || [];
    } catch (error) {
      console.error('Error fetching cart items:', error);
      throw error;
    }
  }

  static async addCartItem(item) {
    const cartRef = this.getUserCartRef();
    const cartItems = await this.getCartItems();
    cartItems.push(item);
    try {
      await set(cartRef, { items: cartItems });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  }

  static async removeCartItem(userId, id) {
    const cartRef = this.getUserCartRef();
    const cartItems = await this.getCartItems();
    const updatedCartItems = cartItems.filter(item => item.id !== id);
    try {
      await set(cartRef, { items: updatedCartItems });
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  }

  static async updateCartItem(userId, id, quantity) {
    const cartRef = this.getUserCartRef();
    const cartItems = await this.getCartItems();
    const item = cartItems.find(i => i.id === id);
    if (item) {
      item.quantity = quantity;
      try {
        await set(cartRef, { items: cartItems });
      } catch (error) {
        console.error('Error updating cart item:', error);
        throw error;
      }
    }
  }

  static async setPaymentProof(url) {
    const userId = UserInfo.getUserInfo().uid;
    const db = getDatabase();
    const paymentProofRef = ref(db, `payment-proof/${userId}`);
    try {
      await set(paymentProofRef, { url });
    } catch (error) {
      console.error('Error setting payment proof:', error);
      throw error;
    }
  }

  static async getPaymentProof() {
    const userId = UserInfo.getUserInfo().uid;
    const db = getDatabase();
    const paymentProofRef = ref(db, `payment-proof/${userId}`);
    try {
      const paymentProofSnapshot = await get(paymentProofRef);
      if (!paymentProofSnapshot.exists()) {
        return null;
      }
      return paymentProofSnapshot.val().url;
    } catch (error) {
      console.error('Error fetching payment proof:', error);
      throw error;
    }
  }

  static async clearCart() {
    const cartRef = this.getUserCartRef();
    try {
      await set(cartRef, { items: [] });
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  static async uploadPaymentProof(file) {
    const userId = UserInfo.getUserInfo().uid;
    const storage = getStorage();
    const storageReference = storageRef(storage, `payment-proof/${userId}/${file.name}`);
    try {
      const uploadTask = await uploadBytes(storageReference, file);
      const url = await getDownloadURL(uploadTask.ref);
      await this.setPaymentProof(url);
      return url; // Kembalikan URL untuk digunakan lebih lanjut jika diperlukan
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  static async moveToOrderPage() {
    const db = getDatabase();
    const userId = UserInfo.getUserInfo().uid;
    const orderId = Date.now(); // Gunakan timestamp sebagai ID pesanan
    const orderRef = ref(db, `orders/${userId}/${orderId}`);
    const cartItems = await this.getCartItems();
    const paymentProof = await this.getPaymentProof();

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
      await this.clearCart();
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
