import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckCircle, 
  XCircle, 
  Mail, 
  Shield,
  ArrowRight
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const VerifyAccount = () => {
  const { type, token } = useParams();
  const { verifyAccount } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    handleVerification();
  }, [type, token]);

  const handleVerification = async () => {
    try {
      const result = await verifyAccount(type, token);
      
      if (result.success) {
        setStatus('success');
        setMessage('Account verified successfully! Redirecting...');
        
        // Redirect after a short delay
        setTimeout(() => {
          if (type === 'admin') {
            navigate('/admin');
          } else {
            navigate('/voter');
          }
        }, 2000);
      } else {
        setStatus('error');
        setMessage(result.error || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An unexpected error occurred during verification');
    }
  };

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <LoadingSpinner />
          <h2 className="text-xl font-semibold text-gray-900 mt-4">Verifying Account</h2>
          <p className="text-gray-600 mt-2">Please wait while we verify your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'success' ? (
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          ) : (
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          )}
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {status === 'success' ? 'Account Verified!' : 'Verification Failed'}
          </h2>
          
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>
        </div>

        <div className="card">
          <div className="space-y-4">
            {status === 'success' ? (
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  {type === 'admin' ? (
                    <Shield className="h-6 w-6 text-primary-600 mr-2" />
                  ) : (
                    <Mail className="h-6 w-6 text-primary-600 mr-2" />
                  )}
                  <span className="text-lg font-medium text-gray-900">
                    Welcome to the Voting System!
                  </span>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Your {type} account has been successfully verified. You can now access all features.
                </p>

                <div className="animate-pulse">
                  <div className="flex items-center justify-center text-primary-600">
                    <span className="mr-2">Redirecting</span>
                    <ArrowRight className="h-4 w-4 animate-bounce" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <XCircle className="h-6 w-6 text-red-600 mr-2" />
                  <span className="text-lg font-medium text-gray-900">
                    Verification Failed
                  </span>
                </div>
                
                <p className="text-gray-600 mb-6">
                  We couldn't verify your account. This could be due to an expired or invalid verification link.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="btn btn-primary w-full"
                  >
                    Return to Login
                  </button>
                  
                  <p className="text-sm text-gray-500">
                    If you continue to have issues, please contact support.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">What's Next?</h3>
          <div className="grid grid-cols-1 gap-4 text-sm text-gray-600">
            {type === 'admin' ? (
              <>
                <div className="flex items-center justify-center">
                  <Shield className="h-4 w-4 mr-2 text-primary-600" />
                  Create and manage voting events
                </div>
                <div className="flex items-center justify-center">
                  <Mail className="h-4 w-4 mr-2 text-primary-600" />
                  Monitor real-time voting statistics
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-primary-600" />
                  Manage voter accounts and permissions
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center">
                  <Mail className="h-4 w-4 mr-2 text-primary-600" />
                  Participate in active voting events
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-primary-600" />
                  View real-time voting results
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-primary-600" />
                  Track your voting history
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount;
