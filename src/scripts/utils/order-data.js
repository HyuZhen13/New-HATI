/* eslint-disable consistent-return */
/* eslint-disable object-shorthand */
import { getDatabase, ref, set, update, get } from 'firebase/database';
import UserInfo from './user-info';

class OrderData {
  static async getCurrentOrder() {
    const db = getDatabase();
    const userId = UserInfo.getUserInfo().uid;
    const ordersRef = ref(db, `orders/${userId}`);
    
    try {
      const ordersSnapshot = await get(ordersRef);
      if (!ordersSnapshot.exists()) {
        return null;
      }

      const ordersData = ordersSnapshot.val();
      const orderIds = Object.keys(ordersData);
      
      // Return the latest order
      if (orderIds.length > 0) {
        const latestOrderId = orderIds[orderIds.length - 1];
        return ordersData[latestOrderId];
      }

      return null;
    } catch (error) {
      console.error('Error fetching current order:', error);
      throw error;
    }
  }

  static async completeOrder() {
    const db = getDatabase();
    const userId = UserInfo.getUserInfo().uid;
    const ordersRef = ref(db, `orders/${userId}`);
    
    try {
      const ordersSnapshot = await get(ordersRef);
      if (!ordersSnapshot.exists()) {
        throw new Error('Tidak ada pesanan yang ditemukan.');
      }

      const ordersData = ordersSnapshot.val();
      const orderIds = Object.keys(ordersData);

      if (orderIds.length > 0) {
        const latestOrderId = orderIds[orderIds.length - 1];
        const orderRef = ref(db, `orders/${userId}/${latestOrderId}`);
        
        await update(orderRef, { status: 'completed' });
      } else {
        throw new Error('Tidak ada pesanan yang dapat diselesaikan.');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  }
}

export default OrderData;
