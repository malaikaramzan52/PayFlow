import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import ErpLayout from './components/ErpLayout';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {currentUser ? (
        <ErpLayout user={currentUser} onLogout={handleLogout} />
      ) : (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}