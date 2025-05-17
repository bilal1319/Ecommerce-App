import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import { useDispatch } from 'react-redux';
import { setAuthUser } from '../app/features/auth/authSlice';

const GoogleLoginButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef(null);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleCredentialResponse = async (response) => {
    // Clear any pending timeouts when we get a response
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (!response.credential) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await axiosInstance.post('/auth/google', {
        token: response.credential,
      });

      dispatch(setAuthUser(data?.user?.role));
      console.log('Google login response:', data);
      navigate('/home');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for messages from the popup window
  useEffect(() => {
    const handleMessage = (event) => {
      // This will catch if Google returns any postMessage events
      // Many browsers will send a message when popups are closed
      if (event.data === 'google-auth-closed' || 
          (typeof event.data === 'object' && event.data?.type === 'dialogClosed')) {
        setIsLoading(false);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error('Google Client ID is missing.');
      return;
    }

    // Load the Google Sign-In script if not already loaded
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Initialize Google Sign-In
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          cancel_on_tap_outside: true,
        });
        
        // Render the hidden Google button immediately
        renderGoogleButton();
      };
      document.body.appendChild(script);
    } else {
      // Google Sign-In already loaded, just initialize and render
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        cancel_on_tap_outside: true,
      });
      
      // Render the hidden Google button immediately
      renderGoogleButton();
    }
    
    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Function to render the hidden Google button
  const renderGoogleButton = () => {
    if (buttonRef.current && window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 250
      });
    }
  };

  const handleLoginClick = () => {
    setIsLoading(true);
    
    try {
      // Simply click the hidden Google button programmatically
      const googleButton = buttonRef.current.querySelector('[role="button"]');
      if (googleButton) {
        googleButton.click();
        
        // Set a safety timeout to reset the button if no response is received
        // This handles cases where the user closes the popup without signing in
        timeoutRef.current = setTimeout(() => {
          console.log('No response from Google Sign-In - resetting button');
          setIsLoading(false);
          timeoutRef.current = null;
        }, 3000);
      } else {
        console.error('Google button element not found');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error triggering Google Sign-In:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Custom styled button that triggers the hidden Google button */}
      <button
        onClick={handleLoginClick}
        disabled={isLoading}
        className="flex items-center justify-center gap-3 bg-white text-gray-700 font-medium rounded-[25px] px-4 py-2 w-64 border border-gray-300 shadow-sm hover:shadow transition-all duration-200 disabled:opacity-75"
      >
        {!isLoading ? (
          <>
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
            <span>Sign in with Google</span>
          </>
        ) : (
          <span>Signing in...</span>
        )}
      </button>
      
      {/* Hidden container for the actual Google button */}
      <div 
        ref={buttonRef} 
        className="hidden"
      ></div>
    </div>
  );
};

export default GoogleLoginButton;