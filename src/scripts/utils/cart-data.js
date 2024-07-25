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
    const storageRef = storageRef(storage, `payment-proof/${userId}/${file.name}`);
    try {
      const uploadTask = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(uploadTask.ref);
      this.setPaymentProof(url);
      return url; // Return the URL for further use if needed
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
}

export default CartData;
