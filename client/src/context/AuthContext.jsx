import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isDemo, setIsDemo] = useState(false);

  const mockLogin = () => {
    setUser({ id: 1, name: 'Invitado Demo', email: 'demo@example.com', role: 'guest' });
    setIsDemo(true);
  };

  const register = async (userData) => {
    try {
      await axios.post('http://localhost:5000/auth/register', userData);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Error al registrar' };
    }
  };

  const login = async (username, password) => {
    try {
      const res = await axios.post('http://localhost:5000/auth/login', { username, password }, { withCredentials: true });
      if (res.data.success) {
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Error al ingresar' };
    }
  };

  const checkAuth = async () => {
    if (isDemo) return;
    try {
      const res = await axios.get('http://localhost:5000/auth/user', { withCredentials: true });
      if (res.data.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const loginWithGoogle = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  const logout = async () => {
    if (isDemo) {
      setUser(null);
      setIsDemo(false);
      return;
    }
    try {
      await axios.post('http://localhost:5000/auth/logout', {}, { withCredentials: true });
      setUser(null);
    } catch (err) {
      console.error('Logout failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, mockLogin, isDemo, login, register }}>
      {children}
    </AuthContext.Provider>
  );
};
