import React, { createContext, useState, useEffect, useCallback } from 'react';
import { message } from 'antd';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
  const [messageApi, contextHolder] = message.useMessage();
  const [warningShown, setWarningShown] = useState(false);

  const warning = useCallback((content) => {
    messageApi.open({
      type: "warning",
      content: content,
      duration: 3,
    });
  }, [messageApi]);

  const verifyToken = useCallback((token) => {
    if (!token) return false;
    
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return false;
      
      const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson);
      
      const currentTime = Math.floor(Date.now() / 1000); 
      
      if (payload.exp && payload.exp < currentTime) {
        return false;
      }
      
      return payload;
    } catch (error) {
      console.error('토큰 검증 에러:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setIsLoggedIn(false);
    setUserName('');
    setWarningShown(false);
  }, []);

  const checkAuth = useCallback(() => {
    if (authToken) {
      const payload = verifyToken(authToken);
      if (!payload) {
        if (isLoggedIn && !warningShown) {
          warning('세션이 만료되어 다시 로그인해주세요');
          setWarningShown(true);
          logout();
        }
        return false;
      }
      return true;
    }
    return false;
  }, [authToken, verifyToken, warning, logout, isLoggedIn, warningShown]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (authToken && !verifyToken(authToken)) {
        if (!warningShown) {
          warning('세션이 만료되어 다시 로그인해주세요');
          setWarningShown(true);
          logout();
        }
      }
    }, 1 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [authToken, warning, logout, verifyToken, warningShown]);

  useEffect(() => {
    if (authToken) {
      const payload = verifyToken(authToken);
      
      if (payload) {
        setIsLoggedIn(true);
        setUserName(payload.sub || '유저');
      } else {
        if (!warningShown) {
          warning('세션이 만료되어 다시 로그인해주세요');
          setWarningShown(true);
        }
        logout();
      }
    } else {
      setIsLoggedIn(false);
      setUserName('');
    }
  }, [authToken, verifyToken, logout, warning, warningShown]);

  const login = useCallback((token, name) => {
    localStorage.setItem('authToken', token);
    setAuthToken(token);
    setIsLoggedIn(true);
    setUserName(name);
    setWarningShown(false);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      userName, 
      authToken, 
      login, 
      logout,
      checkAuth 
    }}>
      {contextHolder}
      {children}
    </AuthContext.Provider>
  );
};