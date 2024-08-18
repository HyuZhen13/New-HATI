import { getDatabase, ref, set, update, get, remove } from 'firebase/database';
import UserInfo from './user-info';
class OrderData {
  // Mengambil pesanan terkini pengguna
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
      
      // Mengembalikan pesanan terbaru
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
  // Menyelesaikan pesanan terkini pengguna
  static async completeOrder() {
    const db = getDatabase();
    const userId = UserInfo.getUserInfo().uid;
    const ordersRef = ref(db, `orders/${userId}`);
    const completedOrdersRef = ref(db, `completed-orders/${userId}`);
    
    try {
      const ordersSnapshot = await get(ordersRef);
      if (!ordersSnapshot.exists()) {
        throw new Error('Tidak ada pesanan yang ditemukan.');
      }
      const ordersData = ordersSnapshot.val();
      const orderIds = Object.keys(ordersData);
      if (orderIds.length > 0) {
        const latestOrderId = orderIds[orderIds.length - 1];
        const orderData = ordersData[latestOrderId];
        const orderRef = ref(db, `orders/${userId}/${latestOrderId}`);
        
        // Perbarui status pesanan menjadi selesai
        await update(orderRef, { status: 'completed' });
        // Pindahkan pesanan ke completed-orders
        await set(ref(db, `completed-orders/${userId}/${latestOrderId}`), orderData);
        // Hapus pesanan dari orders
        await remove(orderRef);
        return orderData;
      } else {
        throw new Error('Tidak ada pesanan yang dapat diselesaikan.');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  }

// Menyimpan umpan balik produk
static async saveProductFeedback(orderId, productId, rating, comment) {
    const db = getDatabase();
    const userId = UserInfo.getUserInfo().uid;
    const userName = UserInfo.getUserInfo().name; // Mendapatkan username dari UserInfo
    const feedbackRef = ref(db, `product-feedback/${productId}/${userId}`);
    const orderRef = ref(db, `orders/${userId}/${orderId}`);
    const completedOrdersRef = ref(db, `completed-orders/${userId}`);

    try {
        // Menyimpan umpan balik dengan menambahkan username
        await set(feedbackRef, { userName, rating, comment });
        
        // Memperbarui data pesanan
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
            item.userName = userName; // Simpan username di data pesanan
            orderData.items[itemIndex] = item;

            // Update order data dan completed orders data
            await update(orderRef, { items: orderData.items });
            await update(ref(db, `completed-orders/${userId}/${orderId}`), { ...orderData });
        } else {
            throw new Error('Produk tidak ditemukan dalam pesanan.');
        }
    } catch (error) {
        console.error('Error saving feedback:', error);
        throw error;
    }
}

  // Mengambil umpan balik produk
  static async getProductFeedback(productId) {
    const db = getDatabase();
    const feedbackRef = ref(db, `product-feedback/${productId}`);
    try {
      const feedbackSnapshot = await get(feedbackRef);
      if (!feedbackSnapshot.exists()) {
        return [];
      }
      const feedbackData = feedbackSnapshot.val();
      const feedbacks = Object.entries(feedbackData).map(([userId, feedback]) => ({
        userId,
        ...feedback
      }));
      console.log('Data umpan balik produk diambil dari Firebase:', feedbacks);
      return feedbacks;
    } catch (error) {
      console.error('Error fetching product feedback:', error);
      throw error;
    }
  }
  // Mengambil pesanan yang telah selesai
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
  // Menghapus pesanan yang telah selesai
  static async deleteCompletedOrder(orderId) {
    const db = getDatabase();
    const userId = UserInfo.getUserInfo().uid;
    const orderRef = ref(db, `completed-orders/${userId}/${orderId}`);
    try {
      await remove(orderRef);
    } catch (error) {
      console.error('Error deleting completed order:', error);
      throw error;
    }
  }
  // Mengambil pesanan berdasarkan produk yang dijual
  static async getOrdersByProducts(products) {
    const db = getDatabase();
    const ordersRef = ref(db, 'orders');
    try {
      const ordersSnapshot = await get(ordersRef);
      if (!ordersSnapshot.exists()) {
        return [];
      }
      const ordersData = ordersSnapshot.val();
      const allOrders = [];
      // Iterasi melalui semua pesanan dan cocokkan dengan produk yang dijual
      Object.values(ordersData).forEach(userOrders => {
        if (userOrders) { // Cek jika userOrders tidak undefined
          Object.values(userOrders).forEach(order => {
            if (order && order.items) { // Cek jika order dan order.items tidak undefined
              const matchingProducts = order.items.filter(item => products.find(product => product.id === item.id));
              if (matchingProducts.length > 0) {
                allOrders.push(order);
              }
            }
          });
        }
      });
      return allOrders;
    } catch (error) {
      console.error('Error fetching orders by products:', error);
      throw error;
    }
  }
  // Fungsi untuk mendapatkan daftar ID produk dari semua pesanan
  static async getProductIds() {
    const db = getDatabase();
    const ordersRef = ref(db, 'orders');
    try {
      const ordersSnapshot = await get(ordersRef);
      if (!ordersSnapshot.exists()) {
        return [];
      }
      const ordersData = ordersSnapshot.val();
      const productIds = [];
      // Loop melalui pesanan untuk mengumpulkan semua productId
      Object.values(ordersData).forEach(userOrders => {
        if (userOrders) { // Cek jika userOrders tidak undefined
          Object.values(userOrders).forEach(order => {
            if (order && order.items) { // Cek jika order dan order.items tidak undefined
              order.items.forEach(item => {
                if (item && !productIds.includes(item.id)) { // Cek jika item tidak undefined dan productId belum ditambahkan
                  productIds.push(item.id);
                }
              });
            }
          });
        }
      });
      return productIds;
    } catch (error) {
      console.error('Error fetching product IDs:', error);
      throw error;
    }
  }
  // Fungsi baru untuk mengambil semua pesanan pengguna
  static async getOrders(userId) {
    const db = getDatabase();
    const ordersRef = ref(db, `orders/${userId}`);
    try {
      const ordersSnapshot = await get(ordersRef);
      if (ordersSnapshot.exists()) {
        return Object.values(ordersSnapshot.val());
      }
      return [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }
}
export default OrderData;
