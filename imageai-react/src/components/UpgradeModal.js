import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/modal.scss';

const UpgradeModal = ({ open, onClose, onUpgrade }) => {
  if (!open) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Chào mừng trở lại</h2>
        <p>
          Đăng nhập hoặc đăng ký để không bị giới hạn<br />
          và trải nghiệm đầy đủ các chức năng !!!
        </p>
        <div className="modal-actions">
          <Link to="/login" className="modal-login-btn">
            Đăng nhập
          </Link>
          <Link to="/register" className="modal-signup-btn">
            Đăng ký
          </Link>
          <button className="modal-upgrade-btn" onClick={onUpgrade}>
            Xem các gói dịch vụ
          </button>
          <a href="#" className="close-link" onClick={onClose}>
            Tiếp tục trạng thái đăng xuất
          </a>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal; 