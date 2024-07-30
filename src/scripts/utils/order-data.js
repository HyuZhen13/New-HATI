/* eslint-disable consistent-return */
/* eslint-disable object-shorthand */
import { getDatabase, ref, set, update, get, remove } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import UserInfo from './user-info';
import axios from 'axios'; // Menggunakan axios untuk HTTP request

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

        // Upload PDF
        const pdfBlob = await this.generateOrderPDF(orderData); // Anda perlu mengimplementasikan generateOrderPDF
        const pdfURL = await this.uploadPDF(pdfBlob);

        // Ambil nomor WhatsApp seller
        const sellerNumber = await this.getSellerNumber(orderData.items[0].id); // Ambil ID produk dari orderData
        
        // Kirim link PDF ke WhatsApp seller
        await this.sendPDFLinkToSeller(sellerNumber, pdfURL);

        return orderData;
      } else {
        throw new Error('Tidak ada pesanan yang dapat diselesaikan.');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  }

  // Mengupload file PDF ke Firebase Storage
  static async uploadPDF(pdfBlob) {
    const userId = UserInfo.getUserInfo().uid;
    const storage = getStorage();
    const pdfStorageRef = storageRef(storage, `pdfs/orders/${userId}/${Date.now()}.pdf`);

    try {
      await uploadBytes(pdfStorageRef, pdfBlob);
      const downloadURL = await getDownloadURL(pdfStorageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
  }

  // Menghasilkan PDF dari data pesanan (anda perlu mengimplementasikan fungsi ini)
  static async generateOrderPDF(orderData) {
    // Implementasikan pembuatan PDF di sini, mungkin menggunakan library seperti jsPDF
    throw new Error('generateOrderPDF function not implemented.');
  }

  // Mengambil nomor WhatsApp seller berdasarkan ID produk
  static async getSellerNumber(productId) {
    const db = getDatabase();
    const productRef = ref(db, `products/${productId}`);
    try {
      const productSnapshot = await get(productRef);
      if (!productSnapshot.exists()) {
        throw new Error('Produk tidak ditemukan.');
      }
      const productData = productSnapshot.val();
      const sellerNumber = productData.sellerNumber; // Asumsi bahwa sellerNumber ada di data produk
      if (!sellerNumber) {
        throw new Error('Nomor WhatsApp seller tidak tersedia.');
      }
      return sellerNumber;
    } catch (error) {
      console.error('Error fetching seller number:', error);
      throw error;
    }
  }

  // Mengirimkan link PDF ke WhatsApp seller
  static async sendPDFLinkToSeller(sellerNumber, pdfURL) {
    // Gantilah dengan endpoint API WhatsApp yang sesuai
    const apiUrl = 'https://api.whatsapp.com/send?phone=';
    const message = `Pesanan Anda telah selesai diproses. Anda dapat mengunduh PDF dari pesanan melalui tautan berikut: ${pdfURL}`;

    try {
      await axios.post(`${apiUrl}${sellerNumber}`, {
        body: message
      });
      console.log('Link PDF berhasil dikirim ke WhatsApp seller.');
    } catch (error) {
      console.error('Error sending PDF link to WhatsApp:', error);
      throw error;
    }
  }
}

export default OrderData;
