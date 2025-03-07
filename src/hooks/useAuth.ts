import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { authAtom } from '../store/auth';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const [auth, setAuth] = useAtom(authAtom);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !auth.isAuthenticated) {
      // Validate token and set auth state
      setAuth({
        token,
        isAuthenticated: true,
        user: null, // You might want to fetch user details here
      });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({
      token: null,
      user: null,
      isAuthenticated: false,
    });
    navigate('/login');
  };

  return { auth, logout };
}