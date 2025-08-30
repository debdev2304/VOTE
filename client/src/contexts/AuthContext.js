import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/auth/me');
          setUser(response.data.user);
          setRole(response.data.role);
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (credential, userType) => {
    try {
      let response;
      
      if (userType === 'admin') {
        // For admin, credential should be the token from OTP verification
        if (typeof credential === 'string' && credential.length > 50) {
          // This is a JWT token from OTP verification
          setToken(credential);
          setUser(null); // Will be set by the auth check
          setRole('admin');
          localStorage.setItem('token', credential);
          return { success: true };
        } else {
          throw new Error('Invalid admin login flow');
        }
      } else {
        // For voters, credential is the name
        response = await axios.post('/api/auth/voter/login', {
          name: credential
        });
        
        const { token: newToken, user: userData } = response.data;
        
        setToken(newToken);
        setUser(userData);
        setRole('voter');
        localStorage.setItem('token', newToken);
        
        return { success: true };
      }
      
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const verifyAccount = async (type, token) => {
    try {
      const response = await axios.get(`/api/auth/verify/${type}/${token}`);
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      setRole(type);
      localStorage.setItem('token', newToken);
      
      toast.success(response.data.message);
      return { success: true };
      
    } catch (error) {
      const message = error.response?.data?.error || 'Verification failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    role,
    loading,
    token,
    login,
    logout,
    verifyAccount,
    isAuthenticated: !!user,
    isAdmin: role === 'admin',
    isVoter: role === 'voter'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
