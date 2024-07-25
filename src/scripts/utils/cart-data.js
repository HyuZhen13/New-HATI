/* eslint-disable consistent-return */
/* eslint-disable object-shorthand */
import {
  getDatabase, ref, set, update, remove, child,
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
      return url; // Return the URL for further use if needed
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
      await set(orderRef, {
        id: orderId,
        items: cartItems,
        paymentProof: paymentProof,
        timestamp: new Date().toISOString(),
      });

      // Update stock for each product
      for (const order of cartItems) {
        const productRef = ref(db, `products/${order.id}`);
        const productSnapshot = await get(productRef);
        const productData = productSnapshot.val();

        const newStock = productData.stock - order.quantity;
        if (newStock < 0) {
          throw new Error(`Stok produk ${order.name} tidak mencukupi.`);
        }

        await update(productRef, { stock: newStock });
      }

      // Clear cart after moving to order
      this.clearCart();
    } catch (e) {
      console.log(e.message);
    }
  }
}

export default CartData;
