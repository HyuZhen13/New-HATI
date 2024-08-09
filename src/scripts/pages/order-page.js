import CartData from '../utils/cart-data';
import OrderData from '../utils/order-data';
import UserData from '../utils/user-data';
import ProductData from '../utils/product-data';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, update } from 'firebase/database';

const OrderPage = {
  async render() {
    return `
      <section class="order-page">
        <h2>Daftar Pesanan</h2>
        <div id="unpaid-orders">
          <h3>Pesanan Belum Dibayar</h3>
          <div id="unpaid-orders-container"></div>
        </div>
        <div id="paid-orders">
          <h3>Pesanan Telah Dibayar</h3>
          <div id="paid-orders-container"></div>
        </div>
        <section id="payment-section">
          <h3>Upload Bukti Pembayaran</h3>
          <input type="file" id="payment-proof" />
          <button id="pay-btn" disabled>Bayar</button>
        </section>
      </section>
    `;
  },

  async afterRender() {
    const user = await UserData.getCurrentUser();
    const unpaidOrders = await OrderData.getUnpaidOrders(user.uid);
    const paidOrders = await OrderData.getPaidOrders(user.uid);
    const unpaidOrdersContainer = document.querySelector('#unpaid-orders-container');
    const paidOrdersContainer = document.querySelector('#paid-orders-container');
    const paymentProofInput = document.querySelector('#payment-proof');
    const payBtn = document.querySelector('#pay-btn');
    const storage = getStorage();
    const db = getDatabase();

    // Menampilkan pesanan belum dibayar
    Object.values(unpaidOrders).forEach(async (order) => {
      const product = await ProductData.getProductById(order.id);

      const orderElement = document.createElement('div');
      orderElement.classList.add('order-item');
      orderElement.innerHTML = `
        <img src="${order.image}" alt="${order.name}">
        <div>
          <h4>Produk: ${order.name}</h4>
          <p>Penjual: ${order.seller}</p>
          <p>Telepon: ${order.phone}</p>
          <p>Total Harga: ${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.price * order.quantity)}</p>
          ${order.paymentProof ? `<img src="${order.paymentProof}" alt="Bukti Pembayaran" style="width: 100px; height: auto;">` : `<p>Bukti Pembayaran: Belum diunggah</p>`}
        </div>
      `;

      unpaidOrdersContainer.appendChild(orderElement);
    });

    // Menampilkan pesanan telah dibayar
    Object.values(paidOrders).forEach(async (order) => {
      const product = await ProductData.getProductById(order.id);

      const orderElement = document.createElement('div');
      orderElement.classList.add('order-item');
      orderElement.innerHTML = `
        <img src="${order.image}" alt="${order.name}">
        <div>
          <h4>Produk: ${order.name}</h4>
          <p>Penjual: ${order.seller}</p>
          <p>Telepon: ${order.phone}</p>
          <p>Total Harga: ${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.price * order.quantity)}</p>
          ${order.paymentProof ? `<img src="${order.paymentProof}" alt="Bukti Pembayaran" style="width: 100px; height: auto;">` : `<p>Bukti Pembayaran: Belum diunggah</p>`}
        </div>
      `;

      paidOrdersContainer.appendChild(orderElement);
    });

    // Menangani upload bukti pembayaran
    paymentProofInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (file) {
        const storagePath = `payment-proofs/${user.uid}/${file.name}`;
        const storageReference = storageRef(storage, storagePath);

        try {
          await uploadBytes(storageReference, file);
          const paymentProofURL = await getDownloadURL(storageReference);
          payBtn.disabled = false;
          payBtn.dataset.paymentProofUrl = paymentProofURL; // Simpan URL bukti pembayaran pada data atribut tombol
        } catch (error) {
          console.error('Error uploading payment proof:', error);
          alert('Gagal mengunggah bukti pembayaran. Silakan coba lagi.');
        }
      }
    });

    // Menangani klik tombol bayar
    payBtn.addEventListener('click', async () => {
      const paymentProofURL = payBtn.dataset.paymentProofUrl;
      if (paymentProofURL) {
        Object.keys(unpaidOrders).forEach(async (orderId) => {
          await OrderData.markAsPaid(user.uid, orderId);
          const orderRef = dbRef(db, `orders/unpaid/${user.uid}/${orderId}`);
          await update(orderRef, { paymentProof: paymentProofURL });
        });
        alert('Pembayaran berhasil! Pesanan telah dipindahkan ke status dibayar.');
        window.location.reload(); // Reload halaman untuk memperbarui tampilan pesanan
      } else {
        alert('Silakan unggah bukti pembayaran terlebih dahulu.');
      }
    });
  },
};

export default OrderPage;
