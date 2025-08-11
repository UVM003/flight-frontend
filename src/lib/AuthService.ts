class AuthService {
  static isAuthenticated(): boolean {
    // For example, check if auth token exists in localStorage
    return !!localStorage.getItem('authToken');
  }

  static login(token: string) {
    localStorage.setItem('authToken', token);
  }

  static logout() {
    localStorage.removeItem('authToken');
  }
}

export default AuthService;
