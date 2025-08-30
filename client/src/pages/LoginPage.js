import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Vote, Shield, Mail, Lock, User, Plus } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [userType, setUserType] = useState('voter');
  const [adminMode, setAdminMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (userType === 'admin' && adminMode === 'register') {
        // Handle admin registration
        const response = await axios.post('/api/auth/admin/register', {
          email,
          password,
          name
        });
        
        toast.success(response.data.message);
        setLoading(false);
        // Reset form
        setEmail('');
        setPassword('');
        setName('');
        setAdminMode('login');
      } else {
        // Handle login
        const result = await login(email, userType === 'admin' ? password : name, userType);
        
        if (!result.success && !result.requiresVerification) {
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
          {userType === 'admin' && (
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

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Field (for admin registration) */}
            {userType === 'admin' && adminMode === 'register' && (
              <div>
                <label htmlFor="name" className="label">
                  <User className="inline h-4 w-4 mr-1" />
                  Full Name
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
                  placeholder="Enter your full name"
                />
              </div>
            )}

            {/* Email Field */}
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

            {/* Password/Name Field */}
            <div>
              <label htmlFor="credential" className="label">
                {userType === 'admin' ? (
                  <>
                    <Lock className="inline h-4 w-4 mr-1" />
                    Password
                  </>
                ) : (
                  <>
                    <User className="inline h-4 w-4 mr-1" />
                    Full Name
                  </>
                )}
              </label>
              <input
                id="credential"
                name="credential"
                type={userType === 'admin' ? 'password' : 'text'}
                autoComplete={userType === 'admin' ? 'current-password' : 'name'}
                required
                value={userType === 'admin' ? password : name}
                onChange={(e) => userType === 'admin' ? setPassword(e.target.value) : setName(e.target.value)}
                className="input"
                placeholder={userType === 'admin' ? 'Enter your password' : 'Enter your full name'}
              />
            </div>

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
                    {userType === 'admin' && adminMode === 'register' ? 'Register as Admin' : 
                     userType === 'admin' ? 'Sign In' : 'Continue'}
                    {userType === 'voter' && <Mail className="ml-2 h-4 w-4" />}
                    {userType === 'admin' && adminMode === 'register' && <Plus className="ml-2 h-4 w-4" />}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Info Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {userType === 'admin' && adminMode === 'register' ? (
                'Admin registration requires approval from debtanu.operations.script@gmail.com'
              ) : userType === 'admin' ? (
                'Admin login requires email verification'
              ) : (
                'Voter login will send a verification email to your address'
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
              <Mail className="h-4 w-4 mr-2 text-primary-600" />
              Email Verification
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
