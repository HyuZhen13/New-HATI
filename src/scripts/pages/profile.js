/* eslint-disable max-len */
import ProductData from '../utils/product-data';
import UserData from '../utils/user-data';
import UserInfo from '../utils/user-info';
import VerificationData from '../utils/verification-data';

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
          <input type="file" name="profileImage" id="profileImgInput"style="display:none;">
          <label id="verificationLabel">Submit Verification (PDF only)</label>
          <input type="file" name="storeVerification" id="storeVerification" accept="application/pdf">
          <button type="submit" >Save Changes</button>
          <button id="logout-btn">Logout</button>
      </form>
    </div>
  </article>

  <article class="product-article">
    
    <div class="product-container">
    <a id="addProduct" href="#/add-product" >Add Product +</a>
    <h2>My Product</h2>
      <div id="product-list">
        
      </div>
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
      const file = await profileImgInput.files[0];
      const reader = new FileReader();
      reader.onload = async () => {
        profileImg.src = reader.result;
      };
      if (file) reader.readAsDataURL(file);
    }, false);

    try {
      const userData = await UserData.getUserData(UserInfo.getUserInfo().uid);
      console.log(userData.isVerified);
      userName.setAttribute('value', userData.name);
      if (userData.phone) userPhone.setAttribute('value', userData.phone);
      if (userData.socmed) userSocmed.setAttribute('value', userData.socmed);
      if (userData.desc) userDesc.innerText = userData.desc;
      if (userData.photo) profileImg.setAttribute('src', userData.photo);
      if (userData.isVerified === 'pending') {
        verificationPdf.setAttribute('type', 'hidden');
        verificationLabel.innerText = 'Verification Pending';
      }
      if (userData.isVerified === 'verified') {
        verificationPdf.setAttribute('type', 'hidden');
        verificationLabel.innerText = 'You Are Verified!';
      }
    } catch (error) {
      console.log(error.message);
    }

    profileForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const userData = {
        name: '', phone: '', socmed: '', desc: '', seller: '', email: UserInfo.getUserInfo().email, uid: UserInfo.getUserInfo().uid,
      };
      const verification = {
        uid: UserInfo.getUserInfo().uid,
      };

      userData.name = document.forms.profileForm.userName.value;
      userData.phone = document.forms.profileForm.userPhone.value;
      userData.socmed = document.forms.profileForm.userSocmed.value;
      userData.desc = document.forms.profileForm.userDesc.value;
      const imgFile = document.querySelector('#profileImgInput').files[0];

      try {
        UserData.updateUserData(userData, UserInfo.getUserInfo().uid);
        if (imgFile) UserData.updateUserProfilePhoto(imgFile, UserInfo.getUserInfo().uid);
        if (verificationPdf) VerificationData.submitVerification(verification, verificationPdf.files[0]);
      } catch (e) {
        console.log(e.message);
      } finally {
        this.render();
        // eslint-disable-next-line no-alert
        alert('Succesfully Updated.');
      }
    });

    const productUserList = document.querySelector('#product-list');

    const product = await ProductData.getProduct();
    if (product) {
      Object.values(product).reverse().forEach((item) => {
        const productItem = document.createElement('div');
        productItem.innerHTML = `
            <div class="card">
              <img src="${item.image}" class="card-img-top" alt="...">
              <div class="card-body">
              <p class="card-text">${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}</p>
              <h5 class="card-title">${item.name}</h5>
              </div>
              <div class="card-footer">
              <small class="text-muted">${item.seller} <i class="fa-solid fa-circle-check fa-lg"></i></small>
            </div>
          `;
        productItem.setAttribute('class', 'product-item');
        productItem.addEventListener('click', (event) => {
          event.preventDefault();
          location.href = `#/edit-product/${item.id}`;
        });
        if (item.uid === UserInfo.getUserInfo().uid) {
          productUserList.appendChild(productItem);
        }
      });
      if (productUserList.childElementCount === 0) {
        const productText = document.createElement('h4');
        productText.innerText = 'You have no product.';
        productUserList.appendChild(productText);
      }
    } else {
      const productText = document.createElement('h4');
      productText.innerText = 'Product does not exist.';
      productUserList.appendChild(productText);
    }
  },
};
export default ProfilePage;
