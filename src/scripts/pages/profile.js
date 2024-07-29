/* eslint-disable max-len */
import ProductData from '../utils/product-data';
import UserData from '../utils/user-data';
import UserInfo from '../utils/user-info';
import VerificationData from '../utils/verification-data';
import OrderData from '../utils/order-data';

const ProfilePage = {
  async render() {
    return `
    <article class="profile-article"> 
    <div class="profile-container">
    <form name="profileForm" id="profile-form" method="POST" enctype="multipart/form-data">
          <div>
            <img id="profile-photo" src="./images/profile.png">
          </div>
          <input placeholder="Store Name" name="userName" id="userName">
          <input placeholder="Phone Number" name="userPhone" id="userPhone">
          <input placeholder="Social Media (Link)" name="userSocmed" id="userSocmed">
          <textarea placeholder="Description" name="userDesc" id="userDesc"></textarea>
          <input type="file" name="profileImage" id="profileImgInput" style="display:none;">
          <label id="verificationLabel">Submit Verification (PDF only)</label>
          <input type="file" name="storeVerification" id="storeVerification" accept="application/pdf">
          <button type="submit">Save Changes</button>
          <button id="logout-btn">Logout</button>
      </form>
    </div>
  </article>

  <article class="product-article">
    <div class="product-container">
      <a id="addProduct" href="#/add-product">Add Product +</a>
      <h2>My Product</h2>
      <div id="product-list"></div>
    </div>
  </article>

  <article class="order-article">
    <div class="order-container">
      <h2>Sold Products</h2>
      <div id="order-list"></div>
    </div>
  </article>
    `;
  },
  async afterRender() {
    const profileImg = document.querySelector('#profile-photo');
    const profileForm = document.querySelector('#profile-form');
    const logout = document.querySelector('#logout-btn');
    const userName = document.querySelector('#userName');
    const userPhone = document.querySelector('#userPhone');
    const userSocmed = document.querySelector('#userSocmed');
    const userDesc = document.querySelector('#userDesc');
    const verificationPdf = document.querySelector('#storeVerification');
    const verificationLabel = document.querySelector('#verificationLabel');

    // Logout
    logout.addEventListener('click', (event) => {
      event.preventDefault();
      UserInfo.deleteUserInfo();
      location.href = '#/';
      location.reload();
    });

    // Unggah gambar profil
    const profileImgInput = document.querySelector('#profileImgInput');
    profileImg.addEventListener('click', () => {
      profileImgInput.click();
    });
    profileImgInput.addEventListener('change', async () => {
      const file = profileImgInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          profileImg.src = reader.result;
        };
        reader.readAsDataURL(file);
      }
    });

    // Mendapatkan data pengguna
    try {
      const userData = await UserData.getUserData(UserInfo.getUserInfo().uid);
      console.log('Data pengguna:', userData);

      userName.value = userData.name || '';
      userPhone.value = userData.phone || '';
      userSocmed.value = userData.socmed || '';
      userDesc.value = userData.desc || '';
      profileImg.src = userData.photo || './images/profile.png';

      if (userData.isVerified === 'pending') {
        verificationPdf.style.display = 'none';
        verificationLabel.innerText = 'Verification Pending';
      } else if (userData.isVerified === 'verified') {
        verificationPdf.style.display = 'none';
        verificationLabel.innerText = 'You Are Verified!';
      }
    } catch (error) {
      console.log('Error mendapatkan data pengguna:', error.message);
    }

    // Menyimpan perubahan profil
    profileForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const userData = {
        name: userName.value,
        phone: userPhone.value,
        socmed: userSocmed.value,
        desc: userDesc.value,
        email: UserInfo.getUserInfo().email,
        uid: UserInfo.getUserInfo().uid,
      };
      const verification = {
        uid: UserInfo.getUserInfo().uid,
      };

      const imgFile = document.querySelector('#profileImgInput').files[0];

      try {
        console.log('Menyimpan data pengguna:', userData);
        await UserData.updateUserData(userData, UserInfo.getUserInfo().uid);
        if (imgFile) {
          console.log('Mengunggah foto profil:', imgFile);
          await UserData.updateUserProfilePhoto(imgFile, UserInfo.getUserInfo().uid);
        }
        if (verificationPdf.files[0]) {
          console.log('Mengirim verifikasi:', verificationPdf.files[0]);
          await VerificationData.submitVerification(verification, verificationPdf.files[0]);
        }
        alert('Berhasil diperbarui.');
      } catch (e) {
        console.log('Error saat menyimpan perubahan:', e.message);
      } finally {
        this.render();
      }
    });

    const productUserList = document.querySelector('#product-list');

    // Mendapatkan produk pengguna
    try {
      const product = await ProductData.getProduct();
      if (product) {
        console.log('Data produk:', product);
        Object.values(product).reverse().forEach((item) => {
          if (item.uid === UserInfo.getUserInfo().uid) {
            const productItem = document.createElement('div');
            productItem.innerHTML = `
              <div class="card">
                <img src="${item.image}" class="card-img-top" alt="${item.name}">
                <div class="card-body">
                  <p class="card-text">${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}</p>
                  <h5 class="card-title">${item.name}</h5>
                </div>
                <div class="card-footer">
                  <small class="text-muted">${item.seller} <i class="fa-solid fa-circle-check fa-lg"></i></small>
                </div>
              </div>
            `;
            productItem.setAttribute('class', 'product-item');
            productItem.addEventListener('click', (event) => {
              event.preventDefault();
              location.href = `#/edit-product/${item.id}`;
            });
            productUserList.appendChild(productItem);
          }
        });
        if (productUserList.childElementCount === 0) {
          const productText = document.createElement('h4');
          productText.innerText = 'Anda belum memiliki produk.';
          productUserList.appendChild(productText);
        }
      } else {
        const productText = document.createElement('h4');
        productText.innerText = 'Produk tidak ditemukan.';
        productUserList.appendChild(productText);
      }
    } catch (error) {
      console.log('Error mendapatkan produk:', error.message);
    }

    const orderList = document.querySelector('#order-list');

    // Mendapatkan produk terjual dan ulasan
    try {
      const orders = await OrderData.getCompletedOrders(UserInfo.getUserInfo().uid);
      if (orders) {
        console.log('Data pesanan:', orders);
        Object.values(orders).reverse().forEach((order) => {
          order.items.forEach((item) => {
            if (item.sellerId === UserInfo.getUserInfo().uid) {
              const orderItem = document.createElement('div');
              orderItem.innerHTML = `
                <div class="order-card">
                  <img src="${item.image}" class="order-card-img" alt="${item.name}">
                  <div class="order-card-body">
                    <h5 class="order-card-title">${item.name}</h5>
                    <p class="order-card-text">${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}</p>
                    <p class="order-card-rating">Rating: ${item.rating || 'Belum diberi rating'}</p>
                    <p class="order-card-comment">Komentar: ${item.comment || 'Belum ada komentar'}</p>
                  </div>
                </div>
              `;
              orderItem.setAttribute('class', 'order-item');
              orderList.appendChild(orderItem);
            }
          });
        });
        if (orderList.childElementCount === 0) {
          const orderText = document.createElement('h4');
          orderText.innerText = 'Belum ada produk terjual.';
          orderList.appendChild(orderText);
        }
      } else {
        const orderText = document.createElement('h4');
        orderText.innerText = 'Pesanan tidak ditemukan.';
        orderList.appendChild(orderText);
      }
    } catch (error) {
      console.log('Error mendapatkan pesanan:', error.message);
    }
  },
};

export default ProfilePage;
