import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { analysisAPI, historyAPI, userAPI } from '../services/api';
import History from '../components/History';
import '../styles/home.scss';

const Home = () => {
  const { isLoggedIn, user, token, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [analyzedImage, setAnalyzedImage] = useState('/images/placeholder.jpg');
  const [animalName, setAnimalName] = useState('Tên loài: Đang chờ...');
  const [animalDescription, setAnimalDescription] = useState('Mô tả: Đang chờ...');
  const [accuracy, setAccuracy] = useState(0);
  const [showScanBar, setShowScanBar] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [history, setHistory] = useState([]);
  const [analysisCount, setAnalysisCount] = useState(() => {
    const savedCount = localStorage.getItem('analysisCount');
    return savedCount ? parseInt(savedCount) : 0;
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [result, setResult] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [userCredit, setUserCredit] = useState(0);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (isLoggedIn && token) {
      loadHistory();
      loadUserCredit();
    }
  }, [isLoggedIn, token]);

  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem('analysisCount', analysisCount.toString());
    }
  }, [analysisCount, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.removeItem('analysisCount');
      setAnalysisCount(0);
    }
  }, [isLoggedIn]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const userMenu = document.querySelector('.user-avatar-container');
      if (userMenu && !userMenu.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Kiểm tra token hết hạn
  useEffect(() => {
    if (token) {
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          logout();
          return;
        }

        const payload = JSON.parse(atob(tokenParts[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();

        if (currentTime >= expirationTime) {
          logout();
        }
      } catch (error) {
        console.error('Error checking token expiration:', error);
        logout();
      }
    }
  }, [token, logout]);

  const loadHistory = async () => {
    try {
      if (!token) {
        console.error('No token available');
        return;
      }

      // Giải mã token để lấy user id
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid token format');
        return;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.sub;

      if (!userId) {
        console.error('No user id in token');
        return;
      }

      const response = await historyAPI.getHistoryByUser(userId);
      if (response.data && response.data.value) {
        setHistory(response.data.value);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const loadUserCredit = async () => {
    try {
      // Giải mã token để lấy user id
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid token format');
        return;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.sub;

      if (!userId) {
        console.error('No user id in token');
        return;
      }

      const response = await userAPI.getUserById(userId);
      if (response.data && response.data.value) {
        setUserCredit(response.data.value.credit);
      }
    } catch (error) {
      console.error('Failed to load user credit:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const createNewAnalyze = () => {
    setAnalyzedImage('/images/placeholder.jpg');
    setAnimalName('Tên loài: Đang chờ...');
    setAnimalDescription('Mô tả: Đang chờ...');
    setAccuracy(0);
    setShowScanBar(false);
    setSelectedImage(null);
    setResult('');
    setConfidence(0);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Kiểm tra giới hạn cho user chưa đăng nhập
    if (!isLoggedIn) {
      if (analysisCount >= 2) {
        setShowModal(true);
        return;
      }
      if (isAnalyzing) {
        return;
      }
    }

    // Reset tất cả kết quả cũ
    setAnimalName('Tên loài: Đang phân tích...');
    setAnimalDescription('Mô tả: Đang phân tích...');
    setAccuracy(0);
    setShowScanBar(true);
    setIsAnalyzing(true);

    // Hiển thị ảnh preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAnalyzedImage(e.target.result);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Sending file:', file.name);

      // Lấy thông tin user từ API nếu đã đăng nhập
      let userSubscription = 'FREE';
      if (isLoggedIn && token) {
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const userId = payload.sub;
            if (userId) {
              const userResponse = await userAPI.getUserById(userId);
              if (userResponse.data && userResponse.data.value) {
                userSubscription = userResponse.data.value.subscription;
                console.log('User subscription from API:', userSubscription);
              }
            }
          }
        } catch (error) {
          console.error('Error getting user info:', error);
        }
      }

      // Set thời gian delay dựa trên gói đăng ký
      let delayTime = 10000; // FREE: 10 giây
      if (userSubscription === 'PREMIUM') {
        delayTime = 5000; // PREMIUM: 5 giây
      } else if (userSubscription === 'PRO') {
        delayTime = 0; // PRO: 0 giây
      }

      // Thêm delay cho user chưa đăng nhập
      if (!isLoggedIn) {
        delayTime = 15000; // 15 giây cho user chưa đăng nhập
      }

      console.log('Selected delay time:', delayTime, 'ms');

      // Thêm delay nếu có
      if (delayTime > 0) {
        console.log('Starting delay for', delayTime, 'ms');
        await new Promise(resolve => setTimeout(resolve, delayTime));
        console.log('Delay completed');
      }

      console.log('Calling analyze API...');
      const response = await analysisAPI.analyzeImage(formData);
      console.log('Response:', response.data);

      const data = response.data.value;
      setAnimalName(`Tên loài: ${data.prediction}`);
      setAnimalDescription(`Mô tả: ${data.description || 'Không có mô tả'}`);
      setAccuracy(data.accuracy);
      setShowScanBar(false);

      if (!isLoggedIn) {
        setAnalysisCount(prev => prev + 1);
      }

      // Reload history and credit after successful analysis
      if (isLoggedIn && token) {
        await loadHistory();
        await loadUserCredit();
      }
    } catch (error) {
      console.error('Analyze error:', error);
      setAnimalName('Tên loài: Không xác định');
      setAnimalDescription(`Mô tả: ${error.message || 'Có lỗi xảy ra khi phân tích ảnh'}`);
      setShowScanBar(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleHistorySelect = (item) => {
    console.log('Selected history item:', item); // Debug log
    setSelectedImage(item.image_url);
    setResult(item.result);
    setConfidence(item.confident);
    setAnimalName(`Tên loài: ${item.result}`);
    setAnimalDescription(`Mô tả: ${item.description || 'Không có mô tả'}`);
    setAccuracy(item.confident);
    setShowScanBar(false);
  };

  const handleDeleteHistory = async (historyId) => {
    try {
      await historyAPI.deleteHistory(historyId);
      await loadHistory();
    } catch (error) {
      console.error('Failed to delete history:', error);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    // Clear all local storage
    localStorage.clear();
    // Call logout from auth context
    logout();
    // Redirect to home page
    window.location.href = '/';
  };

  const handleDeleteAllHistory = async () => {
    setShowConfirmModal(true);
  };

  const confirmDeleteAllHistory = async () => {
    try {
      if (!token) {
        console.error('No token available');
        return;
      }

      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid token format');
        return;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.sub;

      if (!userId) {
        console.error('No user id in token');
        return;
      }

      await historyAPI.deleteAllHistoryByUser(userId);
      setHistory([]);
      setShowSettingsModal(false);
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Failed to delete all history:', error);
      alert('Có lỗi xảy ra khi xóa lịch sử. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="main-container">
      {isLoggedIn && (
        <div className="credit-display">
          <div className="credit-content">
            <img src="/icons/credit.svg" alt="Credit" className="credit-icon" />
            <span className="credit-value">{userCredit}</span>
            <span className="credit-label">Credit</span>
          </div>
        </div>
      )}

      <div className={`floating-buttons ${isLoggedIn && isSidebarOpen ? 'hidden' : ''}`} id="floating-buttons">
        {isLoggedIn && (
          <button className="menu-btn" onClick={toggleSidebar}>
            <img src="/icons/menu.svg" alt="Menu Icon" />
          </button>
        )}
        <button className="new-analyze-btn" onClick={createNewAnalyze}>
          <img src="/icons/new.svg" alt="New Analyze Icon" />
        </button>
        <a href="#" className="title-link">ImageAI</a>
      </div>

      {isLoggedIn ? (
        <div className="user-avatar-container">
          <img 
            src="/icons/avatar.png" 
            alt="User Avatar" 
            className="user-avatar" 
            onClick={() => setShowUserMenu(!showUserMenu)}
          />
          <div className={`dropdown-menu ${showUserMenu ? 'show' : ''}`}>
            <a href="/profile">
              <img src="/icons/user.svg" alt="Profile" />
              Thông tin cá nhân
            </a>
            <a href="#" onClick={() => setShowSettingsModal(true)}>
              <img src="/icons/settings.svg" alt="Settings" />
              Cài đặt
            </a>
            <a href="#" onClick={handleLogout}>
              <img src="/icons/logout.svg" alt="Logout" />
              Đăng xuất
            </a>
          </div>
        </div>
      ) : (
        <>
          <a href="/login" className="login-btn">Đăng nhập</a>
          <a href="/register" className="register-btn">Đăng ký</a>
        </>
      )}

      <div className={`sidebar ${!isSidebarOpen ? 'hidden' : ''} ${!isLoggedIn ? 'none' : ''}`}>
        <div className="sidebar-header">
          <button className="menu-btn" onClick={toggleSidebar}>
            <img src="/icons/menu.svg" alt="Menu" />
          </button>
          <a href="/" className="title-link">ImageAI</a>
          <button className="new-analyze-btn" onClick={createNewAnalyze}>
            <img src="/icons/new.svg" alt="New Analyze" />
          </button>
        </div>
        <div className="sidebar-content">
          <History
            history={history}
            onSelectHistory={handleHistorySelect}
            onDeleteHistory={handleDeleteHistory}
          />
        </div>
        <div className="sidebar-footer">
          <a href="/plan" className="upgrade-btn">
            <img src="/icons/upgrade.svg" alt="Upgrade" />
            Nâng cấp gói
          </a>
        </div>
      </div>

      <div className={`result-section ${!isSidebarOpen ? 'sidebar-hidden' : ''}`}>
        <div className="result-content">
          <div className={`image-area ${showScanBar ? 'scanning' : ''}`}>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <img
              id="analyzed-image"
              src={selectedImage || analyzedImage}
              alt="Result Image"
              onClick={() => document.getElementById('image-upload').click()}
            />
            {showScanBar && <div className="scan-bar"></div>}
          </div>
          <div className="details-area">
            <p id="animal-name">{animalName}</p>
            <p id="animal-description">{animalDescription}</p>
          </div>
        </div>
        <div className="final-percentage-box">
          <div
            className="bar"
            id="final-percentage"
            data-label="Độ chính xác"
            style={{ '--percent': `${accuracy}%` }}
          >
            {isAnalyzing && <div className="loading-effect"></div>}
            Độ chính xác: <span className="percentage">{accuracy}%</span>
          </div>
        </div>
      </div>

      {showModal && (
        <div id="login-modal" className="modal">
          <div className="modal-content">
            <h2>Chào mừng trở lại</h2>
            <p>
              Đăng nhập hoặc đăng ký để không bị giới hạn<br />
              và trải nghiệm đầy đủ các chức năng !!!
            </p>
            <div className="modal-actions">
              <button className="modal-login-btn" onClick={() => window.location.href = '/login'}>
                Đăng nhập
              </button>
              <button className="modal-signup-btn" onClick={() => window.location.href = '/register'}>
                Đăng ký
              </button>
              <a href="#" className="close-link" onClick={() => setShowModal(false)}>
                Tiếp tục trạng thái đăng xuất
              </a>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="settings-modal">
          <div className="settings-modal-content">
            <div className="settings-modal-header">
              <h2>Cài đặt</h2>
              <button 
                className="close-button"
                onClick={() => setShowSettingsModal(false)}
              >
                ×
              </button>
            </div>
            <div className="settings-modal-body">
              <div className="settings-section">
                <h3>Dữ liệu</h3>
                <button 
                  className="delete-history-btn"
                  onClick={handleDeleteAllHistory}
                >
                  Xóa toàn bộ lịch sử
                </button>
              </div>
              <div className="settings-section">
                <h3>Tài khoản</h3>
                <button 
                  className="logout-btn"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="confirm-modal">
          <div className="confirm-modal-content">
            <div className="confirm-modal-header">
              <h2>Xác nhận xóa</h2>
              <button 
                className="close-button"
                onClick={() => setShowConfirmModal(false)}
              >
                ×
              </button>
            </div>
            <div className="confirm-modal-body">
              <div className="warning-icon">
                <img src="/icons/warning.svg" alt="Warning" />
              </div>
              <p className="confirm-message">
                Bạn có chắc chắn muốn xóa toàn bộ lịch sử?<br />
                Hành động này không thể hoàn tác.
              </p>
              <div className="confirm-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Hủy
                </button>
                <button 
                  className="confirm-btn"
                  onClick={confirmDeleteAllHistory}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;