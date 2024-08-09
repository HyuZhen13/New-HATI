import { getDatabase, ref, set, push, get, update, remove } from 'firebase/database';

class OrderData {
  static async saveOrder(order) {
    const db = getDatabase();
    const ordersRef = push(ref(db, `orders/${order.uid}`));
    await set(ordersRef, order);
    return ordersRef.key;
  }

  static async getOrdersByUserId(uid) {
    const db = getDatabase();
    const ordersRef = ref(db, `orders/${uid}`);
    const snapshot = await get(ordersRef);
    const orders = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        orders.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
    }
    return orders;
  }

  static async getOrderById(uid, orderId) {
    const db = getDatabase();
    const orderRef = ref(db, `orders/${uid}/${orderId}`);
    const snapshot = await get(orderRef);
    return snapshot.exists() ? { id: orderId, ...snapshot.val() } : null;
  }

  static async updateOrderStatus(uid, orderId, status) {
    const db = getDatabase();
    const orderRef = ref(db, `orders/${uid}/${orderId}`);
    await update(orderRef, { status });
  }

  static async setPaymentProof(uid, orderId, paymentProofUrl) {
    const db = getDatabase();
    const orderRef = ref(db, `orders/${uid}/${orderId}`);
    await update(orderRef, { paymentProof: paymentProofUrl });
  }

  static async removeOrder(uid, orderId) {
    const db = getDatabase();
    const orderRef = ref(db, `orders/${uid}/${orderId}`);
    await remove(orderRef);
  }
}

export default OrderData;
