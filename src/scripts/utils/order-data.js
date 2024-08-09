import { getDatabase, ref, set, get, update, remove } from 'firebase/database';
import CartData from './cart-data'; // Import CartData

class OrderData {
  constructor() {
    this.db = getDatabase();
  }

  // Tambah pesanan ke database pesanan belum dibayar
  async addOrder(uid, orders) {
    const orderRef = ref(this.db, `orders/unpaid/${uid}`);
    const updates = {};
    try {
      orders.forEach(order => {
        updates[order.id] = order;
      });
      await update(orderRef, updates);
    } catch (error) {
      console.error('Error adding orders:', error);
    }
  }

  // Ambil semua pesanan belum dibayar
  async getUnpaidOrders(uid) {
    const orderRef = ref(this.db, `orders/unpaid/${uid}`);
    try {
      const snapshot = await get(orderRef);
      return snapshot.exists() ? snapshot.val() : {};
    } catch (error) {
      console.error('Error getting unpaid orders:', error);
      return {};
    }
  }

  // Ambil semua pesanan telah dibayar
  async getPaidOrders(uid) {
    const orderRef = ref(this.db, `orders/paid/${uid}`);
    try {
      const snapshot = await get(orderRef);
      return snapshot.exists() ? snapshot.val() : {};
    } catch (error) {
      console.error('Error getting paid orders:', error);
      return {};
    }
  }

  // Pindahkan pesanan dari belum dibayar ke telah dibayar
  async markAsPaid(uid, orderId) {
    const unpaidOrderRef = ref(this.db, `orders/unpaid/${uid}/${orderId}`);
    const paidOrderRef = ref(this.db, `orders/paid/${uid}/${orderId}`);
    try {
      const orderSnapshot = await get(unpaidOrderRef);
      if (orderSnapshot.exists()) {
        const orderData = orderSnapshot.val();
        await set(paidOrderRef, orderData);
        await remove(unpaidOrderRef);
      }
    } catch (error) {
      console.error('Error marking order as paid:', error);
    }
  }
}

export default new OrderData();
