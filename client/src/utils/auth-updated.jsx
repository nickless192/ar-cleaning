import { jwtDecode } from 'jwt-decode';

class AuthService {
  isLoggingOut = false;
  getProfile() {
    // return jwtDecode(this.getToken());
    const token = this.getToken();
    if (!token) return null;
    try {
      // return jwtDecode(token);
        const decoded = jwtDecode(token);
    return decoded.data || null;
    } catch {
      return null;
    }
  }

  async loggedIn() {
    if (this.isLoggingOut) return false;
    // Checks if there is a saved token and it's still valid
    const token = this.getToken();
    // const isTokenExpired = this.isTokenExpired(token);

    // console.log("isTokenExpired:",isTokenExpired);
    // console.log("this.isTokenExpired:",this.isTokenExpired(token));
    // console.log("logged in token:",token);
    // return !!token && !this.isTokenExpired(token);
    if (!token) return false;
    // return !this.isTokenExpired(token);
    if (!this.isTokenExpired(token)) return true;

    const refreshed = await this.refreshToken();
    return !!refreshed;
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
    return (
      sessionStorage.getItem('id_token') ||
      localStorage.getItem('id_token')
    );
  }

  async login(id_token, adminFlag, options = {}) {
    const { rememberMe = true } = options;
    // Saves user token to localStorage
    // localStorage.setItem('id_token', id_token);    
    // Save token depending on rememberMe
    if (rememberMe) {
      localStorage.setItem('id_token', id_token);
      sessionStorage.removeItem('id_token');
    } else {
      sessionStorage.setItem('id_token', id_token);
      localStorage.removeItem('id_token');
    }

    if (adminFlag) {
      window.location.assign('/admin/booking');
      return;
    }
    window.location.assign('/profile-page');

  }
  async logout() {
        this.isLoggingOut = true;
    // Clear user token and profile data from localStorage

    await fetch("/api/users/logout", {
      method: "POST",
      credentials: "include",
    });
      this.isLoggingOut = false;
    localStorage.removeItem('id_token');
    sessionStorage.removeItem('id_token');
    // localStorage.removeItem('adminFlag');
    // sessionStorage.removeItem('adminFlag');
    // this will reload the page and reset the state of the application
    // window.location.assign('/index');
  }
  async refreshToken() {
    try {
      const res = await fetch("/api/users/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Refresh failed");

      const { accessToken } = await res.json();

      // Preserve existing storage strategy
      if (localStorage.getItem("id_token")) {
        localStorage.setItem("id_token", accessToken);
      } else {
        sessionStorage.setItem("id_token", accessToken);
      }

      return accessToken;
    } catch {
      this.logout();
      return null;
    }
  }

}

// export default new AuthService();
const authService = new AuthService();
export default authService;