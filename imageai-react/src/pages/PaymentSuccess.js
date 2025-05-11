import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaHistory } from 'react-icons/fa';
import '../styles/payment.scss';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { transactionCode, message } = location.state || {};

  return (
    <div className="payment-result-container">
      <div className="payment-result-card success">
        <div className="result-icon">
          <FaCheckCircle />
        </div>
        <h1>Thanh toán thành công!</h1>
        {transactionCode && (
          <div className="transaction-info">
            <p>Mã giao dịch:</p>
            <span className="transaction-code">{transactionCode}</span>
          </div>
        )}
        {message && <p className="message">{message}</p>}
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            <FaHome /> Về trang chủ
          </button>
        
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 