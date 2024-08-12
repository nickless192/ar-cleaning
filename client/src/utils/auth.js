import { jwtDecode } from 'jwt-decode';

class AuthService {
  getProfile() {
    return jwtDecode(this.getToken());
  }

  loggedIn() {
    // Checks if there is a saved token and it's still valid
    const token = this.getToken();
    console.log("logged in token:",token);
    // return !!token && !this.isTokenExpired(token);
    return !!token;
  }

  isTokenExpired(token) {
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp < Date.now() / 1000) {
        return true;
      } else return false;
    } catch (err) {
      return false;
    }
  }

  getToken() {
    // Retrieves the user token from localStorage
    return sessionStorage.getItem('id_token');
  }

  async login(id_token, adminFlag) {
    // Saves user token to localStorage
    console.log(id_token, adminFlag);
    localStorage.setItem('id_token', id_token);
    localStorage.setItem('adminFlag', adminFlag);
    sessionStorage.setItem('id_token', id_token);
    sessionStorage.setItem('adminFlag', adminFlag);

    console.log("login token:",id_token);
    console.log(sessionStorage.getItem('id_token'));
    // window.location.assign('/profile-page');

  }

  logout() {
    // Clear user token and profile data from localStorage
    localStorage.removeItem('id_token');
    localStorage.removeItem('adminFlag');
    sessionStorage.removeItem('id_token');
    sessionStorage.removeItem('adminFlag');
    // this will reload the page and reset the state of the application
    // window.location.assign('/index');
  }
}

// export default new AuthService();
const authService = new AuthService();
export default authService;