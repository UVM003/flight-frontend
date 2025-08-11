const API_BASE_URL = 'https://your-api-base-url.com/api'; // Replace with your actual API URL

export async function get<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`GET ${endpoint} failed: ${response.statusText}`);
  }
  return response.json();
}

export async function post<T, U>(endpoint: string, data: T): Promise<U> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`POST ${endpoint} failed: ${response.statusText}`);
  }
  return response.json();
}

export const AuthService = {
  login: (email: string, password: string) =>
    post<{ email: string; password: string }, { token: string }>('/auth/login', { email, password }),

  register: (data: { firstName: string; lastName: string; email: string; password: string; phoneNumber: string }) =>
    post<typeof data, { userId: string }>('/auth/register', data),

  // Add more auth-related methods here
};
