import { getDatabase, ref, set, push, get, update, remove } from 'firebase/database';

class CartData {
  // Menambahkan item ke keranjang berdasarkan uid
  static async addCartItem(cartItem) {
    const db = getDatabase();
    const cartRef = push(ref(db, `cart/${cartItem.uid}`));
    await set(cartRef, cartItem);
  }

  // Mendapatkan semua item keranjang berdasarkan uid
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

  // Memperbarui kuantitas item di keranjang dan data lain (jika diperlukan) berdasarkan itemId dan uid
  static async updateCartItem(itemId, uid, updatedData) {
    const db = getDatabase();
    const itemRef = ref(db, `cart/${uid}/${itemId}`);
    await update(itemRef, updatedData);
  }

  // Menghapus item dari keranjang berdasarkan itemId dan uid
  static async removeCartItem(itemId, uid) {
    const db = getDatabase();
    const itemRef = ref(db, `cart/${uid}/${itemId}`);
    await remove(itemRef);
  }

  // Menghapus semua item dari keranjang berdasarkan uid
  static async clearCart(uid) {
    const db = getDatabase();
    const cartRef = ref(db, `cart/${uid}`);
    await remove(cartRef);
  }

  // Menyimpan bukti pembayaran dan mengupdate data pesanan dengan URL bukti pembayaran
  static async setPaymentProof(uid, itemId, paymentProofUrl) {
    const db = getDatabase();
    const itemRef = ref(db, `cart/${uid}/${itemId}`);
    await update(itemRef, { paymentProofUrl });
  }
}

export default CartData;
