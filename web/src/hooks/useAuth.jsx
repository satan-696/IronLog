// web/src/hooks/useAuth.jsx
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import DataService from '../services/dataService.js';

const TOKEN_KEY = 'ironlog_token';
const USER_KEY  = 'ironlog_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Persist auth to localStorage
  const persist = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const clear = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // On mount: restore from localStorage and verify
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedToken) { setLoading(false); return; }

    setToken(savedToken);
    DataService.verifyToken()
      .then(({ user }) => setUser(user))
      .catch(() => clear())
      .finally(() => setLoading(false));
  }, [clear]);

  const login = useCallback(async (username, password) => {
    setError(null);
    try {
      const { token, user } = await DataService.login(username, password);
      persist(token, user);
      return user;
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setError(null);
    try {
      const { token, user } = await DataService.register(userData);
      persist(token, user);
      return user;
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(() => clear(), [clear]);

  const updateMe = useCallback(async (data) => {
    try {
      const updated = await DataService.updateMe(data);
      setUser(updated);
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    } catch (err) {
      console.error('Update failed:', err);
      throw err;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, updateMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
