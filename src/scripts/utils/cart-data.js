import { getDatabase, ref, set, get, update, remove } from 'firebase/database';

class CartData {
  constructor() {
    this.db = getDatabase();
  }

  // Tambah produk ke keranjang
  async addToCart(uid, product) {
    const cartRef = ref(this.db, `carts/${uid}/${product.id}`);
    const snapshot = await get(cartRef);

    if (snapshot.exists()) {
      const existingProduct = snapshot.val();
      existingProduct.quantity += product.quantity; // Tambah kuantitas jika produk sudah ada
      await update(cartRef, { quantity: existingProduct.quantity });
    } else {
      await set(cartRef, product);
    }
  }

  // Ambil semua item dari keranjang
  async getCartItems(uid) {
    const cartRef = ref(this.db, `carts/${uid}`);
    const snapshot = await get(cartRef);
    return snapshot.exists() ? snapshot.val() : {};
  }

  // Perbarui kuantitas produk di keranjang
  async updateCartItem(uid, productId, updates) {
    const cartRef = ref(this.db, `carts/${uid}/${productId}`);
    await update(cartRef, updates);
  }

  // Hapus item dari keranjang
  async removeCartItem(uid, productId) {
    const cartRef = ref(this.db, `carts/${uid}/${productId}`);
    await remove(cartRef);
  }

  // Hapus semua item dari keranjang setelah checkout
  async clearCart(uid) {
    const cartRef = ref(this.db, `carts/${uid}`);
    await remove(cartRef);
  }

  // Simpan data pesanan ke database pesanan belum dibayar
  async saveOrder(uid, order) {
    const orderRef = ref(this.db, `orders/unpaid/${uid}/${order.id}`);
    await set(orderRef, order);
  }

  // Pindahkan data pesanan dari pesanan belum dibayar ke pesanan telah dibayar
  async completeOrder(uid, orderId) {
    const orderRef = ref(this.db, `orders/unpaid/${uid}/${orderId}`);
    const orderSnapshot = await get(orderRef);

    if (orderSnapshot.exists()) {
      const orderData = orderSnapshot.val();
      const paidOrderRef = ref(this.db, `orders/paid/${uid}/${orderId}`);
      await set(paidOrderRef, orderData);
      await remove(orderRef); // Hapus dari pesanan belum dibayar setelah dipindahkan
    }
  }

  // Ambil semua pesanan belum dibayar
  async getUnpaidOrders(uid) {
    const orderRef = ref(this.db, `orders/unpaid/${uid}`);
    const snapshot = await get(orderRef);
    return snapshot.exists() ? snapshot.val() : {};
  }

  // Ambil semua pesanan telah dibayar
  async getPaidOrders(uid) {
    const orderRef = ref(this.db, `orders/paid/${uid}`);
    const snapshot = await get(orderRef);
    return snapshot.exists() ? snapshot.val() : {};
  }
}

export default new CartData();
