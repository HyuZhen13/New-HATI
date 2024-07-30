import { getDatabase, ref, set, update, get, remove } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
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

  // Mengambil semua pesanan yang telah selesai
  static async getCompletedOrders(userId) {
    const db = getDatabase();
    const ordersRef = ref(db, `completed-orders/${userId}`);
    try {
      const ordersSnapshot = await get(ordersRef);
      if (!ordersSnapshot.exists()) {
        return [];
      }
      const ordersData = ordersSnapshot.val();
      console.log('Data pesanan selesai yang diambil dari Firebase:', ordersData);
      return Object.values(ordersData);
    } catch (error) {
      console.error('Error fetching completed orders:', error);
      throw error;
    }
  }

  // Menyimpan feedback produk
  static async saveProductFeedback(orderId, productId, rating, comment) {
    const db = getDatabase();
    const feedbackRef = ref(db, `order-feedback/${orderId}/${productId}`);
    try {
      await set(feedbackRef, {
        rating,
        comment
      });
    } catch (error) {
      console.error('Error saving product feedback:', error);
      throw error;
    }
  }

  // Menyelesaikan pesanan
  static async completeOrder() {
    const db = getDatabase();
    const userId = UserInfo.getUserInfo().uid;
    const currentOrderRef = ref(db, `orders/${userId}`);
    const completedOrdersRef = ref(db, `completed-orders/${userId}`);
    try {
      const currentOrderSnapshot = await get(currentOrderRef);
      if (!currentOrderSnapshot.exists()) {
        throw new Error('Tidak ada pesanan yang sedang diproses.');
      }
      const currentOrderData = currentOrderSnapshot.val();
      const orderIds = Object.keys(currentOrderData);
      
      // Menyimpan pesanan yang selesai
      for (const orderId of orderIds) {
        const orderRef = ref(db, `orders/${userId}/${orderId}`);
        const orderData = currentOrderData[orderId];
        await set(ref(db, `completed-orders/${userId}/${orderId}`), orderData);
        await remove(orderRef);
      }
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  }

  // Mengupload PDF ke Firebase Storage
  static async uploadPDF(pdfBlob) {
    const userId = UserInfo.getUserInfo().uid;
    const storage = getStorage();
    const pdfRef = storageRef(storage, `order-pdfs/${userId}/${Date.now()}.pdf`);
    try {
      const uploadTask = await uploadBytes(pdfRef, pdfBlob);
      const pdfUrl = await getDownloadURL(uploadTask.ref);
      console.log('URL PDF:', pdfUrl);
      return pdfUrl;
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
  }

  // Mendapatkan nomor WhatsApp seller
  static async getSellerNumber(productId) {
    const db = getDatabase();
    const productRef = ref(db, `products/${productId}`);
    try {
      const productSnapshot = await get(productRef);
      const productData = productSnapshot.val();
      if (productData) {
        return productData.sellerNumber; // Gantilah dengan field yang sesuai untuk nomor WhatsApp seller
      }
      throw new Error('Seller number not found');
    } catch (error) {
      console.error('Error fetching seller number:', error);
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
}

export default OrderData;
