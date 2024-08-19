/* eslint-disable object-shorthand */
import {
  signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword,
} from 'firebase/auth';
import UserInfo from './user-info';
import UserData from './user-data';

class Auth {
  static async googleSignIn(auth, provider) {
    try {
      const result = await signInWithPopup(auth, provider);
      const { user } = result;

      const userExist = await UserData.getUserData(user.uid);
      console.log(userExist);

      let isAdmin = false;
      if (userExist) {
        const userData = {
          name: user.displayName,
          email: user.email,
          uid: user.uid,
          phone: userExist.phone || '',
          photo: userExist.photo || '',
          socmed: userExist.socmed || '',
          desc: userExist.desc || '',
          isAdmin: userExist.isAdmin || false,
        };
        await UserData.updateUserData(userData, user.uid);
        isAdmin = userData.isAdmin;
      } else {
        await UserData.createUserData(user.displayName, user.email, user.uid);
      }

      await UserInfo.setUserInfo(user.email, user.uid, user.displayName);

      if (isAdmin) {
        location.href = '#/admin';
      } else {
        location.href = '#/home';
      }
      location.reload();
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData;
      const credential = GoogleAuthProvider.credentialFromError(error);

      console.log(errorCode, errorMessage, email, credential);
    }
  }

  static async emailRegister(auth, username, email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userData = userCredential.user;

      await UserData.createUserData(username, email, userData.uid);

      location.href = '#/login';
    } catch (error) {
      console.log(error.message);
    }
  }

  static async emailLogin(auth, email, password) {
    try {
      const userInfo = await signInWithEmailAndPassword(auth, email, password);
      const userData = await UserData.getUserData(userInfo.user.uid);

      await UserInfo.setUserInfo(userData.email, userData.uid, userData.name);

      if (userData.isAdmin) {
        location.href = '#/admin';
      } else {
        location.href = '#/home';
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      location.reload();
    }
  }
}

export default Auth;
