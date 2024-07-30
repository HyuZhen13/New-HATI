/* eslint-disable consistent-return */
/* eslint-disable object-shorthand */
import { getDatabase, ref, set, update, get, remove } from 'firebase/database';
import { jsPDF } from 'jspdf';
import UserInfo from './user-info';

class OrderData {
  // Mengambil pesanan terkini pengguna
  static async getCurrentOrder(userId) {
    const db = getDatabase();
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
  static async completeOrder(userId) {
    const db = getDatabase();
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
      }
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  }

  // Mengambil pesanan yang selesai
  static async getCompletedOrders(userId) {
    const db = getDatabase();
    const completedOrdersRef = ref(db, `completed-orders/${userId}`);
    
    try {
      const completedOrdersSnapshot = await get(completedOrdersRef);
      if (!completedOrdersSnapshot.exists()) {
        return [];
      }
      const completedOrdersData = completedOrdersSnapshot.val();
      return Object.values(completedOrdersData);
    } catch (error) {
      console.error('Error fetching completed orders:', error);
      throw error;
    }
  }

  // Menghapus pesanan yang selesai
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

  // Menyimpan feedback produk
  static async saveProductFeedback(orderId, productId, rating, comment) {
    const db = getDatabase();
    const userId = UserInfo.getUserInfo().uid;
    const orderRef = ref(db, `completed-orders/${userId}/${orderId}`);
    
    try {
      const orderSnapshot = await get(orderRef);
      if (!orderSnapshot.exists()) {
        throw new Error('Pesanan tidak ditemukan.');
      }
      const orderData = orderSnapshot.val();
      const product = orderData.items.find(item => item.id === productId);
      if (product) {
        product.rating = rating;
        product.comment = comment;
        await set(orderRef, orderData);
      } else {
        throw new Error('Produk tidak ditemukan dalam pesanan.');
      }
    } catch (error) {
      console.error('Error saving product feedback:', error);
      throw error;
    }
  }

  // Memindahkan pesanan ke daftar pesanan selesai
  static async moveOrderToCompleted(orderId) {
    const db = getDatabase();
    const userId = UserInfo.getUserInfo().uid;
    const orderRef = ref(db, `orders/${userId}/${orderId}`);
    const completedOrdersRef = ref(db, `completed-orders/${userId}/${orderId}`);
    
    try {
      const orderSnapshot = await get(orderRef);
      if (!orderSnapshot.exists()) {
        throw new Error('Pesanan tidak ditemukan.');
      }
      const orderData = orderSnapshot.val();
      await set(completedOrdersRef, orderData);
      await remove(orderRef);
    } catch (error) {
      console.error('Error moving order to completed:', error);
      throw error;
    }
  }

  // Membuat PDF pesanan
  static async createOrderPdf(orderData) {
    const doc = new jsPDF();
    doc.text(`Pesanan ID: ${orderData.id}`, 10, 10);
    doc.text(`Tanggal: ${orderData.timestamp}`, 10, 20);
    doc.text('Detail Pesanan:', 10, 30);

    let yPosition = 40;
    orderData.items.forEach(item => {
      doc.text(`- ${item.name} (x${item.quantity})`, 10, yPosition);
      yPosition += 10;
    });

    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    return pdfUrl;
  }

  // Mendapatkan detail pesanan yang selesai
  static async getCompletedOrderDetails(orderId) {
    const db = getDatabase();
    const userId = UserInfo.getUserInfo().uid;
    const orderRef = ref(db, `completed-orders/${userId}/${orderId}`);
    
    try {
      const orderSnapshot = await get(orderRef);
      if (!orderSnapshot.exists()) {
        throw new Error('Pesanan tidak ditemukan.');
      }
      return orderSnapshot.val();
    } catch (error) {
      console.error('Error fetching completed order details:', error);
      throw error;
    }
  }
}

export default OrderData;
