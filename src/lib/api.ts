// const API_BASE_URL = ''; // Replace with your actual API URL


export async function get<T>(endpoint: string, headers = {}): Promise<T | String> {
  const response = await fetch(`${endpoint}`, { //${API_BASE_URL}
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
  const contentType = response.headers.get('content-type');
  if (response.ok) {
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      // fallback: treat response as plain text
      return response.text();
    }
  } else {
    // error responses can also be JSON or text
    if (contentType && contentType.includes('application/json')) {
      const errorJson = await response.json();
      return errorJson;
    } else {
      return response.text();
    }
  }
}

export async function post<T, U>(endpoint: string, data: T, headers = {}): Promise<U | string> {
  const response = await fetch(`${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(data),
  });
  const contentType = response.headers.get('content-type');

  if (response.ok) {
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      // fallback: treat response as plain text
      return response.text();
    }
  } else {
    // error responses can also be JSON or text
    if (contentType && contentType.includes('application/json')) {
      const errorJson = await response.json();
      return errorJson;
    } else {
      return response.text();
    }
  }
}
// Ticket cancellation API service
export const TicketCancellationService = {
  // Get ticket details for cancellation
  getTicketDetails: (bookingId: string, token: string) => 
    get(`http://localhost:8085/api/tickets/${bookingId}`, {
      Authorization: token ? `Bearer ${token}` : ''
    }),

  // Request OTP for cancellation 
  requestOtp: (token: string) =>
    post(`http://localhost:8082/api/ticketCancel/otp/request`,
      {}, // no body needed
      { Authorization: token ? `Bearer ${token}` : '' }
    ),

  // Verify OTP and process cancellation (POST request with params)
  verifyOtp: (bookingId: string, otp: string, cancellationDate: string, token: string) =>
    post(
      `http://localhost:8082/api/ticketCancel/otp/${bookingId}/verify?cancellationDate=${cancellationDate}&otp=${otp}`,
      {}, // no body, params are in query
      { Authorization: token ? `Bearer ${token}` : '' }
    ),
};

export const AuthService = {
  login: (email: string, password: string) =>
    post<{ email: string; password: string }, { token: string }>('/auth/login', { email, password }),

  register: (data: { firstName: string; lastName: string; email: string; password: string; phoneNumber: string }) =>
    post<typeof data, { userId: string }>('/auth/register', data),

  // Add more auth-related methods here
};

