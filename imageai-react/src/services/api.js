import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:8080/api/v1';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log('Response error:', error.response?.status, error.response?.data);

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Attempting to refresh token...');
      originalRequest._retry = true;

      try {
        // Debug log to check localStorage
        console.log('Current localStorage before refresh:', {
          accessToken: localStorage.getItem('accessToken'),
          refreshToken: localStorage.getItem('refreshToken')
        });

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.error('No refresh token found in localStorage');
          throw new Error('No refresh token available');
        }

        console.log('Using refresh token:', refreshToken);

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          'refresh-token': refreshToken
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('Refresh token response:', response.data);

        if (response.data && response.data.value) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.value;
          console.log('New tokens received:', {
            accessToken,
            newRefreshToken
          });
          
          // Save both new tokens
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          console.log('Updated localStorage after refresh:', {
            accessToken: localStorage.getItem('accessToken'),
            refreshToken: localStorage.getItem('refreshToken')
          });

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          console.log('Retrying original request with new token');
          return api(originalRequest);
        } else {
          console.error('Invalid refresh token response format:', response.data);
          throw new Error('Invalid refresh token response format');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // If refresh fails, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Add token to request headers
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Add refresh token to request headers
const getRefreshHeader = () => {
  const refreshToken = localStorage.getItem('refreshToken');
  return refreshToken ? { Authorization: `Bearer ${refreshToken}` } : {};
};

// Auth APIs
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  logout: () => 
    api.post('/auth/logout'),
  
  refreshToken: (refreshToken) => 
    api.post('/auth/refresh', { refreshToken })
};

// User APIs
export const userAPI = {
  createUser: (userData) => 
    api.post('/user', userData),
  
  getUser: async () => {
    try {
      const response = await axios.get(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  refreshToken: async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('refreshToken')}`
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateUser: (userId, userData) => {
    return api.put(`/user/${userId}`, userData);
  }
};

// Analysis API
export const analysisAPI = {
  analyzeImage: async (formData) => {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Current token for analyze:', token);

      const response = await axios.post(`${API_URL}/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : undefined
        }
      });

      console.log('Analyze response:', response.data);
      return response;
    } catch (error) {
      console.error('Analyze error:', error.response?.data || error.message);
      throw error;
    }
  }
};

// History APIs
export const historyAPI = {
  getHistoryByUser: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/history/userId/${userId}`, {
        headers: getAuthHeader()
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  deleteHistory: async (historyId) => {
    try {
      const response = await axios.delete(`${API_URL}/history/${historyId}`, {
        headers: getAuthHeader()
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  deleteAllHistoryByUser: async (userId) => {
    try {
      const response = await axios.delete(`${API_URL}/history/userId/${userId}`, {
        headers: getAuthHeader()
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// Payment APIs
export const paymentAPI = {
  createPayment: async (paymentData) => {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Current token for create payment:', token);

      const response = await axios.post(`${API_URL}/payment/vnpay/create`, paymentData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : undefined
        }
      });

      console.log('Create payment response:', response.data);
      
      // Check if response is successful and has value
      if (response.data && response.data.code === 1000 && response.data.value) {
        // Return the payment URL from value
        return response.data.value;
      } else {
        throw new Error('Invalid payment response format');
      }
    } catch (error) {
      console.error('Create payment error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  paymentCallback: async (params) => {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Current token for payment callback:', token);

      const response = await axios.get(`${API_URL}/payment/vnpay/callback`, {
        params,
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined
        }
      });

      console.log('Payment callback response:', response.data);
      return response;
    } catch (error) {
      console.error('Payment callback error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  paymentReturnUrl: async (params) => {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Current token for payment return:', token);

      const response = await axios.get(`${API_URL}/payment/vnpay/return-url`, {
        params,
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined
        }
      });

      console.log('Payment return response:', response.data);
      return response;
    } catch (error) {
      console.error('Payment return error:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Plan APIs
export const planAPI = {
  getPlans: () => 
    api.get('/plan')
};

// Function to check token expiration
export const checkTokenExpiration = () => {
  const token = localStorage.getItem('token');
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

// Function to start token refresh interval
export const startTokenRefreshInterval = () => {
  console.log('Starting token refresh interval...');
  // Check every 29 minutes
  const intervalId = setInterval(async () => {
    console.log('Interval triggered at:', new Date().toISOString());
    
    // Debug log to check localStorage
    console.log('Current localStorage before refresh:', {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken')
    });

    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('No access token found, skipping refresh check');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;
      
      console.log('Token info:', {
        expiresAt: new Date(expirationTime).toISOString(),
        currentTime: new Date(currentTime).toISOString(),
        timeUntilExpiry: Math.floor(timeUntilExpiry / 1000) + ' seconds'
      });
      
      // Refresh token every 29 minutes
      console.log('Refreshing token...');
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.error('No refresh token found in localStorage');
        throw new Error('No refresh token available');
      }

      console.log('Using refresh token:', refreshToken);

      const response = await axios.post(`${API_URL}/auth/refresh`, {
        'refresh-token': refreshToken
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Refresh token response:', response.data);

      if (response.data && response.data.value) {
        const { accessToken, refreshToken: newRefreshToken } = response.data.value;
        console.log('New tokens received:', {
          accessToken,
          newRefreshToken
        });

        // Save both new tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        console.log('Updated localStorage after refresh:', {
          accessToken: localStorage.getItem('accessToken'),
          refreshToken: localStorage.getItem('refreshToken')
        });
      } else {
        console.error('Invalid refresh token response format:', response.data);
        throw new Error('Invalid refresh token response format');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout user
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/';
    }
  }, 29 * 60 * 1000); // 29 minutes

  // Store intervalId in localStorage to clear it later if needed
  localStorage.setItem('refreshIntervalId', intervalId);
  
  return intervalId;
};

// Function to stop token refresh interval
export const stopTokenRefreshInterval = () => {
  const intervalId = localStorage.getItem('refreshIntervalId');
  if (intervalId) {
    clearInterval(parseInt(intervalId));
    localStorage.removeItem('refreshIntervalId');
    console.log('Token refresh interval stopped');
  }
};

export default api; 