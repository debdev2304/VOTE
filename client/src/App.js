import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import VoterDashboard from './pages/VoterDashboard';
import EventVoting from './pages/EventVoting';
import EventResults from './pages/EventResults';
import VerifyAccount from './pages/VerifyAccount';
import PublicEvent from './pages/PublicEvent';
import PublicResults from './pages/PublicResults';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { loading, isAuthenticated, isAdmin, isVoter } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/verify/:type/:token" element={<VerifyAccount />} />
        <Route path="/vote/:votingUrl" element={<PublicEvent />} />
        <Route path="/results/:votingUrl" element={<PublicResults />} />
        
        {/* Protected admin routes */}
        <Route 
          path="/admin/*" 
          element={isAuthenticated && isAdmin ? <AdminDashboard /> : <Navigate to="/login" />} 
        />
        
        {/* Protected voter routes */}
        <Route 
          path="/voter/*" 
          element={isAuthenticated && isVoter ? <VoterDashboard /> : <Navigate to="/login" />} 
        />
        
        {/* Event voting route */}
        <Route 
          path="/event/:eventId" 
          element={isAuthenticated && isVoter ? <EventVoting /> : <Navigate to="/login" />} 
        />
        
        {/* Event results route */}
        <Route 
          path="/event/:eventId/results" 
          element={isAuthenticated ? <EventResults /> : <Navigate to="/login" />} 
        />
        
        {/* Default redirect */}
        <Route 
          path="/" 
          element={
            isAuthenticated 
              ? (isAdmin ? <Navigate to="/admin" /> : <Navigate to="/voter" />)
              : <Navigate to="/login" />
          } 
        />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
