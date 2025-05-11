import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authAPI, userAPI, startTokenRefreshInterval } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUser = async (userId) => {
    try {
      const response = await userAPI.getUser();
      if (response.data && response.data.value) {
        setUser(prevUser => ({
          ...prevUser,
          ...response.data.value
        }));
        return response.data.value;
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken);
        const userId = decodedToken.sub;
        setToken(storedToken);
        setIsLoggedIn(true);
        setUser({ 
          id: userId,
        });

        // Start token refresh interval when user is logged in
        startTokenRefreshInterval();
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      console.log('Login response:', response); // Debug log

      // Kiểm tra response.data.value có tồn tại và có accessToken không
      if (response.data?.value?.accessToken) {
        const { accessToken, refreshToken } = response.data.value;
        
        // Lưu token trước
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Get user info
        const userResponse = await userAPI.getUser();
        if (userResponse.data && userResponse.data.value) {
          // Chỉ set state khi có đầy đủ thông tin
          setUser(userResponse.data.value);
          setToken(accessToken);
          setIsLoggedIn(true);
          
          // Start token refresh interval
          startTokenRefreshInterval();
          return { success: true };
        }
      }

      // Nếu không có accessToken hoặc không lấy được user info
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setIsLoggedIn(false);
      setUser(null);
      
      return { 
        success: false, 
        message: 'Email hoặc mật khẩu không đúng' 
      };
    } catch (error) {
      console.error('Login error:', error);
      
      // Xóa token và state khi có lỗi
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setIsLoggedIn(false);
      setUser(null);
      
      // Xử lý các trường hợp lỗi khác nhau
      if (error.response?.status === 404) {
        return { 
          success: false, 
          message: 'Email không tồn tại' 
        };
      } else if (error.response?.status === 401 || error.response?.status === 400) {
        return { 
          success: false, 
          message: 'Mật khẩu không đúng' 
        };
      }
      return { 
        success: false, 
        message: 'Email hoặc mật khẩu không đúng' 
      };
    }
  };

  const register = async (userData) => {
    try {
      // Kiểm tra mật khẩu xác nhận
      if (userData.password !== userData.confirmPassword) {
        return {
          success: false,
          message: 'Mật khẩu xác nhận không khớp',
        };
      }

      // Validation theo yêu cầu từ backend
      if (!userData.name || userData.name.trim() === '') {
        return {
          success: false,
          message: 'Vui lòng nhập họ tên',
        };
      }

      if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        return {
          success: false,
          message: 'Email không hợp lệ',
        };
      }

      if (!userData.password || userData.password.length < 7) {
        return {
          success: false,
          message: 'Mật khẩu phải có ít nhất 7 ký tự',
        };
      }

      if (userData.phone && !/^(\+\d{1,3})?[- .]?\d{10,15}$/.test(userData.phone)) {
        return {
          success: false,
          message: 'Số điện thoại không hợp lệ',
        };
      }

      const response = await userAPI.createUser({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
      });

      if (response?.data?.code === 1000) {
        return {
          success: true,
          message: 'Đăng ký thành công',
        };
      } else {
        return {
          success: false,
          message: response?.data?.message || 'Đăng ký thất bại',
        };
      }
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Đăng ký thất bại',
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const value = {
    isLoggedIn,
    user,
    token,
    loading,
    login,
    register,
    logout,
    getUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 