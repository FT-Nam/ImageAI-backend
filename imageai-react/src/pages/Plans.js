import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { planAPI, paymentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/plans.scss';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await planAPI.getPlans();
      setPlans(response.data);
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    try {
      const response = await paymentAPI.createPayment({
        amount: plan.price,
        language: 'vn',
        subscription_plan: plan.name,
      });

      // Redirect to VNPay payment page
      window.location.href = response.data.paymentUrl;
    } catch (error) {
      console.error('Failed to create payment:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="plans-container">
      <h1>Chọn Gói Phù Hợp</h1>
      <div className="plans-grid">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${
              user?.subscription === plan.name ? 'current' : ''
            }`}
          >
            <h2>{plan.name}</h2>
            <div className="price">{plan.price.toLocaleString('vi-VN')}đ</div>
            <div className="duration">{plan.duration} ngày</div>
            <ul className="features">
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <button
              className="subscribe-btn"
              onClick={() => handleSubscribe(plan)}
              disabled={user?.subscription === plan.name}
            >
              {user?.subscription === plan.name
                ? 'Gói hiện tại'
                : 'Đăng ký ngay'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plans; 