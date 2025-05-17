import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import { useDispatch } from 'react-redux';
import {setAuthUser} from '../app/features/auth/authSlice';

const GoogleLoginButton = () => {
  const [isButtonRendered, setIsButtonRendered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();


  useEffect(() => {
    // Function to initialize Google Sign-In
    const initializeGoogleSignIn = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        console.error("Google Client ID is missing. Check your environment variables.");
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
      });

      const buttonContainer = document.getElementById('googleSignInDiv');
      if (buttonContainer) {
        window.google.accounts.id.renderButton(
          buttonContainer,
          { 
            theme: 'outline', 
            size: 'large', 
            text: 'signin_with', 
            shape: 'rectangular',
            width: 250,
          }
        );
        setIsButtonRendered(true);
      }
    };

    // Check if Google script is already loaded
    if (window.google && window.google.accounts && window.google.accounts.id) {
      initializeGoogleSignIn();
    } else {
      // Load script dynamically if not already loaded
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    }
  }, []);

  const handleCredentialResponse = async (response) => {
    if (!response.credential) return;
    
    setIsLoading(true);

    try {
      const { data } = await axiosInstance.post('/auth/google', { 
        token: response.credential 
      });

      dispatch(setAuthUser(data?.user?.role));

      console.log("Google login response:", data);
      navigate('/home')
      
      
      // Navigate to home page after successful login
    //   navigate('/home');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="google-login-container flex justify-center">
      <div id="googleSignInDiv" ></div>
      
      {isLoading && (
        <div className="loading-indicator" style={{ marginTop: '10px' }}>
          Authenticating...
        </div>
      )}
      
      {!isButtonRendered && !isLoading && (
        <div className='mt-4'>
          Loading Google Sign-In...
        </div>
      )}
    </div>
  );
};

export default GoogleLoginButton;