
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { User, UserRole } from '../types';

interface LayoutProps {
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'fa-tachometer-alt', roles: [UserRole.ADMIN, UserRole.KASIR] },
    { path: '/pos', label: 'Kasir', icon: 'fa-cash-register', roles: [UserRole.ADMIN, UserRole.KASIR] },
    { path: '/history', label: 'Riwayat', icon: 'fa-history', roles: [UserRole.ADMIN, UserRole.KASIR] },
    { path: '/menus', label: 'Manajemen Menu', icon: 'fa-utensils', roles: [UserRole.ADMIN] },
    { path: '/reports', label: 'Laporan', icon: 'fa-chart-line', roles: [UserRole.ADMIN] },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-indigo-800 text-white flex flex-col no-print`}>
        <div className="p-4 flex items-center justify-between border-b border-indigo-700">
          <span className={`font-bold text-xl truncate ${!isSidebarOpen && 'hidden'}`}>POS Resto</span>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-indigo-700 rounded text-indigo-100">
            <i className={`fas ${isSidebarOpen ? 'fa-angle-left' : 'fa-bars'}`}></i>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto mt-4 px-2">
          {navItems.filter(item => item.roles.includes(user.role)).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center p-3 mb-2 rounded-lg transition-colors ${
                location.pathname === item.path ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
              }`}
            >
              <div className="w-10 flex justify-center text-lg">
                <i className={`fas ${item.icon}`}></i>
              </div>
              {isSidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-indigo-700">
          {isSidebarOpen && (
            <div className="mb-4 px-2">
              <p className="text-xs text-indigo-300 uppercase font-semibold">User Login</p>
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-xs bg-indigo-600 inline-block px-2 py-0.5 rounded mt-1">{user.role}</p>
            </div>
          )}
          <button
            onClick={onLogout}
            className="w-full flex items-center p-3 text-red-200 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
          >
            <div className="w-10 flex justify-center text-lg">
              <i className="fas fa-sign-out-alt"></i>
            </div>
            {isSidebarOpen && <span className="ml-3 font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
