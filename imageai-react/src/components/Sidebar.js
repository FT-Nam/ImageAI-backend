import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { historyAPI } from '../services/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import '../styles/components/sidebar.scss';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistories = async () => {
      console.log('Current user:', user); // Debug log
      
      if (!user || !user.id) {
        console.log('No user ID available, skipping history fetch');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching history for user:', user.id);
        const response = await historyAPI.getHistoryByUser(user.id);
        console.log('History response:', response); // Debug log
        
        if (response.data && response.data.value) {
          console.log('Setting histories:', response.data.value);
          setHistories(response.data.value);
        } else {
          console.log('No history data in response');
        }
      } catch (err) {
        console.error('Error fetching histories:', err);
        setError('Không thể tải lịch sử');
      } finally {
        setLoading(false);
      }
    };

    fetchHistories();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">ImageAI</h2>
        <p className="text-gray-400 text-sm">Xin chào, {user?.email}</p>
      </div>

      <nav className="mb-8">
        <ul>
          <li className="mb-2">
            <Link to="/" className="block py-2 px-4 rounded hover:bg-gray-700">
              Trang chủ
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/plan" className="block py-2 px-4 rounded hover:bg-gray-700">
              Gói dịch vụ
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/profile" className="block py-2 px-4 rounded hover:bg-gray-700">
              Thông tin cá nhân
            </Link>
          </li>
        </ul>
      </nav>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Lịch sử phân tích</h3>
        {loading ? (
          <p className="text-gray-400">Đang tải...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : histories.length === 0 ? (
          <p className="text-gray-400">Chưa có lịch sử phân tích</p>
        ) : (
          <div className="space-y-4">
            {histories.map((history) => (
              <div key={history.id} className="bg-gray-700 p-3 rounded">
                <div className="flex items-center mb-2">
                  <img 
                    src={history.image_url} 
                    alt="Analyzed" 
                    className="w-12 h-12 object-cover rounded mr-3"
                  />
                  <div>
                    <p className="font-medium">{history.result}</p>
                    <p className="text-sm text-gray-300">
                      {format(new Date(history.created_at), 'HH:mm dd/MM/yyyy', { locale: vi })}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-300">
                  Độ chính xác: {history.confident}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Đăng xuất
      </button>
    </div>
  );
};

export default Sidebar; 