import { jwtDecode } from 'jwt-decode';

const readStorage = (storage, key) => {
  try {
    return storage.getItem(key);
  } catch (err) {
    console.warn(`[auth] Unable to read ${key} from storage`, err);
    return null;
  }
};

const writeStorage = (storage, key, value) => {
  try {
    storage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(`[auth] Unable to write ${key} to storage`, err);
    return false;
  }
};

const removeStorage = (storage, key) => {
  try {
    storage.removeItem(key);
  } catch (err) {
    console.warn(`[auth] Unable to remove ${key} from storage`, err);
  }
};

class AuthService {
  getProfile() {
    // return jwtDecode(this.getToken());
        const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }

  loggedIn() {
    // Checks if there is a saved token and it's still valid
    const token = this.getToken();
    // const isTokenExpired = this.isTokenExpired(token);
    
    // console.log("isTokenExpired:",isTokenExpired);
    // console.log("this.isTokenExpired:",this.isTokenExpired(token));
    // console.log("logged in token:",token);
    // return !!token && !this.isTokenExpired(token);
    if (!token) return false;
    return !this.isTokenExpired(token);
    // return !!token;
  }
// need to review this code
  isTokenExpired(token) {
    // try {
    //   const decoded = jwtDecode(token);
    //   // console.log("decoded:",decoded);
    //   // console.log("date now:",Date.now());
    //   if (decoded.exp < Date.now() / 1000) {
    //     // console.log("token expired");
    //     return true;
    //   } else return false;
    // } catch (err) {
    //   // console.log("Token expired and cannot be decoded - error:",err);
    //   return false;
    // }
    if (!token) return true;
    try {
      const decoded = jwtDecode(token);
      // exp is in seconds
      return decoded.exp < Date.now() / 1000;
    } catch (err) {
      // If it can't be decoded, don't trust it
      console.error('Error decoding token:', err);
      return true;
    }
  }

  getToken() {
    // // Retrieves the user token from localStorage
    // return localStorage.getItem('id_token');
     // Prefer sessionStorage (current session), fallback to localStorage (remembered)
    const sessionToken = readStorage(sessionStorage, 'id_token');
    if (sessionToken) return sessionToken;
    return readStorage(localStorage, 'id_token');
  }

  async login(id_token, adminFlag, options = {}) {
    const { rememberMe = true } = options;
    // Saves user token to localStorage
    // localStorage.setItem('id_token', id_token);    
    // Save token depending on rememberMe
    if (rememberMe) {
      writeStorage(localStorage, 'id_token', id_token);
      removeStorage(sessionStorage, 'id_token');
    } else {
      writeStorage(sessionStorage, 'id_token', id_token);
      removeStorage(localStorage, 'id_token');
    }

    if (adminFlag) {
      window.location.assign('/admin/booking');
      return;
    }
    window.location.assign('/profile-page');

  }
  logout() {
    // Clear user token and profile data from localStorage
    removeStorage(localStorage, 'id_token');
    removeStorage(sessionStorage, 'id_token');
    // localStorage.removeItem('adminFlag');
    // sessionStorage.removeItem('adminFlag');
    // this will reload the page and reset the state of the application
    // window.location.assign('/index');
  }
}

// export default new AuthService();
const authService = new AuthService();
export default authService;
