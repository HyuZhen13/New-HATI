/* eslint-disable consistent-return */
/* eslint-disable object-shorthand */
import { getDatabase, ref, set, update, get, remove } from 'firebase/database';
import { jsPDF } from 'jspdf';
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
    const feedbackRef = ref(db, `product-feedback/${productId}/${userId}`);
    const orderRef = ref(db, `orders/${userId}/${orderId}`);
    const completedOrdersRef = ref(db, `completed-orders/${userId}`);
    try {
      // Menyimpan umpan balik
      await set(feedbackRef, { rating, comment });
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

  // Membuat PDF dari data pesanan
  static async createOrderPdf(orderData) {
    if (!orderData) {
      throw new Error('Data pesanan tidak ditemukan.');
    }

    const doc = new jsPDF();
    doc.text(`Pesanan ID: ${orderData.id}`, 10, 10);
    doc.text(`Tanggal: ${orderData.timestamp}`, 10, 20);

    orderData.items.forEach((item, index) => {
      doc.text(`Item ${index + 1}: ${item.name}`, 10, 30 + index * 10);
      doc.text(`Harga: ${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}`, 10, 40 + index * 10);
      doc.text(`Jumlah: ${item.quantity}`, 10, 50 + index * 10);
      doc.text(`Rating: ${item.rating || 'Belum ada rating'}`, 10, 60 + index * 10);
      doc.text(`Komentar: ${item.comment || 'Belum ada komentar'}`, 10, 70 + index * 10);
    });

    const pdfUrl = URL.createObjectURL(doc.output('blob'));
    return pdfUrl;
  }

  // Mengirim PDF pesanan ke penjual melalui WhatsApp
  static async sendOrderPdfToSeller(orderId) {
    try {
      const orderData = await this.getCompletedOrderDetails(orderId);
      if (!orderData) {
        throw new Error('Data pesanan tidak ditemukan.');
      }

      const pdfUrl = await this.createOrderPdf(orderData);
      const sellerPhoneNumber = '+628123456789'; // Nomor WhatsApp penjual
      const message = `Pesanan ID: ${orderId} telah selesai. Silakan lihat detail pesanan di PDF berikut: ${pdfUrl}`;
      const encodedMessage = encodeURIComponent(message);

      // Mengirim pesan ke WhatsApp
      window.open(`https://wa.me/${sellerPhoneNumber}?text=${encodedMessage}`, '_blank');
    } catch (error) {
      console.error('Error sending order PDF to seller:', error);
      throw error;
    }
  }

  // Mengambil detail pesanan selesai
  static async getCompletedOrderDetails(orderId) {
    const db = getDatabase();
    const userId = UserInfo.getUserInfo().uid;
    const completedOrderRef = ref(db, `completed-orders/${userId}/${orderId}`);
    const orderSnapshot = await get(completedOrderRef);
    return orderSnapshot.exists() ? orderSnapshot.val() : null;
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

      Object.values(ordersData).forEach(userOrders => {
        Object.values(userOrders).forEach(order => {
          if (products) {
            const matchingProducts = order.items.filter(item => products.find(product => product.id === item.id));
            if (matchingProducts.length > 0) {
              allOrders.push(order);
            }
          }
        });
      });
      return allOrders;
    } catch (error) {
      console.error('Error fetching orders by products:', error);
      throw error;
    }
  }

  // Mengambil pesanan berdasarkan ID produk
  static async getOrdersByProductId(productId) {
    const db = getDatabase();
    const ordersRef = ref(db, 'orders');
    const completedOrdersRef = ref(db, 'completed-orders');
    try {
      const [ordersSnapshot, completedOrdersSnapshot] = await Promise.all([get(ordersRef), get(completedOrdersRef)]);
      
      const ordersData = ordersSnapshot.exists() ? ordersSnapshot.val() : {};
      const completedOrdersData = completedOrdersSnapshot.exists() ? completedOrdersSnapshot.val() : {};
      
      const allOrders = { ...ordersData, ...completedOrdersData };
      
      const orders = [];
      Object.values(allOrders).forEach(userOrders => {
        Object.values(userOrders).forEach(order => {
          const matchingProducts = order.items.filter(item => item.id === productId);
          if (matchingProducts.length > 0) {
            orders.push({
              ...order,
              userName: UserInfo.getUserInfo().name // Assuming UserInfo has a method to get the user's name
            });
          }
        });
      });
      return orders;
    } catch (error) {
      console.error('Error fetching orders by product ID:', error);
      throw error;
    }
  }
}

export default OrderData;
