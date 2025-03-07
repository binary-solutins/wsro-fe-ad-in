import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { authAtom } from '../store/auth';
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  CreditCard, 
  ScrollText, 
  Settings,
  LogOut
} from 'lucide-react';

export default function Layout() {
  const [auth, setAuth] = useAtom(authAtom);
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuth({ token: null, user: null, isAuthenticated: false });
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-indigo-600">Admin Panel</h1>
          </div>
          <nav className="mt-8">
            <NavLink to="/" icon={<LayoutDashboard />} text="Dashboard" />
            <NavLink to="/competitions" icon={<Trophy />} text="Competitions" />
            <NavLink to="/registrations" icon={<Users />} text="Registrations" />
            <NavLink to="/payments" icon={<CreditCard />} text="Payments" />
            <NavLink to="/certificates" icon={<ScrollText />} text="Certificates" />
            <NavLink to="/settings" icon={<Settings />} text="Settings" />
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-6 py-3 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavLink({ to, icon, text }: { to: string; icon: React.ReactNode; text: string }) {
  return (
    <Link
      to={to}
      className="flex items-center px-6 py-3 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
    >
      <span className="w-5 h-5 mr-3">{icon}</span>
      {text}
    </Link>
  );
}