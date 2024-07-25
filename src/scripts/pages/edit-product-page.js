import UrlParser from '../routes/url-parser';
import ProductData from '../utils/product-data';
import UserInfo from '../utils/user-info';

const EditProductPage = {
  async render() {
    return `
    <article class="add-product-article"> 
    <div class="add-product-container">
    <form name="addProductForm" id="addProductForm" method="POST" enctype="multipart/form-data">
          <div>
            <img id="product-photo" src="./images/produkPic.jpg">
          </div>
          <p>Click to edit product image. </p>
          <input placeholder="Product Name" name="productName">
          <input type="number" placeholder="Product Price (Rp)" name="productPrice">
          <input type="number" placeholder="Product Stock" name="productStock">
          <textarea placeholder="Product Description" name="productDesc" id="userDesc"></textarea>
          <input type="file" name="productImgInput" id="productImgInput"style="display:none;">
          <button type="submit">Update Product</button>
          <button id="delete-product">Delete Product</button>
      </form>
    </div>
  </article>
        `;
  },
  async afterRender() {
    const url = UrlParser.parseActiveUrlCaseSensitive();

    const data = await ProductData.getProductById(url.id);

    const product = { ...data, seller: UserInfo.getUserInfo().username };

    console.log(product);
    const productImg = document.querySelector('#product-photo');
    const productImgInput = document.querySelector('#productImgInput');
    const addProductForm = document.querySelector('#addProductForm');
    const deleteProduct = document.querySelector('#delete-product');

    document.forms.addProductForm.productName.value = product.name;
    document.forms.addProductForm.productPrice.value = product.price;
    document.forms.addProductForm.productStock.value = product.stock;
    document.forms.addProductForm.productDesc.value = product.desc;

    productImg.src = `${product.image}`;

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
        ProductData.updateProduct(product, image);
      } catch (e) {
        console.log(e.message);
      } finally {
        // eslint-disable-next-line no-alert
        alert('Succesfully Updated.');
      }
    });

    deleteProduct.addEventListener('click', (event) => {
      event.preventDefault();
      try {
        ProductData.deleteProduct(product.id);
      } catch (e) {
        console.log(e.message);
      } finally {
        // eslint-disable-next-line no-alert
        alert('Succesfully Deleted.');
        location.href = '#/profile';
      }
    });
  },
};
export default EditProductPage;
