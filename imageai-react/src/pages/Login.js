import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/login.scss';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      console.log('Login result:', result); // Debug log
      
      if (result && result.success === true) {
        navigate('/');
      } else {
        setError(result?.message || 'Email hoặc mật khẩu không đúng');
      }
    } catch (err) {
      console.error('Login error:', err); // Debug log
      setError('Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Đăng nhập</h1>
        <p>Chào mừng bạn trở lại!</p>

        <form onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="login-input"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {error && <div className="error-message">{error}</div>}

          <label className="login-label" htmlFor="password">
            Mật khẩu
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="login-input"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="login-options">
          <p className="login-text">Chưa có tài khoản?</p>
          <a href="/register">Đăng ký</a>
        </div>
      </div>
    </div>
  );
};

export default Login; 