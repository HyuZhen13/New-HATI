// src/scripts/utils/cart-data.js
class CartData {
  static async addCartItem(item) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  static getCartItems() {
    return JSON.parse(localStorage.getItem('cart')) || [];
  }

  static removeCartItem(id) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
  }
}

export default CartData;
