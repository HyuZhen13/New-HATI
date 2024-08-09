import { getDatabase, ref, set, push, get, update, remove } from 'firebase/database';

class CartData {
  static async addCartItem(cartItem) {
    const db = getDatabase();
    const cartRef = push(ref(db, 'cart/' + cartItem.uid));
    await set(cartRef, cartItem);
  }

  static async getCartItems(uid) {
    const db = getDatabase();
    const cartRef = ref(db, `cart/${uid}`);
    const snapshot = await get(cartRef);
    const cartItems = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        cartItems.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
    }
    return cartItems;
  }

  static async updateCartItem(itemId, uid, newQuantity) {
    const db = getDatabase();
    const itemRef = ref(db, `cart/${uid}/${itemId}`);
    await update(itemRef, { quantity: newQuantity });
  }

  static async removeCartItem(itemId, uid) {
    const db = getDatabase();
    const itemRef = ref(db, `cart/${uid}/${itemId}`);
    await remove(itemRef);
  }

  static async clearCart(uid) {
    const db = getDatabase();
    const cartRef = ref(db, `cart/${uid}`);
    await remove(cartRef);
  }

  // Method to upload payment proof and store its URL
  static async setPaymentProof(uid, paymentProofUrl) {
    const db = getDatabase();
    const cartRef = ref(db, `cart/${uid}/paymentProof`);
    await set(cartRef, { url: paymentProofUrl });
  }
}

export default CartData;
