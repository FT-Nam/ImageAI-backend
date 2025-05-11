import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaCrown, FaCoins, FaCalendarAlt, FaArrowLeft, FaLock } from 'react-icons/fa';
import '../styles/profile.scss';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const delayedNavigate = (path) => {
    console.log('Will navigate to', path, 'in 5 seconds...');
    setTimeout(() => {
      navigate(path);
    }, 5000);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Debug logs
        console.log('Current user:', user);
        console.log('Access token:', localStorage.getItem('accessToken'));
        console.log('Refresh token:', localStorage.getItem('refreshToken'));

        // Check if we have access token
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          console.error('No access token found');
          delayedNavigate('/login');
          return;
        }

        if (!user?.id) {
          console.error('No user ID found');
          delayedNavigate('/login');
          return;
        }

        console.log('Fetching user data for ID:', user.id);
        const response = await userAPI.getUserById(user.id);
        console.log('User data response:', response);

        if (response?.data?.value) {
          setUserData(response.data.value);
          setFormData({
            name: response.data.value.name || '',
            email: response.data.value.email || '',
            phone: response.data.value.phone || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        console.error('Error response:', error.response);
        
        if (error.response?.status === 401) {
          console.error('Token expired or invalid');
          delayedNavigate('/login');
        } else {
          setError('Không thể tải thông tin người dùng');
        }
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Debug logs
      console.log('Current user data:', userData);
      console.log('Form data:', formData);
      console.log('Current access token:', localStorage.getItem('accessToken'));

      // Check if we have access token
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        console.error('No access token found during update');
        delayedNavigate('/login');
        return;
      }

      // Prepare update data with all fields
      const updateData = {
        name: formData.name.trim() || userData.name,
        email: formData.email.trim() || userData.email,
        phone: formData.phone.trim() || userData.phone
      };

      console.log('Sending update data:', updateData);
      const response = await userAPI.updateUser(user.id, updateData);
      console.log('Update response:', response);

      if (response?.data?.value) {
        setUserData(response.data.value);
        setSuccess('Cập nhật thông tin thành công');
        setIsEditing(false);
        // Reset form data with updated values
        setFormData({
          name: response.data.value.name || '',
          email: response.data.value.email || '',
          phone: response.data.value.phone || ''
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 401) {
        console.error('Token expired or invalid during update');
        delayedNavigate('/login');
      } else {
        setError(error.response?.data?.message || 'Cập nhật thông tin thất bại');
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Kiểm tra mật khẩu mới và xác nhận mật khẩu
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Mật khẩu mới không khớp');
      return;
    }

    // Kiểm tra độ dài mật khẩu mới
    if (passwordData.newPassword && passwordData.newPassword.length < 7) {
      setError('Mật khẩu mới phải có ít nhất 7 ký tự');
      return;
    }

    try {
      // Nếu không có mật khẩu mới, không cần gửi request
      if (!passwordData.newPassword) {
        setError('Vui lòng nhập mật khẩu mới');
        return;
      }

      // Prepare update data with only required fields
      const updateData = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: passwordData.newPassword // Gửi mật khẩu mới trong trường password
      };

      console.log('Sending password update data:', updateData);
      const response = await userAPI.updateUser(user.id, updateData);
      console.log('Password update response:', response);

      if (response?.data?.value) {
        setSuccess('Đổi mật khẩu thành công');
        setShowPasswordForm(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    }
  };

  const getPlanName = (plan) => {
    switch (plan) {
      case 'FREE':
        return 'Miễn phí';
      case 'PREMIUM':
        return 'Premium';
      case 'PRO':
        return 'Pro';
      default:
        return plan;
    }
  };

  if (!userData) {
    return (
      <div className="profile-container">
        <div className="loading">Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Quay lại
      </button>

      <div className="profile-card">
        <div className="profile-header">
          <h1>Thông tin cá nhân</h1>
          <div className="header-actions">
            {!isEditing && !showPasswordForm && (
              <>
                <button 
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  Chỉnh sửa
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowPasswordForm(true)}
                >
                  <FaLock /> Đổi mật khẩu
                </button>
              </>
            )}
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {showPasswordForm ? (
          <form onSubmit={handlePasswordSubmit} className="profile-form">
            <div className="form-group">
              <label>
                <FaLock /> Mật khẩu hiện tại
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FaLock /> Mật khẩu mới
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                minLength="7"
                placeholder="Để trống nếu không muốn thay đổi"
              />
            </div>

            <div className="form-group">
              <label>
                <FaLock /> Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                minLength="7"
                placeholder="Để trống nếu không muốn thay đổi"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Đổi mật khẩu
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
              >
                Hủy
              </button>
            </div>
          </form>
        ) : isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>
                <FaUser /> Họ và tên
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={userData.name}
              />
            </div>

            <div className="form-group">
              <label>
                <FaEnvelope /> Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={userData.email}
              />
            </div>

            <div className="form-group">
              <label>
                <FaPhone /> Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={userData.phone}
                pattern="[0-9]{10,15}"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Lưu thay đổi
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: userData.name || '',
                    email: userData.email || '',
                    phone: userData.phone || ''
                  });
                }}
              >
                Hủy
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-group">
              <div className="info-label">
                <FaUser /> Họ và tên
              </div>
              <div className="info-value">{userData.name}</div>
            </div>

            <div className="info-group">
              <div className="info-label">
                <FaEnvelope /> Email
              </div>
              <div className="info-value">{userData.email}</div>
            </div>

            <div className="info-group">
              <div className="info-label">
                <FaPhone /> Số điện thoại
              </div>
              <div className="info-value">{userData.phone}</div>
            </div>

            <div className="info-group">
              <div className="info-label">
                <FaCrown /> Gói dịch vụ
              </div>
              <div className="info-value">{getPlanName(userData.subscription)}</div>
            </div>

            <div className="info-group">
              <div className="info-label">
                <FaCoins /> Số dư
              </div>
              <div className="info-value">{userData.credit} credits</div>
            </div>

            <div className="info-group">
              <div className="info-label">
                <FaCalendarAlt /> Ngày tham gia
              </div>
              <div className="info-value">
                {userData.created_at ? new Date(userData.created_at).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Chưa có thông tin'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 