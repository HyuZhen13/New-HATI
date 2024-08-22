/* eslint-disable no-inner-declarations */
/* eslint-disable consistent-return */
import NewsData from '../utils/news-data';
import ProductData from '../utils/product-data';
import UserData from '../utils/user-data';
import UserInfo from '../utils/user-info';
import VerificationData from '../utils/verification-data';

const AdminPage = {
  async render() {
    const user = await UserData.getUserData(UserInfo.getUserInfo().uid);

    if (user.isAdmin) {
      /* html */
      return `
      <style>
      .admin-page {
          display: flex;
          min-width: 100%;
          min-height: 1000px;
          padding: 15px;
        }

        .navbar-admin {
          width: 250px;
          background-color: #eaeaea;
          padding: 20px;
        }

        .admin-title {
          font-family: "Inter", sans-serif;
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .menu-list {
          list-style-type: none;
          margin: 0;
          padding: 0;
        }

        .menu-item {
          font-family: "Inter", sans-serif;
          font-size: 18px;
          font-weight: 500;
          padding: 10px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .menu-item:hover,
        .menu-item.active {
          background-color: #dddddd;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
        }

        .content {
          flex: 1;
          margin: 0 20px 0 20px;
          padding: 50px;
          background-color: #eaeaea;
          position: relative;
        }

        .content-title,
        #content-container h2 {
          font-family: "Inter", sans-serif;
          font-size: 44px;
          font-weight: 100;
          margin-bottom: 15px;
          text-align: center;
          letter-spacing: 5px;
        }

        .product-list {
          margin-top: 15px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-gap: 15px;
        }

        .verification-list{
          margin-top: 15px;
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          grid-gap: 15px;
        }

        .store-name{
          margin: 0;
        }
        #verifyStore{
          padding: 10px;
        }
        .verification-item {
          background-color: #ffffff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .product-item {
          background-color: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .product-image {
          width: 250px;
          margin-right: 10px;
          background-color: #cccccc;
        }

        .product-actions {
          display: flex;
          align-items: center;
        }

        .product-actions button {
          margin-left: 10px;
          background-color: transparent;
          border: none;
          cursor: pointer;
        }

        .product-actions button.edit {
          color: #00aaff;
          text-decoration: none;
          cursor: pointer;
        }

        .product-actions button.delete {
          color: #ff0000;
        }

        .menu-icon {
          display: none;
          width: 30px;
          height: 30px;
          background-color: #1B9C85;
          position: absolute;
          top: 115px;
          left: 51px;
          border-radius: 4px;
          cursor: pointer;
        }

        .menu-icon span {
          display: block;
          width: 100%;
          height: 4px;
          background-color: #ffffff;
          border-radius: 4px;
          transition: background-color 0.3s ease;
        }

        .menu-icon span + span {
          margin-top: 6px;
        }

        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .loading-icon {
          font-size: 48px;
          color: #ffffff;
        }

        #add-news{
          width: 100%;
          font-size: 25pt;
        }
        #addNewsForm div img{
          border-radius: 15px;
          height: 200px;
          cursor: pointer;
          object-fit: cover;
          border: 2px solid #1B9C85;
        }
        #addNewsForm{
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        
        }
        #addNewsForm input{
          border-radius: 10px;
          padding: 10px;
          width: 100%;
        }
        
        #addNewsForm textarea{
          border-radius: 10px;
          padding: 10px;
          width: 100%;
        }
        
        #addNewsForm button{
          border-radius: 27px;
          padding: 10px;
          border-style: none;
          border: 2px solid #1B9C85;
          background-color: #1B9C85;
          width: 40%;
          color: white;
          transition: 0.3s;
        }
        #addNewsForm button:hover{
          border-style: none;
          background-color: white;
          border: 2px solid #1B9C85;
          width: 40%;
          color: #1B9C85;
        }

        #editNewsForm div img{
          border-radius: 15px;
          height: 200px;
          cursor: pointer;
          object-fit: cover;
          border: 2px solid #1B9C85;
        }
        #editNewsForm{
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        
        }
        #editNewsForm input{
          border-radius: 10px;
          padding: 10px;
          width: 100%;
        }
        
        #editNewsForm textarea{
          border-radius: 10px;
          padding: 10px;
          width: 100%;
        }
        
        #editNewsForm button{
          border-radius: 27px;
          padding: 10px;
          border-style: none;
          border: 2px solid #1B9C85;
          background-color: #1B9C85;
          width: 40%;
          color: white;
          transition: 0.3s;
        }

        #editNewsForm button:hover{
          border-style: none;
          background-color: white;
          border: 2px solid #1B9C85;
          width: 40%;
          color: #1B9C85;
        }

        @media (max-width: 1245px) {
          main {
            display: block;
            width: fit-content;
          }
          
          .admin-page {
            display: block;
          }

          hati-nav,
          hati-footer {
            width: 100%;
          }

          .navbar-admin {
            width: 100%;
            margin-bottom: 10px;
          }
        }
        
        @media (max-width: 550px) {
          body, html {
            width: fit-content;
          }

          hati-nav,
          hati-footer {
            width: 100%;
          }

          main {
            display: block;
            transition: all 0.3s;
          }

          .admin-page {
            display: block;
          }

          .navbar-admin {
            width: 100%;
            margin-bottom: 10px;
          }
        
        }

        
      </style>
      <div class="admin-page">
        <div class="navbar-admin">
          <div class="admin-title">Admin Panel</div>
          <ul class="menu-list">
            <li class="menu-item" id="menuBerita">Berita</li>
            <li class="menu-item" id="menuVerifikasi">Verifikasi</li>
            <li class="menu-item" id="menuToko">Toko</li>
            <li class="menu-item" id="menuProduk">Produk</li>
          </ul>
        </div>
        <div class="content">
          <h2 class="content-title">Halaman Admin</h2>
          <div id="content-container">
            <div class="product-list" id="product-list-admin">
                <div class="product-item">
                  <p class="product-name">Berita</p>
                  <p id="berita-count" style="font-size: 50pt;">0</p>
                </div>
                <div class="product-item">
                  <p class="product-name">Verifikasi</p>
                  <p id="verifikasi-count" style="font-size: 50pt;">0</p>
                </div>
                <div class="product-item">
                  <p class="product-name">Toko</p>
                  <p id="toko-count" style="font-size: 50pt;">0</p>
                </div>
                <div class="product-item">
                  <p class="product-name">Produk</p>
                  <p id="produk-count" style="font-size: 50pt;">0</p>
                </div>
            </div>
          </div>
          <div class="loading-container" id="loading-container">
            <i class="loading-icon fas fa-spinner fa-spin"></i>
          </div>
        </div>
      </div>
    `;
    }
    // eslint-disable-next-line no-alert
    alert('403 : Unauthorized');
    location.href = '#/';

    /* html */
  },
  async afterRender() {
    const user = await UserData.getUserData(UserInfo.getUserInfo().uid);

    if (user.isAdmin) {
      NewsData.getNews().then((news) => {
        if (news) {
          document.querySelector('#berita-count').innerText = Object.keys(news).length;
        } else {
          document.querySelector('#berita-count').innerText = 0;
        }
      });

      VerificationData.getAllVerification().then((verification) => {
        if (verification) {
          document.querySelector('#verifikasi-count').innerText = Object.keys(verification).length;
        } else {
          document.querySelector('#verifikasi-count').innerText = 0;
        }
      });

      UserData.getAllUsers().then((users) => {
        if (users) {
          document.querySelector('#toko-count').innerText = Object.keys(users).length;
        } else {
          document.querySelector('#toko-count').innerText = 0;
        }
      });

      ProductData.getProduct().then((product) => {
        if (product) {
          document.querySelector('#produk-count').innerText = Object.keys(product).length;
        } else {
          document.querySelector('#produk-count').innerText = 0;
        }
      });

      const contentContainer = document.getElementById('content-container');
      const loadingContainer = document.getElementById('loading-container');

      function showLoadingIcon() {
        loadingContainer.style.display = 'flex';
      }

      function hideLoadingIcon() {
        loadingContainer.style.display = 'none';
      }

      // eslint-disable-next-line no-undef
      menuBerita.addEventListener('click', () => {
        showLoadingIcon();
        setTimeout(async () => {
          // Menghapus elemen HTML di luar elemen inner
          const parentElement = contentContainer.parentNode;
          while (parentElement.firstChild !== contentContainer) {
            parentElement.removeChild(parentElement.firstChild);
          }
          contentContainer.innerHTML = `
          <h2>Berita</h2>
          <button id="add-news">Tambah Berita +</button>
          <div class="product-list" id="product-list-admin">
            
          </div>
        `;
          const store = await NewsData.getNews();
          const productList = document.querySelector('#product-list-admin');
          if (store) {
            Object.values(store).reverse().forEach((item) => {
              const productItem = document.createElement('div');
              productItem.innerHTML = `
            <div class="product-item">
              <img class="product-image" src="${item.image}">
              <p class="product-name">${item.title}</p>
              <div class="product-actions">
                <button class="edit" style="text-decoration: none; cursor: pointer;" id="edit-${item.id}">Edit</button>
                <button class="delete" id="remove-${item.id}">Delete</button>
              </div>
            </div>
            `;
              productList.appendChild(productItem);
              document.querySelector(`#remove-${item.id}`).addEventListener('click', (event) => {
                event.preventDefault();
                if (item.id) {
                  NewsData.deleteNews(item.id).then(() => {
                    document.querySelector('#menuBerita').click();
                  });
                }
              });
              document.querySelector(`#edit-${item.id}`).addEventListener('click', (event) => {
                event.preventDefault();
                contentContainer.innerHTML = `
              <h2>Edit Berita</h2>
              <form name="editNewsForm" id="editNewsForm" method="POST" enctype="multipart/form-data">
                <div>
                <img id="news-photo" src="${item.image}">
                </div>
                <p>Click to edit news image. </p>
                <input placeholder="Judul Berita" name="newsTitle" value="${item.title}" required>
                <textarea placeholder="Isi Berita" name="newsBody" id="newsBody" required>${item.body}</textarea>
                <input type="file" name="newsPhotoInput" id="newsPhotoInput"style="display:none;">
                <button type="submit">Update Berita</button>
              </form>
              <div class="verification-list" id="verification-list">
            
              </div>
            `;
                const verificationList = document.querySelector('#verification-list');
                const newsImg = document.querySelector('#news-photo');
                const newsPhotoInput = document.querySelector('#newsPhotoInput');
                if (item.comments) {
                  Object.values(item.comments).reverse().forEach((comment) => {
                    const verificationItem = document.createElement('div');
                    verificationItem.innerHTML = `
                    <div class="verification-item">
                      <div>
                        <p class="store-name">${comment.name}</p>
                        <p class="store-name">${comment.comment}</p>
                      </div>
                      <div class="product-actions">
                        <button class="delete" id="delete-${comment.id}" >Delete</button>
                      </div>
                    </div>
                    `;
                    verificationList.appendChild(verificationItem);
                    document.querySelector(`#delete-${comment.id}`).addEventListener('click', (e) => {
                      e.preventDefault();
                      console.log(item.id, comment.id);
                      if (item.id) {
                        NewsData.deleteComment(item.id, comment.id).then(() => {
                          document.querySelector('#menuBerita').click();
                        });
                      }
                    });
                  });
                }
                newsImg.addEventListener('click', () => {
                  newsPhotoInput.click();
                });
                newsPhotoInput.addEventListener('change', async () => {
                  const file = await newsPhotoInput.files[0];
                  const reader = new FileReader();
                  reader.onload = async () => {
                    newsImg.src = reader.result;
                  };
                  if (file) reader.readAsDataURL(file);
                }, false);

                const news = {
                  id: item.id,
                  title: '',
                  body: '',
                };

                const editNewsForm = document.querySelector('#editNewsForm');
                editNewsForm.addEventListener('submit', (e) => {
                  e.preventDefault();
                  news.title = document.forms.editNewsForm.newsTitle.value;
                  news.body = document.forms.editNewsForm.newsBody.value;
                  const image = newsPhotoInput.files[0];

                  try {
                    NewsData.updateNews(news, image);
                  } catch (error) {
                    console.log(error.message);
                  } finally {
                    // eslint-disable-next-line no-alert
                    alert('Succesfully Updated News.');
                    document.querySelector('#menuBerita').click();
                  }
                });
              });
            });
          }
          document.querySelector('#add-news').addEventListener('click', () => {
            contentContainer.innerHTML = `
              <h2>Tambah Berita</h2>
              <form name="addNewsForm" id="addNewsForm" method="POST" enctype="multipart/form-data">
                <div>
                <img id="news-photo" src="./images/placeholder.webp">
                </div>
                <p>Click to add news image. </p>
                <input placeholder="Judul Berita" name="newsTitle" required>
                <textarea placeholder="Isi Berita" name="newsBody" id="newsBody" required></textarea>
                <input type="file" name="newsPhotoInput" id="newsPhotoInput"style="display:none;" required>
                <button type="submit">Tambah Berita</button>
              </form>
            `;

            const newsImg = document.querySelector('#news-photo');
            const newsPhotoInput = document.querySelector('#newsPhotoInput');
            newsImg.addEventListener('click', () => {
              newsPhotoInput.click();
            });
            newsPhotoInput.addEventListener('change', async () => {
              const file = await newsPhotoInput.files[0];
              const reader = new FileReader();
              reader.onload = async () => {
                newsImg.src = reader.result;
              };
              if (file) reader.readAsDataURL(file);
            }, false);
            const news = {
              title: '',
              body: '',
            };
            const addNewsForm = document.querySelector('#addNewsForm');
            addNewsForm.addEventListener('submit', (event) => {
              event.preventDefault();
              news.title = document.forms.addNewsForm.newsTitle.value;
              news.body = document.forms.addNewsForm.newsBody.value;
              const image = newsPhotoInput.files[0];

              try {
                NewsData.addNews(news, image);
              } catch (e) {
                console.log(e.message);
              } finally {
                // eslint-disable-next-line no-alert
                alert('Succesfully Uploaded News.');
                document.querySelector('#menuBerita').click();
              }
            });
          });
          hideLoadingIcon();
        }, 1000);
      });

      // eslint-disable-next-line no-undef
      menuVerifikasi.addEventListener('click', () => {
        showLoadingIcon();
        setTimeout(async () => {
          // Menghapus elemen HTML di luar elemen inner
          const parentElement = contentContainer.parentNode;
          while (parentElement.firstChild !== contentContainer) {
            parentElement.removeChild(parentElement.firstChild);
          }
          contentContainer.innerHTML = `
          <h2>Verifikasi</h2>
          <div class="verification-list" id="verification-list">
            
          </div>
        `;
          const verification = await VerificationData.getAllVerification();
          const verificationList = document.querySelector('#verification-list');
          if (verification) {
            Object.values(verification).reverse().forEach((item) => {
              UserData.getUserData(item.uid).then((userData) => {
                const verificationItem = document.createElement('div');
                verificationItem.innerHTML = `
              <div class="verification-item">
                <p class="store-name">${userData.name}</p>
                <div class="product-actions">
                  <a href="${item.doc}">Download Document</a>
                  <button class="edit" style="text-decoration: none; cursor: pointer;" id="view-${item.id}">View Store</button>
                  <form name="verifyStore" id="verifyStore" method="POST" enctype="multipart/form-data">
                      <select name="verifyStatus">
                        <option value="rejected">Tolak Verifikasi</option>
                        <option value="verified">Terima Verifikasi</option>
                      </select>
                      <button type="submit">Confirm</button>
                  </form>
                </div>
              </div>
              `;
                verificationList.appendChild(verificationItem);
                document.querySelector(`#view-${item.id}`).addEventListener('click', (event) => {
                  event.preventDefault();
                  if (item.id) {
                    location.href = `#/store/${userData.uid}`;
                  }
                });
                const verifyStore = document.querySelector('#verifyStore');
                verifyStore.addEventListener('submit', (e) => {
                  e.preventDefault();
                  const status = document.forms.verifyStore.verifyStatus.value;

                  try {
                    VerificationData.verifyStore(status, userData.uid);
                  } catch (error) {
                    console.log(error.message);
                  } finally {
                    document.querySelector('#menuVerifikasi').click();
                  }
                });
              });
            });
          }
          hideLoadingIcon();
        }, 1000);
      });

      // eslint-disable-next-line no-undef
      menuToko.addEventListener('click', () => {
        showLoadingIcon();
        setTimeout(async () => {
          // Menghapus elemen HTML di luar elemen inner
          const parentElement = contentContainer.parentNode;
          while (parentElement.firstChild !== contentContainer) {
            parentElement.removeChild(parentElement.firstChild);
          }
          contentContainer.innerHTML = `
          <h2>Toko</h2>
          <div class="product-list" id="product-list-admin">
            
          </div>
        `;
          const store = await UserData.getAllUsers();
          const productList = document.querySelector('#product-list-admin');
          Object.values(store).reverse().forEach((item) => {
            const productItem = document.createElement('div');
            console.log(item);
            productItem.innerHTML = `
              <div class="product-item">
                <img class="product-image" src="${item.photo ? item.photo : './images/profilePic.png'}">
                <p class="product-name">${item.name}</p>
                <div class="product-actions">
                  <a class="edit" style="text-decoration: none; cursor: pointer;" href="#/store/${item.uid}">Detail</a>
                  <button class="delete" id="remove-${item.uid}">Delete</button>
                </div>
              </div>
              `;
            if (!item.isAdmin) {
              productList.appendChild(productItem);
              document.querySelector(`#remove-${item.uid}`).addEventListener('click', (event) => {
                event.preventDefault();
                if (item.uid) {
                  UserData.deleteUsers(item.uid).then(() => {
                    document.querySelector('#menuToko').click();
                  });
                }
              });
            }
          });
          hideLoadingIcon();
        }, 1000);
      });

      // eslint-disable-next-line no-undef
      menuProduk.addEventListener('click', () => {
        showLoadingIcon();
        setTimeout(async () => {
          // Menghapus elemen HTML di luar elemen inner
          const parentElement = contentContainer.parentNode;
          while (parentElement.firstChild !== contentContainer) {
            parentElement.removeChild(parentElement.firstChild);
          }
          const product = await ProductData.getProduct();
          contentContainer.innerHTML = `
          <h2>Produk</h2>
          <div class="product-list" id="product-list-admin">
            
          </div>
        `;
          const productList = document.querySelector('#product-list-admin');
          console.log(productList);
          Object.values(product).reverse().forEach((item) => {
            const productItem = document.createElement('div');
            productItem.innerHTML = `
            <div class="product-item">
              <img class="product-image" src="${item.image}">
              <p class="product-name">${item.name}</p>
              <div class="product-actions">
                <a class="edit" style="text-decoration: none; cursor: pointer;" href="#/detail-product/${item.id}">Detail</a>
                <button class="delete" id="remove-${item.id}">Delete</button>
              </div>
            </div>
            `;
            productList.appendChild(productItem);
            document.querySelector(`#remove-${item.id}`).addEventListener('click', (event) => {
              event.preventDefault();
              ProductData.deleteProduct(item.id).then(() => {
                document.querySelector('#menuProduk').click();
              });
            });
          });
          hideLoadingIcon();
        }, 1000);
      });
    }
  },
};

export default AdminPage;
