import { getDatabase, ref, get } from 'firebase/database';
import UserInfo from './user-info';

class OrderData {
  static async getCurrentOrder() {
    const db = getDatabase();
    const userId = UserInfo.getUserInfo().uid;
    const ordersRef = ref(db, `orders/${userId}`);
    
    try {
      const ordersSnapshot = await get(ordersRef);
      if (ordersSnapshot.exists()) {
        const ordersData = ordersSnapshot.val();
        const orderIds = Object.keys(ordersData);
        const latestOrderId = Math.max(...orderIds); // Assuming latest order has the highest ID
        return ordersData[latestOrderId];
      }
      return null;
    } catch (error) {
      console.error('Error fetching current order:', error);
      throw error;
    }
  }

  static async getCompletedOrders(userId) {
    const db = getDatabase();
    const completedOrdersRef = ref(db, `completed-orders/${userId}`);

    try {
      const completedOrdersSnapshot = await get(completedOrdersRef);
      if (completedOrdersSnapshot.exists()) {
        return Object.values(completedOrdersSnapshot.val());
      }
      return [];
    } catch (error) {
      console.error('Error fetching completed orders:', error);
      throw error;
    }
  }
}

export default OrderData;
