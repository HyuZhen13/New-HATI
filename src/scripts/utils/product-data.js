import {
  get, getDatabase, ref, set, child, update, remove,
} from 'firebase/database';
import {
  getStorage, uploadBytes, ref as storageRef, getDownloadURL,
} from 'firebase/storage';
import UserInfo from './user-info'; // Pastikan untuk menyesuaikan path jika perlu

class ProductData {
  static async addProduct(product, image) {
    const db = getDatabase();
    const storage = getStorage();
    const id = Date.now();
    const storageReference = storageRef(storage, `users/${product.uid}/products/${product.name}`);

    try {
      await uploadBytes(storageReference, image);
      const url = await getDownloadURL(storageReference);

      await set(ref(db, `products/${id}-${product.uid}`), {
        id: `${id}-${product.uid}`,
        uid: product.uid,
        name: product.name,
        price: product.price,
        desc: product.desc,
        seller: product.seller,
        stock: product.stock,
        image: url,
      });

      location.href = '#/profile';
      location.reload();
    } catch (e) {
      console.log(e.message);
    }
  }

  static async getProduct() {
    const dbRef = ref(getDatabase());

    try {
      const productSnapshot = await get(child(dbRef, 'products/'));
      return productSnapshot.val();
    } catch (e) {
      console.log(e.message);
    }
  }

  static async getProductById(id) {
    const dbRef = ref(getDatabase());

    try {
      const productSnapshot = await get(child(dbRef, `products/${id}`));
      return productSnapshot.val();
    } catch (e) {
      console.log(e.message);
    }
  }

  static async deleteProduct(id) {
    const dbRef = ref(getDatabase());

    try {
      await remove(child(dbRef, `products/${id}`));
    } catch (e) {
      console.log(e.message);
    }
  }

  static async updateProduct(product, image) {
    const db = getDatabase();
    const storage = getStorage();
    const storageReference = storageRef(storage, `users/${product.uid}/products/${product.name}`);

    try {
      if (image) {
        await uploadBytes(storageReference, image);
        const url = await getDownloadURL(storageReference);

        await update(ref(db, `products/${product.id}`), {
          name: product.name,
          price: product.price,
          desc: product.desc,
          seller: product.seller,
          stock: product.stock,
          image: url,
        });
      } else {
        await update(ref(db, `products/${product.id}`), {
          name: product.name,
          price: product.price,
          desc: product.desc,
          seller: product.seller,
          stock: product.stock,
        });
      }

      location.href = '#/profile';
      location.reload();
    } catch (e) {
      console.log(e.message);
    }
  }

  static async moveToOrderPage(orderItems) {
    const db = getDatabase();
    const userId = UserInfo.getUserInfo().uid;
    const orderId = Date.now();
    const orderRef = ref(db, `orders/${userId}/${orderId}`);

    try {
      await set(orderRef, {
        id: orderId,
        items: orderItems,
        paymentProof: null, // Initially null, will be updated after payment
        timestamp: new Date().toISOString(),
        status: 'unpaid', // Track payment status
      });

      // Update stock for each product
      for (const order of orderItems) {
        const productRef = ref(db, `products/${order.id}`);
        const productSnapshot = await get(productRef);
        const productData = productSnapshot.val();

        const newStock = productData.stock - order.quantity;
        if (newStock < 0) {
          throw new Error(`Stok produk ${order.name} tidak mencukupi.`);
        }

        await update(productRef, { stock: newStock });
      }
    } catch (e) {
      console.log(e.message);
    }
  }

  static async getOrders(userId) {
    const dbRef = ref(getDatabase());
    try {
      const ordersSnapshot = await get(child(dbRef, `orders/${userId}`));
      return ordersSnapshot.val() || [];
    } catch (e) {
      console.log(e.message);
    }
  }

  static async getOrderById(userId, orderId) {
    const dbRef = ref(getDatabase());
    try {
      const orderSnapshot = await get(child(dbRef, `orders/${userId}/${orderId}`));
      return orderSnapshot.val();
    } catch (e) {
      console.log(e.message);
    }
  }

  static async getOrdersBySeller(sellerId) {
    const dbRef = ref(getDatabase());
    try {
      const ordersSnapshot = await get(child(dbRef, `orders/`));
      const orders = ordersSnapshot.val();
      const sellerOrders = {};

      for (const [userId, userOrders] of Object.entries(orders)) {
        for (const [orderId, orderData] of Object.entries(userOrders)) {
          if (orderData.items.some(item => item.uid === sellerId)) {
            if (!sellerOrders[userId]) {
              sellerOrders[userId] = {};
            }
            sellerOrders[userId][orderId] = orderData;
          }
        }
      }

      return sellerOrders;
    } catch (e) {
      console.log(e.message);
    }
  }
}

export default ProductData;
