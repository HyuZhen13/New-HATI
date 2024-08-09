import { getDatabase, ref, set, get, update, remove } from 'firebase/database';
import { getStorage, uploadBytes, ref as storageRef, getDownloadURL } from 'firebase/storage'; // Import Firebase Storage functions
import ProductData from './product-data';
import UserData from './user-data';

class CartData {
  constructor() {
    this.db = getDatabase();
    this.storage = getStorage(); // Initialize Firebase Storage
  }

  // Tambah produk ke keranjang
  async addToCart(uid, product) {
    const cartRef = ref(this.db, `carts/${uid}/${product.id}`);
    try {
      const snapshot = await get(cartRef);
      if (snapshot.exists()) {
        const existingProduct = snapshot.val();
        existingProduct.quantity += product.quantity; // Tambah kuantitas jika produk sudah ada
        await update(cartRef, { quantity: existingProduct.quantity });
      } else {
        await set(cartRef, product);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }

  // Ambil semua item dari keranjang
  async getCartItems(uid) {
    const cartRef = ref(this.db, `carts/${uid}`);
    try {
      const snapshot = await get(cartRef);
      const cartItems = snapshot.exists() ? snapshot.val() : {};
      
      // Tambahkan informasi produk dari ProductData
      const productPromises = Object.keys(cartItems).map(async (key) => {
        const product = await ProductData.getProductById(cartItems[key].id);
        return { ...cartItems[key], ...product };
      });

      const products = await Promise.all(productPromises);
      return products.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});
    } catch (error) {
      console.error('Error getting cart items:', error);
      return {};
    }
  }

  // Perbarui kuantitas produk di keranjang
  async updateCartItem(uid, productId, updates) {
    const cartRef = ref(this.db, `carts/${uid}/${productId}`);
    try {
      await update(cartRef, updates);
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  }

  // Hapus item dari keranjang
  async removeCartItem(uid, productId) {
    const cartRef = ref(this.db, `carts/${uid}/${productId}`);
    try {
      await remove(cartRef);
    } catch (error) {
      console.error('Error removing cart item:', error);
    }
  }

  // Hapus semua item dari keranjang setelah checkout
  async clearCart(uid) {
    const cartRef = ref(this.db, `carts/${uid}`);
    try {
      await remove(cartRef);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }

  // Simpan data pesanan ke database pesanan belum dibayar
  async saveOrder(uid, order, paymentProofFile) {
    const orderRef = ref(this.db, `orders/unpaid/${uid}/${order.id}`);
    try {
      // Upload payment proof if available
      if (paymentProofFile) {
        const proofRef = storageRef(this.storage, `payment_proofs/${uid}/${order.id}`);
        await uploadBytes(proofRef, paymentProofFile);
        const proofURL = await getDownloadURL(proofRef);
        order.paymentProofURL = proofURL;
      }

      await set(orderRef, order);
    } catch (error) {
      console.error('Error saving order:', error);
    }
  }

  // Pindahkan data pesanan dari pesanan belum dibayar ke pesanan telah dibayar
  async completeOrder(uid, orderId) {
    const orderRef = ref(this.db, `orders/unpaid/${uid}/${orderId}`);
    const paidOrderRef = ref(this.db, `orders/paid/${uid}/${orderId}`);
    try {
      const orderSnapshot = await get(orderRef);
      if (orderSnapshot.exists()) {
        const orderData = orderSnapshot.val();
        await set(paidOrderRef, orderData);
        await remove(orderRef); // Hapus dari pesanan belum dibayar setelah dipindahkan
      }
    } catch (error) {
      console.error('Error completing order:', error);
    }
  }

  // Ambil semua pesanan belum dibayar
  async getUnpaidOrders(uid) {
    const orderRef = ref(this.db, `orders/unpaid/${uid}`);
    try {
      const snapshot = await get(orderRef);
      return snapshot.exists() ? snapshot.val() : {};
    } catch (error) {
      console.error('Error getting unpaid orders:', error);
      return {};
    }
  }

  // Ambil semua pesanan telah dibayar
  async getPaidOrders(uid) {
    const orderRef = ref(this.db, `orders/paid/${uid}`);
    try {
      const snapshot = await get(orderRef);
      return snapshot.exists() ? snapshot.val() : {};
    } catch (error) {
      console.error('Error getting paid orders:', error);
      return {};
    }
  }
}

export default new CartData();
