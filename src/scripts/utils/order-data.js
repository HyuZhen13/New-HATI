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

  static async saveProductFeedback(orderId, productId, rating, comment) {
    const db = getDatabase();
    const userId = UserInfo.getUserInfo().uid;
    const feedbackRef = ref(db, `product-feedback/${userId}/${productId}`);
    const orderRef = ref(db, `orders/${userId}/${orderId}`);
    const completedOrdersRef = ref(db, `completed-orders/${userId}`);

    try {
      // Save feedback
      await set(feedbackRef, { rating, comment });

      // Update order data
      const orderSnapshot = await get(orderRef);
      if (!orderSnapshot.exists()) {
        throw new Error('Pesanan tidak ditemukan.');
      }

      const orderData = orderSnapshot.val();
      const itemIndex = orderData.items.findIndex(item => item.id === productId);

      if (itemIndex > -1) {
        const item = orderData.items[itemIndex];
        item.rating = rating;
        item.comment = comment;
        orderData.items.splice(itemIndex, 1);

        await update(orderRef, { items: orderData.items });
        await update(ref(db, `completed-orders/${userId}/${orderId}`), { ...orderData, items: [...orderData.items, item] });
      } else {
        throw new Error('Produk tidak ditemukan dalam pesanan.');
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
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
