/* eslint-disable object-shorthand */
import {
  signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword,
} from 'firebase/auth';
import UserInfo from './user-info';
import UserData from './user-data';

class Auth {
  static async googleSignIn(auth, provider) {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential.accessToken;
        const { user } = result;

        const userExist = await UserData.getUserData(user.uid);
        console.log(userExist);

        if (userExist) {
          const userData = {
            name: user.displayName,
            email: user.email,
            uid: user.uid,
            phone: userExist.phone ? userExist.phone : '',
            photo: userExist.photo ? userExist.photo : '',
            socmed: userExist.socmed ? userExist.socmed : '',
            desc: userExist.desc ? userExist.desc : '',
          };
          UserData.updateUserData(userData, user.uid);
        } else {
          UserData.createUserData(user.displayName, user.email, user.uid);
        }

        UserInfo.setUserInfo(user.email, user.uid, user.displayName);

        location.href = '#/';
        location.reload();
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData;
        const credential = GoogleAuthProvider.credentialFromError(error);

        console.log(errorCode, errorMessage, email, credential);
      });
  }

  static async emailRegister(auth, username, email, password) {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const userData = userCredential.user;

        UserData.createUserData(username, email, userData.uid);

        location.href = '#/login';
      }).catch((error) => {
        console.log(error.message);
      });
  }

  static async emailLogin(auth, email, password) {
    try {
      const userInfo = await signInWithEmailAndPassword(auth, email, password);
      const userData = await UserData.getUserData(userInfo.user.uid);
      await UserInfo.setUserInfo(userData.email, userData.uid, userData.name);
    } catch (error) {
      console.log(error.message);
    } finally {
      location.href = '#/home';
      location.reload();
    }
  }
}
export default Auth;
