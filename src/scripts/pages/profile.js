const ProfilePage = {
  async render() {
    return `
    <style>
      .profile-article, .product-article, .order-article {
        margin-bottom: 20px;
      }
      .profile-container, .product-container, .order-container {
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        background: #fff;
      }
      .profile-container img {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        object-fit: cover;
        cursor: pointer;
        margin-bottom: 20px;
      }
      .profile-container input, .profile-container textarea {
        width: 100%;
        padding: 10px;
        margin: 10px 0;
        border-radius: 5px;
        border: 1px solid #ddd;
      }
      .profile-container button {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        background: #007bff;
        color: #fff;
        cursor: pointer;
      }
      .product-container, .order-container {
        margin-top: 20px;
      }
      .product-item, .order-item {
        display: flex;
        flex-direction: column;
        border: 1px solid #ddd;
        border-radius: 10px;
        overflow: hidden;
        margin-bottom: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      .product-item img, .order-item img {
        width: 100%;
        height: auto;
      }
      .product-item .card-body, .order-item .order-body {
        padding: 15px;
        background: #f9f9f9;
      }
      .product-item .card-footer, .order-item .order-footer {
        padding: 10px 15px;
        background: #007bff;
        color: #fff;
      }
      .product-item .card-footer small, .order-item .order-footer small {
        font-size: 0.9em;
      }
      .order-item .order-body h5, .order-item .order-body p {
        margin: 5px 0;
      }
    </style>
    
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
      const userProducts = [];
      if (products) {
        console.log('Product data:', products);
        Object.values(products).reverse().forEach((item) => {
          if (item.uid === UserInfo.getUserInfo().uid) {
            userProducts.push(item);
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
        productText.innerText = 'You do not have any products.';
        productUserList.appendChild(productText);
      }
    } catch (error) {
      console.log('Error getting product data:', error.message);
    }

    // Get sold products
    try {
      const orders = await OrderData.getOrders(UserInfo.getUserInfo().uid);
      if (orders && orders.length > 0) {
        console.log('Orders data:', orders);
        orders.forEach((order) => {
          order.items.forEach((item) => {
            const orderItem = document.createElement('div');
            orderItem.innerHTML = `
              <div class="order-item">
                <img src="${item.image}" class="order-img-top" alt="${item.name}">
                <div class="order-body">
                  <h5 class="order-title">${item.name}</h5>
                  <p class="order-text">${Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}</p>
                  <p class="order-quantity">Quantity: ${item.quantity}</p>
                </div>
                <div class="order-footer">
                  <small class="text-muted">Buyer: ${order.buyerName}</small>
                </div>
              </div>
            `;
            orderList.appendChild(orderItem);
          });
        });
      } else {
        const orderText = document.createElement('h4');
        orderText.innerText = 'No products sold.';
        orderList.appendChild(orderText);
      }
    } catch (error) {
      console.log('Error getting orders:', error.message);
    }
  },
};

export default ProfilePage;
