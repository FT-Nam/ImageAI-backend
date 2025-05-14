import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { planAPI, paymentAPI, userAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/plan.scss';

const Plan = () => {
  const navigate = useNavigate();
  const { isLoggedIn, token, user } = useAuth();
  const [plans, setPlans] = useState([
    {
      id: "free-plan",
      subscription: "FREE",
      price: 0,
      weekly_credit: 100,
      features: [
        '100 credit/tuần',
        'Phân tích chính xác cao',
        'Lưu trữ lịch sử'
      ]
    },
    {
      id: "premium-plan",
      subscription: "PREMIUM",
      price: 200000,
      weekly_credit: 500,
      features: [
        '500 credit/tuần',
        'Phân tích chính xác cao',
        'Lưu trữ lịch sử',
        'Ưu tiên xử lý'
      ]
    },
    {
      id: "pro-plan",
      subscription: "PRO",
      price: 500000,
      weekly_credit: 1000,
      features: [
        '1000 credit/tuần',
        'Phân tích chính xác cao',
        'Lưu trữ lịch sử',
        'Ưu tiên xử lý',
        'API riêng'
      ]
    }
  ]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCurrentPlan();
  }, []);

  const loadCurrentPlan = async () => {
    try {
      if (!isLoggedIn) {
        setLoading(false);
        return;
      }

      const response = await userAPI.getUserById(user.id);
      if (response.data && response.data.value) {
        setCurrentPlan(response.data.value.subscription);
      }
    } catch (error) {
      console.error('Failed to load current plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  const handleUpgrade = async (planId) => {
    try {
      console.log('Upgrading to plan:', planId);
      // Find the selected plan
      const selectedPlan = plans.find(plan => plan.id === planId);
      if (!selectedPlan) {
        throw new Error('Plan not found');
      }

      console.log('Selected plan:', selectedPlan);
      const paymentUrl = await paymentAPI.createPayment({
        planId: planId,
        userId: user.id,
        amount: selectedPlan.price,
        language: "vn",
        subscription_plan: selectedPlan.subscription,
        returnUrl: "http://localhost:3000/payment/return" // Frontend return URL
      });

      console.log('Payment URL:', paymentUrl);
      // Redirect to payment URL
      window.location.href = paymentUrl;
    } catch (error) {
      console.error('Failed to process payment:', error);
      setError('Failed to process payment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="plan-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="plan-container">
      <button className="close-btn" onClick={handleClose}>
        <img src="/icons/close.svg" alt="Close" />
      </button>

      <div className="plan-header">
        <h1>Chọn gói dịch vụ phù hợp</h1>
        <p>Nâng cấp để trải nghiệm đầy đủ tính năng</p>
      </div>

      <div className="plans-grid">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`plan-card ${currentPlan === plan.subscription ? 'current' : ''} ${plan.subscription.toLowerCase()}`}
          >
            <div className="plan-header">
              <h2>{plan.subscription}</h2>
              <div className="plan-price">
                {plan.price === 0 ? (
                  'Miễn phí'
                ) : (
                  <>
                    <span className="price">{plan.price.toLocaleString()}</span>
                    <span className="period">đ/tháng</span>
                  </>
                )}
              </div>
            </div>

            <div className="plan-features">
              <ul>
                {plan.features.map((feature, index) => (
                  <li key={index}>
                    <img src="/icons/check.svg" alt="Check" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button
              className={`upgrade-btn ${currentPlan === plan.subscription ? 'current' : ''}`}
              onClick={() => handleUpgrade(plan.id)}
              disabled={
                processingPayment || 
                currentPlan === plan.subscription || 
                (plan.subscription === 'FREE' && (currentPlan === 'PREMIUM' || currentPlan === 'PRO'))
              }
            >
              {processingPayment ? (
                <span className="loading-text">Đang xử lý...</span>
              ) : currentPlan === plan.subscription ? (
                'Gói hiện tại'
              ) : plan.price === 0 ? (
                'Miễn phí'
              ) : (
                'Nâng cấp ngay'
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="plan-footer">
        <p>Liên hệ hỗ trợ: support@imageai.com</p>
      </div>
    </div>
  );
};

export default Plan; 