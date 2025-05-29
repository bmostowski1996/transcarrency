// client/utils/auth.ts
import { type JwtPayload, jwtDecode } from 'jwt-decode';

// Extend the base JWT payload to include your app-specific user data
interface ExtendedJwt extends JwtPayload {
  data: {
    username: string;
    email: string;
    _id: string;
  };
}

class AuthService {
  /**
   * Decode the stored token and return the user's profile data
   */
  getUser(): ExtendedJwt | null {
    try {
      const token = this.getToken();
      return jwtDecode<ExtendedJwt>(token);
    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
  }

  /**
   * Check whether the user is logged in by verifying the token exists and is not expired
   */
  loggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Determine if a token has expired based on the 'exp' field
   * @param token - JWT string
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      if (decoded?.exp && decoded.exp < Date.now() / 1000) {
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to decode token:', err);
      return true;
    }
  }

  /**
   * Retrieve token from localStorage
   */
  getToken(): string {
    return localStorage.getItem('id_token') || '';
  }

  /**
   * Save token to localStorage and redirect to homepage
   * @param idToken - JWT string
   */
  login(idToken: string): void {
    localStorage.setItem('id_token', idToken);
    window.location.assign('/');
  }

  /**
   * Remove token and redirect to homepage
   */
  logout(): void {
    localStorage.removeItem('id_token');
    window.location.assign('/');
  }
}

// Export a singleton instance of the AuthService class
export default new AuthService();

