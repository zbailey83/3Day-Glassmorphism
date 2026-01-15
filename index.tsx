import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { GamificationProvider } from './contexts/GamificationContext';
import { useAuth } from './hooks/useAuth';

// Wrapper component to access auth context for GamificationProvider
const AppWithProviders: React.FC = () => {
  const { user } = useAuth();

  return (
    <GamificationProvider userId={user?.uid || null}>
      <App />
    </GamificationProvider>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <AppWithProviders />
    </AuthProvider>
  </React.StrictMode>
);