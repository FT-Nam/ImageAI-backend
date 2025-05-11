import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { paymentAPI } from '../services/api';
import '../styles/payment.scss';

const PaymentReturn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const handlePaymentReturn = async () => {
      try {
        // Get URL parameters
        const searchParams = new URLSearchParams(location.search);
        const vnpResponseCode = searchParams.get('vnp_ResponseCode');
        const vnpTransactionStatus = searchParams.get('vnp_TransactionStatus');
        const vnpAmount = searchParams.get('vnp_Amount');
        const vnpOrderInfo = searchParams.get('vnp_OrderInfo');
        const vnpTxnRef = searchParams.get('vnp_TxnRef');
        const vnpSecureHash = searchParams.get('vnp_SecureHash');

        // Create sorted parameters object
        const params = {
          vnp_Amount: vnpAmount,
          vnp_BankCode: searchParams.get('vnp_BankCode'),
          vnp_BankTranNo: searchParams.get('vnp_BankTranNo'),
          vnp_CardType: searchParams.get('vnp_CardType'),
          vnp_OrderInfo: vnpOrderInfo,
          vnp_PayDate: searchParams.get('vnp_PayDate'),
          vnp_ResponseCode: vnpResponseCode,
          vnp_TmnCode: searchParams.get('vnp_TmnCode'),
          vnp_TransactionNo: searchParams.get('vnp_TransactionNo'),
          vnp_TransactionStatus: vnpTransactionStatus,
          vnp_TxnRef: vnpTxnRef
        };

        // Debug logs
        console.log('VNPay Parameters:', {
          params,
          vnpSecureHash,
          fullUrl: window.location.href,
          searchString: location.search,
          // Log each parameter separately
          vnpAmount,
          vnpOrderInfo,
          vnpResponseCode,
          vnpTransactionStatus,
          vnpTxnRef
        });

        // Call API to verify payment
        const response = await paymentAPI.paymentReturnUrl({
          vnp_ResponseCode: vnpResponseCode,
          vnp_TransactionStatus: vnpTransactionStatus,
          vnp_Amount: vnpAmount,
          vnp_OrderInfo: vnpOrderInfo,
          vnp_TxnRef: vnpTxnRef,
          vnp_SecureHash: vnpSecureHash,
          // Add all other parameters
          vnp_BankCode: searchParams.get('vnp_BankCode'),
          vnp_BankTranNo: searchParams.get('vnp_BankTranNo'),
          vnp_CardType: searchParams.get('vnp_CardType'),
          vnp_PayDate: searchParams.get('vnp_PayDate'),
          vnp_TmnCode: searchParams.get('vnp_TmnCode'),
          vnp_TransactionNo: searchParams.get('vnp_TransactionNo')
        });

        // Debug log API response
        console.log('Payment API Response:', response?.data);

        // Check if payment was successful based on the API response
        if (response?.data?.code === 1000 && response?.data?.value?.success) {
          setStatus('success');
          // Redirect to success page after 2 seconds
          setTimeout(() => {
            navigate('/payment/success', { 
              state: { 
                transactionCode: response.data.value.transactionCode,
                message: response.data.value.message
              }
            });
          }, 2000);
        } else {
          setStatus('failed');
          // Redirect to failure page after 2 seconds
          setTimeout(() => {
            navigate('/payment/fail', { 
              state: { 
                message: response?.data?.value?.message || 'Thanh toán thất bại'
              }
            });
          }, 2000);
        }
      } catch (error) {
        console.error('Payment return error:', error);
        setStatus('failed');
        // Redirect to failure page after 2 seconds
        setTimeout(() => {
          navigate('/payment/fail', { 
            state: { 
              message: 'Có lỗi xảy ra trong quá trình xử lý thanh toán'
            }
          });
        }, 2000);
      }
    };

    handlePaymentReturn();
  }, [navigate, location]);

  return (
    <div className="payment-return-container">
      <div className="payment-status">
        {status === 'processing' && (
          <>
            <div className="loading-spinner"></div>
            <h2>Đang xử lý thanh toán...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="success-icon">✓</div>
            <h2>Thanh toán thành công!</h2>
            <p>Đang chuyển hướng...</p>
          </>
        )}
        {status === 'failed' && (
          <>
            <div className="error-icon">✕</div>
            <h2>Thanh toán thất bại</h2>
            <p>Đang chuyển hướng...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentReturn; 