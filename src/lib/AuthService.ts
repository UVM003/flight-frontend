class AuthService {
  static isAuthenticated(): boolean {

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
