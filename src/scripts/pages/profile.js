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
            <img id="profile-photo" src="./images/profile.png" alt="Profile Photo">
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
        <h2>My Products</h2>
        <div id="product-list"></div>
      </div>
    </article>

    <article class="order-article">
      <div class="order-container">
        <h2>Sold Products</h2>
        <div id="order-list"></div>
      </div>
    </article>

    <article class="pdf-article">
      <div class="pdf-container">
        <h2>PDF Reports</h2>
        <div id="pdf-list"></div>
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
    const profileImgInput = document.querySelector('#profileImgInput');

    // Logout
    logout.addEventListener('click', (event) => {
      event.preventDefault();
      UserInfo.deleteUserInfo();
      location.href = '#/';
    });

    // Upload profile image
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

    // Get user data
    try {
      const userData = await UserData.getUserData(UserInfo.getUserInfo().uid);
      console.log('User data:', userData);

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
      console.log('Error getting user data:', error.message);
    }

    // Save profile changes
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

      const imgFile = profileImgInput.files[0];
      const verificationFile = verificationPdf.files[0];

      try {
        console.log('Saving user data:', userData);
        await UserData.updateUserData(userData, UserInfo.getUserInfo().uid);
        
        if (imgFile) {
          console.log('Uploading profile photo:', imgFile);
          await UserData.updateUserProfilePhoto(imgFile, UserInfo.getUserInfo().uid);
        }
        
        if (verificationFile) {
          console.log('Submitting verification:', verificationFile);
          await VerificationData.submitVerification({ uid: UserInfo.getUserInfo().uid }, verificationFile);
        }

        alert('Successfully updated.');
      } catch (e) {
        console.log('Error saving changes:', e.message);
      }
    });

    const productUserList = document.querySelector('#product-list');
    const orderList = document.querySelector('#order-list');

    // Get user's products
    try {
      const products = await ProductData.getProduct();
      if (products) {
        console.log('Product data:', products);
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
          productText.innerText = 'You do not have any products.';
          productUserList.appendChild(productText);
        }
      } else {
        const productText = document.createElement('h4');
        productText.innerText = 'Products not found.';
        productUserList.appendChild(productText);
      }
    } catch (error) {
      console.log('Error getting products:', error.message);
    }

    // Get sold products
    try {
      const orders = await OrderData.getCompletedOrders(UserInfo.getUserInfo().uid);
      if (orders.length > 0) {
        orders.forEach(async (order) => {
          order.items.forEach(async (item) => {
            // Get product data for each item
            const product = await ProductData.getProductById(item.id);
            if (product) {
              const orderItem = document.createElement('div');
              orderItem.innerHTML = `
                <div class="order-card">
                  <img src="${product.image}" class="order-card-img-top" alt="${product.name}">
                  <div class="order-card-body">
                    <h5 class="order-card-title">${product.name}</h5>
                    <p class="order-card-text">Quantity: ${item.quantity}</p>
                    <p class="order-card-text">${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price * item.quantity)}</p>
                    <p class="order-card-text">Rating: ${item.rating || 'Not Rated'}</p>
                    <p class="order-card-text">Comment: ${item.comment || 'No Comment'}</p>
                    <p class="order-card-text">Payment Proof: <a href="${order.paymentProof}" target="_blank">View</a></p>
                  </div>
                </div>
              `;
              orderList.appendChild(orderItem);
            }
          });
        });
      } else {
        const noOrdersText = document.createElement('h4');
        noOrdersText.innerText = 'No sold products available.';
        orderList.appendChild(noOrdersText);
      }
    } catch (error) {
      console.log('Error getting orders:', error.message);
    }
  }
};

export default ProfilePage;
