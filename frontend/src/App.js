import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/login/LoginPage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/RightPanel';
import NotificationPage from './pages/notification/NotificationPage';
import ProfilePage from './pages/profile/ProfiePage';
import { Toaster } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { baseUrl } from './constant/url';
import LoadingSpinner from './components/common/LoadingSpinner';

// useQuery - Runs automatically when the component mounts, if anything needs to be change
// useMutation - Runs only when you manually call mutate(), Does not run automatically
function App() {
  const {data :authUser, isLoading} = useQuery({ 
    queryKey: ['authUser'], // Changed from 'currentUser' to 'authUser' for consistency
    queryFn: async () => { // Fetch current authenticated user
      try {
        const res = await fetch(`${baseUrl}/api/auth/me`, {
          method: "GET",
          credentials: 'include', // to include cookies in the request
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        //used for route to the login page once user logged out
        if(data.error){
          return null //apply value as null for authUser - once user logged out cookie will delete and ternary operator will perform correctly on the Routing part based on null value. 
        }
        if (!res.ok) throw new Error(data.error || "Failed to fetch user");
        console.log("Auth user:", data);
        
        return data;
      } catch (error) {
        throw error;
      } 
    },
    return: false
  })
  console.log(authUser);
  

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        {/* // Show loading spinner while fetching user data */}
        <LoadingSpinner size="lg" /> 
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
        <div className="App flex w-full mx-auto" data-theme="dark">
          {authUser && <Sidebar />}
          <Routes>
              {/* <Navigate /> - component provided by React Router that lets you redirect users */}
              <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login"/> } />
              <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/"/> } /> {/* // Redirect to home page if already logged in*/}
              <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/"/> } />
              <Route path="/notifications" element={authUser ? <NotificationPage /> : <Navigate to="/login"/> } />
              <Route path="/profile/:username" element={authUser ? <ProfilePage /> : <Navigate to="/login"/> } />
            </Routes>
          {authUser && <RightPanel />}
        </div>
    </>
  );
}

export default App;
 
