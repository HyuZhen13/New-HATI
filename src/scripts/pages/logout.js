import UserInfo from '../utils/user-info';

const Logout = {
  async render() {
    return '';
  },
  async afterRender() {
    UserInfo.deleteUserInfo();
    location.href = '#/home';
    location.reload();
  },
};
export default Logout;
