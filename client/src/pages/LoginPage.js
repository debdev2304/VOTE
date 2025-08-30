import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Vote, Shield, Mail, Lock, User, Plus, Key } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [userType, setUserType] = useState('voter');
  const [adminMode, setAdminMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (userType === 'admin') {
        if (adminMode === 'register') {
          // Handle admin registration
          const response = await axios.post('/api/auth/admin/register', {
            email,
            name
          });
          
          toast.success(response.data.message);
          setShowOtpInput(true);
          setLoading(false);
        } else if (showOtpInput) {
          // Handle OTP verification
          const response = await axios.post('/api/auth/admin/verify-otp', {
            email,
            otp
          });
          
          if (response.data.token) {
            login(response.data.token, 'admin');
            toast.success('Admin login successful!');
          }
        } else {
          // Handle admin login (first step - send OTP)
          const response = await axios.post('/api/auth/admin/login', {
            email
          });
          
          if (response.data.requiresOTP) {
            setShowOtpInput(true);
            toast.success(response.data.message);
          }
          setLoading(false);
        }
      } else {
        // Handle voter login (simplified)
        const result = await login(name, 'voter');
        
        if (result.success) {
          toast.success('Voter login successful!');
        } else {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.error || 'An error occurred';
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowOtpInput(false);
    setOtp('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <Vote className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Voting System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Secure and transparent voting platform
          </p>
        </div>

        <div className="card">
          {/* User Type Selection */}
          <div className="flex rounded-lg border border-gray-200 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setUserType('voter');
                setAdminMode('login');
                setShowOtpInput(false);
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                userType === 'voter'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <User className="inline h-4 w-4 mr-2" />
              Voter
            </button>
            <button
              type="button"
              onClick={() => {
                setUserType('admin');
                setAdminMode('login');
                setShowOtpInput(false);
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                userType === 'admin'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <Shield className="inline h-4 w-4 mr-2" />
              Admin
            </button>
          </div>

          {/* Admin Mode Selection */}
          {userType === 'admin' && !showOtpInput && (
            <div className="flex rounded-lg border border-gray-200 p-1 mb-6">
              <button
                type="button"
                onClick={() => setAdminMode('login')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  adminMode === 'login'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <Lock className="inline h-4 w-4 mr-2" />
                Login
              </button>
              <button
                type="button"
                onClick={() => setAdminMode('register')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  adminMode === 'register'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <Plus className="inline h-4 w-4 mr-2" />
                Register
              </button>
            </div>
          )}

          {/* OTP Input */}
          {showOtpInput && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center mb-2">
                <Key className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">Enter OTP</span>
              </div>
              <p className="text-xs text-blue-600 mb-2">
                Check debtanu.operations.script@gmail.com for the OTP
              </p>
              <p className="text-xs text-orange-600 mb-2">
                💡 <strong>Development:</strong> Check the server console for OTP
              </p>
              <p className="text-xs text-green-600 mb-3">
                🔑 <strong>Fixed Code:</strong> Use "2004" for instant access
              </p>
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                ← Back to login
              </button>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Field (for admin registration or voter login) */}
            {(userType === 'admin' && adminMode === 'register') || userType === 'voter' ? (
              <div>
                <label htmlFor="name" className="label">
                  <User className="inline h-4 w-4 mr-1" />
                  {userType === 'voter' ? 'Full Name' : 'Full Name'}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder={userType === 'voter' ? 'Enter your full name' : 'Enter your full name'}
                />
              </div>
            ) : null}

            {/* Email Field (for admin) */}
            {userType === 'admin' && (
              <div>
                <label htmlFor="email" className="label">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="Enter your email"
                />
              </div>
            )}

            {/* OTP Field */}
            {showOtpInput && (
              <div>
                <label htmlFor="otp" className="label">
                  <Key className="inline h-4 w-4 mr-1" />
                  OTP Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength="6"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="input text-center text-2xl tracking-widest"
                  placeholder="000000"
                />
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full flex justify-center items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    {showOtpInput ? 'Verify OTP' :
                     userType === 'admin' && adminMode === 'register' ? 'Register as Admin' : 
                     userType === 'admin' ? 'Send OTP' : 'Continue'}
                    {userType === 'voter' && <User className="ml-2 h-4 w-4" />}
                    {userType === 'admin' && adminMode === 'register' && <Plus className="ml-2 h-4 w-4" />}
                    {showOtpInput && <Key className="ml-2 h-4 w-4" />}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Info Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {showOtpInput ? (
                'Enter the OTP sent to debtanu.operations.script@gmail.com or use fixed code 2004'
              ) : userType === 'admin' && adminMode === 'register' ? (
                'Admin registration requires OTP verification'
              ) : userType === 'admin' ? (
                'Admin login requires OTP verification'
              ) : (
                'Voter login - just enter your name to continue'
              )}
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Features</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center justify-center">
              <Shield className="h-4 w-4 mr-2 text-primary-600" />
              Secure Voting
            </div>
            <div className="flex items-center justify-center">
              <Vote className="h-4 w-4 mr-2 text-primary-600" />
              Real-time Results
            </div>
            <div className="flex items-center justify-center">
              <Key className="h-4 w-4 mr-2 text-primary-600" />
              OTP Verification
            </div>
            <div className="flex items-center justify-center">
              <User className="h-4 w-4 mr-2 text-primary-600" />
              User Management
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
