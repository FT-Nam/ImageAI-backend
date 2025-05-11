import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/auth.scss';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await register(formData);
    if (result.success) {
      setShowSuccessModal(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Tạo Tài Khoản</h1>
        <p>Đăng ký để trải nghiệm dịch vụ</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name" className="login-label">
            Họ và tên
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="login-input"
            placeholder="Nhập họ và tên của bạn"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="email" className="login-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="login-input"
            placeholder="Nhập email của bạn"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password" className="login-label">
            Mật khẩu
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="login-input"
            placeholder="Nhập mật khẩu của bạn"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label htmlFor="confirmPassword" className="login-label">
            Xác nhận mật khẩu
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="login-input"
            placeholder="Nhập lại mật khẩu của bạn"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <label htmlFor="phone" className="login-label">
            Số điện thoại
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="login-input"
            placeholder="Nhập số điện thoại của bạn"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          {error && <span className="error-message">{error}</span>}

          <button type="submit" className="login-button">
            Đăng Ký
          </button>
        </form>
        
        <div className="login-options">
          <p className="login-text">Đã có tài khoản?</p>
          <Link to="/login" className="create-account">
            Đăng nhập
          </Link>
        </div>
      </div>

      {showSuccessModal && (
        <div className="success-modal">
          <div className="success-modal-content">
            <div className="success-icon">✓</div>
            <h2>Đăng ký thành công!</h2>
            <p>Bạn sẽ được chuyển đến trang đăng nhập...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register; 