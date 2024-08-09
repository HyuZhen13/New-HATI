import { getDatabase, ref, set, get, update, remove } from 'firebase/database';

class OrderData {
  constructor() {
    this.db = getDatabase();
  }

  // Tambah pesanan ke database pesanan belum dibayar
  async addOrder(uid, orders) {
    const orderRef = ref(this.db, `orders/unpaid/${uid}`);
    const updates = {};

    orders.forEach(order => {
      updates[order.id] = order;
    });

    await update(orderRef, updates);
  }

  // Ambil semua pesanan belum dibayar
  async getUnpaidOrders(uid) {
    const orderRef = ref(this.db, `orders/unpaid/${uid}`);
    const snapshot = await get(orderRef);
    return snapshot.exists() ? snapshot.val() : {};
  }

  // Ambil semua pesanan telah dibayar
  async getPaidOrders(uid) {
    const orderRef = ref(this.db, `orders/paid/${uid}`);
    const snapshot = await get(orderRef);
    return snapshot.exists() ? snapshot.val() : {};
  }

  // Pindahkan pesanan dari belum dibayar ke telah dibayar
  async markAsPaid(uid, orderId) {
    const unpaidOrderRef = ref(this.db, `orders/unpaid/${uid}/${orderId}`);
    const paidOrderRef = ref(this.db, `orders/paid/${uid}/${orderId}`);

    const orderSnapshot = await get(unpaidOrderRef);

    if (orderSnapshot.exists()) {
      const orderData = orderSnapshot.val();
      await set(paidOrderRef, orderData);
      await remove(unpaidOrderRef);
    }
  }
}

export default new OrderData();

