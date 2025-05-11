import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaTimesCircle, FaHome, FaRedo } from 'react-icons/fa';
import '../styles/payment.scss';

const PaymentFailed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { message } = location.state || {};

  return (
    <div className="payment-result-container">
      <div className="payment-result-card failed">
        <div className="result-icon">
          <FaTimesCircle />
        </div>
        <h1>Thanh toán thất bại</h1>
        {message && <p className="message">{message}</p>}
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            <FaHome /> Về trang chủ
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/plans')}
          >
            <FaRedo /> Thử lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed; 