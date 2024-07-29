import { getDatabase, ref, get, set, update, remove } from 'firebase/database';
import UserInfo from './user-info';
import ProductData from './product-data';

class OrderData {
  // Mengambil pesanan terkini untuk pengguna
  static async getCurrentOrder() {
    const db = getDatabase();
    const userId = UserInfo.getUserInfo().uid;
    const orderRef = ref(db, `orders/${userId}`);
    
    try {
      const orderSnapshot = await get(orderRef);
      if (!orderSnapshot.exists()) {
        return null; // Tidak ada pesanan saat ini
      }
      return orderSnapshot.val();
    } catch (error) {
      console.log('Error fetching current order:', error);
      throw error;
    }
  }

  // Menyelesaikan pesanan
  static async completeOrder() {
    const db = getDatabase();
    const userId = UserInfo.getUserInfo().uid;
    const orderRef = ref(db, `orders/${userId}`);
    const completedOrdersRef = ref(db, `completed-orders/${userId}`);
    
    try {
      const orderSnapshot = await get(orderRef);
      if (!orderSnapshot.exists()) {
        throw new Error('Pesanan tidak ditemukan.');
      }

      const orderData = orderSnapshot.val();
      const orderId = orderData.id;

      // Menyimpan pesanan ke completed-orders
      await set(ref(db, `completed-orders/${userId}/${orderId}`), orderData);

      // Menghapus pesanan dari orders
      await remove(orderRef);

      console.log('Pesanan berhasil diselesaikan.');
    } catch (error) {
      console.log('Error completing order:', error);
      throw error;
    }
  }

  // Menyimpan umpan balik produk
  static async saveProductFeedback(orderId, feedback) {
    const db = getDatabase();
    const userId = UserInfo.getUserInfo().uid;
    const orderRef = ref(db, `orders/${userId}/${orderId}`);

    try {
      const orderSnapshot = await get(orderRef);
      if (!orderSnapshot.exists()) {
        throw new Error('Pesanan tidak ditemukan.');
      }

      const orderData = orderSnapshot.val();
      const productIndex = orderData.items.findIndex(item => item.id === feedback.productId);
      if (productIndex !== -1) {
        // Menambahkan umpan balik produk ke pesanan
        if (!orderData.items[productIndex].feedback) {
          orderData.items[productIndex].feedback = [];
        }
        orderData.items[productIndex].feedback.push(feedback);

        // Memperbarui pesanan di database
        await update(orderRef, { items: orderData.items });

        // Jika pesanan selesai, pindahkan ke completed-orders
        await OrderData.completeOrder();

        console.log('Umpan balik produk berhasil disimpan.');
      } else {
        throw new Error('Produk tidak ditemukan dalam pesanan.');
      }
    } catch (error) {
      console.log('Error saving product feedback:', error);
      throw error;
    }
  }

  // Mengambil semua pesanan selesai untuk pengguna
  static async getCompletedOrders(userId) {
    const db = getDatabase();
    const completedOrdersRef = ref(db, `completed-orders/${userId}`);
    
    try {
      const completedOrdersSnapshot = await get(completedOrdersRef);
      if (!completedOrdersSnapshot.exists()) {
        return [];
      }
      return Object.values(completedOrdersSnapshot.val());
    } catch (error) {
      console.log('Error fetching completed orders:', error);
      throw error;
    }
  }

  // Menghapus pesanan yang telah selesai
  static async deleteCompletedOrder(orderId) {
    const db = getDatabase();
    const userId = UserInfo.getUserInfo().uid;
    const completedOrderRef = ref(db, `completed-orders/${userId}/${orderId}`);
    
    try {
      await remove(completedOrderRef);
      console.log('Pesanan berhasil dihapus.');
    } catch (error) {
      console.log('Error deleting completed order:', error);
      throw error;
    }
  }
}

export default OrderData;
