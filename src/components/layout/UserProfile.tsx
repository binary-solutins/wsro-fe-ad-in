import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { authAtom } from '../../store/auth';
import { LogOut } from 'lucide-react';

interface UserProfileProps {
  user: any; // Replace with your user type
}

export default function UserProfile({ user }: UserProfileProps) {
  const [, setAuth] = useAtom(authAtom);
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuth({ token: null, user: null, isAuthenticated: false });
    navigate('/login');
  };

  return (
    <div className="px-3 mt-6">
      <div className="p-4 rounded-xl bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <span className="text-white font-medium text-lg">
              {user?.name?.[0] || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'User'}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}