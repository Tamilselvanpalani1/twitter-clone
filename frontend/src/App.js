import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/login/LoginPage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/RightPanel';
import NotificationPage from './pages/notification/NotificationPage';
import ProfilePage from './pages/profile/ProfiePage';
import { Toaster} from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
        <div className="App flex w-full mx-auto" data-theme="dark">
          <Sidebar />
          <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/notifications" element={<NotificationPage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
            </Routes>
          <RightPanel />
        </div>
    </>
  );
}

export default App; 