import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Plans from './pages/Plans';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import PrivateRoute from './components/PrivateRoute';
import Plan from './pages/Plan';
import PaymentReturn from './pages/PaymentReturn';
import Profile from './pages/Profile';
import './styles/main.scss';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/plans" element={<PrivateRoute><Plans /></PrivateRoute>} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />
            <Route path="/payment/return" element={<PaymentReturn />} />
            <Route path="/api/v1/payment/vnpay/return-url" element={<PaymentReturn />} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
