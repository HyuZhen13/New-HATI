import UserInfo from '../utils/user-info';

const Logout = {
  async render() {
    return '';
  },
  async afterRender() {
    UserInfo.deleteUserInfo();
    location.href = '#/';
    location.reload();
  },
};
export default Logout;
