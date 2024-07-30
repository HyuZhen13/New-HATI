import UserData from '../utils/user-data';
import UserInfo from '../utils/user-info';
import VerificationData from '../utils/verification-data';
import ProductData from '../utils/product-data'; // Pastikan ProductData diimpor

const ProfilePage = {
  async render() {
    return `
    <article class="profile-article">
      <h2>Profile</h2>
      <form id="profile-form">
        <input type="file" id="profileImgInput" style="display: none;" />
        <img id="profile-photo" src="" alt="Profile Photo" />
        <label for="userName">Name</label>
        <input type="text" id="userName" name="userName" />
        <label for="userPhone">Phone</label>
        <input type="text" id="userPhone" name="userPhone" />
        <label for="userSocmed">Social Media</label>
        <input type="text" id="userSocmed" name="userSocmed" />
        <label for="userDesc">Description</label>
        <textarea id="userDesc" name="userDesc"></textarea>
        <button type="submit">Update Profile</button>
        <button id="logout-btn">Logout</button>
        <input type="file" id="storeVerification" />
        <label id="verificationLabel"></label>
      </form>
    </article>
    <article class="product-article">
      <div class="product-container">
        <a id="addProduct" href="#/add-product">Add Product +</a>
        <h2>My Products</h2>
        <div id="product-list"></div>
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

    logout.addEventListener('click', (event) => {
      event.preventDefault();
      UserInfo.deleteUserInfo();
      location.href = '#/';
      location.reload();
    });

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

    try {
      const userData = await UserData.getUserData(UserInfo.getUserInfo().uid);
      console.log(userData.isVerified);
      userName.value = userData.name || '';
      userPhone.value = userData.phone || '';
      userSocmed.value = userData.socmed || '';
      userDesc.innerText = userData.desc || '';
      profileImg.src = userData.photo || '';
      
      if (userData.isVerified === 'pending') {
        verificationPdf.style.display = 'none';
        verificationLabel.innerText = 'Verification Pending';
      } else if (userData.isVerified === 'verified') {
        verificationPdf.style.display = 'none';
        verificationLabel.innerText = 'You Are Verified!';
      }
    } catch (error) {
      console.log('Error fetching user data:', error.message);
    }

    profileForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const userData = {
        name: userName.value,
        phone: userPhone.value,
        socmed: userSocmed.value,
        desc: userDesc.value,
        seller: '',
        email: UserInfo.getUserInfo().email,
        uid: UserInfo.getUserInfo().uid,
      };
      const verification = {
        uid: UserInfo.getUserInfo().uid,
      };
      const imgFile = profileImgInput.files[0];

      try {
        await UserData.updateUserData(userData, UserInfo.getUserInfo().uid);
        if (imgFile) await UserData.updateUserProfilePhoto(imgFile, UserInfo.getUserInfo().uid);
        if (verificationPdf.files[0]) await VerificationData.submitVerification(verification, verificationPdf.files[0]);
      } catch (e) {
        console.log('Error updating user data:', e.message);
      } finally {
        this.render();
        // eslint-disable-next-line no-alert
        alert('Successfully Updated.');
      }
    });

    const productUserList = document.querySelector('#product-list');
    try {
      const products = await ProductData.getProduct();
      if (products) {
        Object.values(products).reverse().forEach((item) => {
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
            productItem.classList.add('product-item');
            productItem.addEventListener('click', () => {
              location.href = `#/edit-product/${item.id}`;
            });
            productUserList.appendChild(productItem);
          }
        });
        if (productUserList.childElementCount === 0) {
          const productText = document.createElement('h4');
          productText.innerText = 'You have no products.';
          productUserList.appendChild(productText);
        }
      } else {
        const productText = document.createElement('h4');
        productText.innerText = 'Products do not exist.';
        productUserList.appendChild(productText);
      }
    } catch (error) {
      console.log('Error fetching products:', error.message);
      const productText = document.createElement('h4');
      productText.innerText = 'Error fetching products.';
      productUserList.appendChild(productText);
    }
  },
};

export default ProfilePage;
