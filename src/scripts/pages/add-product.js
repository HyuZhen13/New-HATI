import ProductData from '../utils/product-data';
import UserInfo from '../utils/user-info';

const AddProductPage = {
  async render() {
    return `
    <article class="add-product-article"> 
    <div class="add-product-container">
    <form name="addProductForm" id="addProductForm" method="POST" enctype="multipart/form-data">
          <div>
            <img id="product-photo" src="./Images/produkPic.jpg">
          </div>
          <p>Click to add product image. </p>
          <input placeholder="Product Name" name="productName" required>
          <input type="number" placeholder="Product Price (Rp)" name="productPrice" required>
          <input type="number" placeholder="Product Stock" name="productStock" required>
          <textarea placeholder="Product Description" name="productDesc" id="userDesc" required></textarea>
          <input type="file" name="productImgInput" id="productImgInput"style="display:none;" required>
          <button type="submit">Upload Product</button>
      </form>
    </div>
  </article>
        `;
  },
  async afterRender() {
    const productImg = document.querySelector('#product-photo');
    const productImgInput = document.querySelector('#productImgInput');
    const addProductForm = document.querySelector('#addProductForm');

    const product = {
      uid: UserInfo.getUserInfo().uid,
      name: '',
      price: 0,
      stock: 0,
      desc: '',
      seller: UserInfo.getUserInfo().username,
    };

    productImg.addEventListener('click', () => {
      productImgInput.click();
    });
    productImgInput.addEventListener('change', async () => {
      const file = await productImgInput.files[0];
      const reader = new FileReader();
      reader.onload = async () => {
        productImg.src = reader.result;
      };
      if (file) reader.readAsDataURL(file);
    }, false);

    addProductForm.addEventListener('submit', (event) => {
      event.preventDefault();
      product.name = document.forms.addProductForm.productName.value;
      product.price = document.forms.addProductForm.productPrice.value;
      product.stock = document.forms.addProductForm.productStock.value;
      product.desc = document.forms.addProductForm.productDesc.value;
      const image = productImgInput.files[0];

      try {
        ProductData.addProduct(product, image);
      } catch (e) {
        console.log(e.message);
      } finally {
        // eslint-disable-next-line no-alert
        alert('Succesfully Uploaded.');
      }
    });
  },
};
export default AddProductPage;
