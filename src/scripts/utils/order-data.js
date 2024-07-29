/* eslint-disable consistent-return */
/* eslint-disable object-shorthand */
import { getDatabase, ref, set, update, get, remove } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { PDFDocument } from 'pdf-lib';
import UserInfo from './user-info';

class OrderData {
  // Membuat PDF berisi detail pesanan
  static async createOrderPdf(orderId, orderDetails) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    page.drawText(`Order ID: ${orderId}`, { x: 50, y: height - 50, size: 20 });
    page.drawText(`Order Details:`, { x: 50, y: height - 100, size: 18 });

    let yPosition = height - 150;
    for (const item of orderDetails.items) {
      page.drawText(`Product: ${item.name}`, { x: 50, y: yPosition, size: 16 });
      page.drawText(`Price: ${item.price}`, { x: 50, y: yPosition - 20, size: 16 });
      page.drawText(`Quantity: ${item.quantity}`, { x: 50, y: yPosition - 40, size: 16 });
      yPosition -= 80;
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    return blob;
  }

  // Meng-upload PDF ke Firebase Storage
  static async uploadPdf(pdfBlob, orderId) {
    const storage = getStorage();
    const userId = UserInfo.getUserInfo().uid;
    const storageRefPath = `order-pdfs/${userId}/${orderId}.pdf`;
    const pdfRef = storageRef(storage, storageRefPath);

    try {
      await uploadBytes(pdfRef, pdfBlob);
      const url = await getDownloadURL(pdfRef);
      return url;
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
  }

  // Menyelesaikan pesanan dan menyimpan PDF
  static async completeOrder(orderId) {
    const db = getDatabase();
    const userId = UserInfo.getUserInfo().uid;
    const orderRef = ref(db, `orders/${userId}/${orderId}`);
    const completedOrdersRef = ref(db, `completed-orders/${userId}`);

    try {
      const orderSnapshot = await get(orderRef);
      if (orderSnapshot.exists()) {
        const orderData = orderSnapshot.val();

        // Membuat PDF dan meng-upload
        const pdfBlob = await this.createOrderPdf(orderId, orderData);
        const pdfUrl = await this.uploadPdf(pdfBlob, orderId);

        // Menyimpan URL PDF ke data pesanan
        await set(orderRef, {
          ...orderData,
          pdfUrl: pdfUrl,
        });

        // Menyimpan data pesanan ke completed-orders
        await set(ref(db, `completed-orders/${userId}/${orderId}`), {
          ...orderData,
          pdfUrl: pdfUrl,
        });

        // Menghapus pesanan dari orders
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
}

export default OrderData;
