import { getDatabase, ref, set, push, get, update, remove } from 'firebase/database';

class CartData {
  static async addItemToCart(uid, item) {
    const db = getDatabase();
    const cartRef = ref(db, `carts/${uid}`);
    const newItemRef = push(cartRef);
    await set(newItemRef, item);
  }

  static async getCartItems(uid) {
    const db = getDatabase();
    const cartRef = ref(db, `carts/${uid}`);
    const snapshot = await get(cartRef);
    if (snapshot.exists()) {
      const cartData = snapshot.val();
      return Object.keys(cartData).map(key => ({
        ...cartData[key],
        id: key,
      }));
    } else {
      return [];
    }
  }

  static async updateCartItem(itemId, uid, newQuantity) {
    const db = getDatabase();
    const itemRef = ref(db, `carts/${uid}/${itemId}`);
    await update(itemRef, { quantity: newQuantity });
  }

  static async removeCartItem(itemId, uid) {
    const db = getDatabase();
    const itemRef = ref(db, `carts/${uid}/${itemId}`);
    await remove(itemRef);
  }

  static async clearCart(uid) {
    const db = getDatabase();
    const cartRef = ref(db, `carts/${uid}`);
    await remove(cartRef);
  }
}

export default CartData;
