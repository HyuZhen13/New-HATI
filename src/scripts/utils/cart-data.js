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
}

export default CartData;
