import HomePage from '../pages/home-page';
import LoginPage from '../pages/login-page';
import Logout from '../pages/logout';
import RegisterPage from '../pages/register-page';
import AboutPage from '../pages/about-page';
import AdminPage from '../pages/admin-page';
import MarketplacePage from '../pages/marketList-page';
import ProfilePage from '../pages/profile';
import AddProductPage from '../pages/add-product';
import EditProductPage from '../pages/edit-product-page';
import DetailProductPage from '../pages/detail-product';
import StorePage from '../pages/store-page';
import NewsDetailPage from '../pages/detail-news';
import CartPage from '../pages/cart-page';
import OrderPage from '../pages/order-page';

const routes = {
  '/home': HomePage,
  '/login': LoginPage,
  '/logout': Logout,
  '/register': RegisterPage,
  '/marketplace': MarketplacePage,
  '/about': AboutPage,
  '/admin': AdminPage,
  '/profile': ProfilePage,
  '/add-product': AddProductPage,
  '/edit-product/:id': EditProductPage,
  '/detail-product/:id': DetailProductPage,
  '/store/:id': StorePage,
  '/news/:id': NewsDetailPage,
  '/cart': CartPage,
  '/order': OrderPage,
};

export default routes;
