/* eslint-disable consistent-return */
import {
  get, getDatabase, ref, set, child,
} from 'firebase/database';
import {
  getStorage, uploadBytes, ref as refs, getDownloadURL,
} from 'firebase/storage';

class ProductData {
  static async addProduct(product, image) {
    const db = getDatabase();
    const storage = getStorage();
    const id = Date.now();
    const storageRef = refs(storage, `users/${product.uid}/products/${product.name}`);

    try {
      uploadBytes(storageRef, image).then(() => {
        getDownloadURL(refs(storageRef)).then((url) => {
          set(ref(db, `products/${id}-${product.uid}`), {
            id: `${id}-${product.uid}`,
            uid: product.uid,
            name: product.name,
            price: product.price,
            desc: product.desc,
            seller: product.seller,
            image: url,
          }).then(() => {
            location.href = '#/profile';
            location.reload();
          });
        });
      });
    } catch (e) {
      console.log(e.message);
    }
  }

  static async getProduct() {
    const dbRef = ref(getDatabase());

    try {
      const product = await get(child(dbRef, 'products/'));
      return await product.val();
    } catch (e) {
      console.log(e.message);
    }
  }
}
export default ProductData;
