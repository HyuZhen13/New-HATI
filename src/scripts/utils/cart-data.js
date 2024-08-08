import { get, getDatabase, ref, set, update, remove } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import UserInfo from './user-info';

class CartData {
  static async getCart() {
    const userId = UserInfo.getUserInfo().uid;
    const dbRef = ref(getDatabase());

    try {
      const cartSnapshot = await get(child(dbRef, `carts/${userId}`));
      return cartSnapshot.val() || {};
    } catch (e) {
      console.log(e.message);
    }
  }

  static async addItemToCart(item) {
    const userId = UserInfo.getUserInfo().uid;
    const dbRef = ref(getDatabase());

    try {
      await set(ref(dbRef, `carts/${userId}/${item.id}`), item);
    } catch (e) {
      console.log(e.message);
    }
  }

  static async updateItemQuantity(itemId, quantity) {
    const userId = UserInfo.getUserInfo().uid;
    const dbRef = ref(getDatabase());

    try {
      await update(ref(dbRef, `carts/${userId}/${itemId}`), { quantity });
    } catch (e) {
      console.log(e.message);
    }
  }

  static async removeItemFromCart(itemId) {
    const userId = UserInfo.getUserInfo().uid;
    const dbRef = ref(getDatabase());

    try {
      await remove(ref(dbRef, `carts/${userId}/${itemId}`));
    } catch (e) {
      console.log(e.message);
    }
  }

  static async checkout(cartItems) {
    const userId = UserInfo.getUserInfo().uid;
    const orderId = Date.now();
    const db = getDatabase();
    const orderRef = ref(db, `orders/${userId}/${orderId}`);
    
    try {
      await set(orderRef, {
        id: orderId,
        items: cartItems,
        paymentProof: null,
        timestamp: new Date().toISOString(),
        status: 'unpaid',
      });

      // Update stock for each product
      for (const item of cartItems) {
        const productRef = ref(db, `products/${item.id}`);
        const productSnapshot = await get(productRef);
        const productData = productSnapshot.val();

        const newStock = productData.stock - item.quantity;
        if (newStock < 0) {
          throw new Error(`Stok produk ${item.name} tidak mencukupi.`);
        }

        await update(productRef, { stock: newStock });
      }

      // Clear the cart after checkout
      await remove(ref(db, `carts/${userId}`));
    } catch (e) {
      console.log(e.message);
    }
  }

  static async uploadPaymentProof(orderId, paymentProof) {
    const db = getDatabase();
    const userId = UserInfo.getUserInfo().uid;
    const orderRef = ref(db, `orders/${userId}/${orderId}`);
    const storage = getStorage();
    const storageReference = storageRef(storage, `payment-proof/${orderId}`);

    try {
      await uploadBytes(storageReference, paymentProof);
      const url = await getDownloadURL(storageReference);

      await update(orderRef, { paymentProof: url, status: 'paid' });
    } catch (e) {
      console.log(e.message);
    }
  }

  static async getOrders(userId) {
    const dbRef = ref(getDatabase());
    try {
      const ordersSnapshot = await get(child(dbRef, `orders/${userId}`));
      return ordersSnapshot.val() || {};
    } catch (e) {
      console.log(e.message);
    }
  }
}

export default CartData;
