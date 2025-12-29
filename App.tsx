
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole, MenuItem, Transaction, Category } from './types';
import { INITIAL_MENUS, INITIAL_CATEGORIES, USERS } from './constants';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import PointOfSale from './views/PointOfSale';
import MenuManagement from './views/MenuManagement';
import Reports from './views/Reports';
import Layout from './components/Layout';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pos_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [menus, setMenus] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('pos_menus');
    return saved ? JSON.parse(saved) : INITIAL_MENUS;
  });

  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('pos_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('pos_menus', JSON.stringify(menus));
  }, [menus]);

  useEffect(() => {
    localStorage.setItem('pos_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleLogin = (username: string) => {
    const user = USERS.find(u => u.username === username);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('pos_user', JSON.stringify(user));
    } else {
      alert('Username tidak ditemukan! Gunakan admin atau kasir1');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pos_user');
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
    // Update stock
    setMenus(prevMenus => 
      prevMenus.map(menu => {
        const cartItem = transaction.items.find(item => item.id === menu.id);
        if (cartItem) {
          return { ...menu, stock: menu.stock - cartItem.quantity };
        }
        return menu;
      })
    );
  };

  const updateMenu = (updatedMenu: MenuItem) => {
    setMenus(prev => prev.map(m => m.id === updatedMenu.id ? updatedMenu : m));
  };

  const deleteMenu = (id: string) => {
    setMenus(prev => prev.filter(m => m.id !== id));
  };

  const addMenu = (newMenu: MenuItem) => {
    setMenus(prev => [...prev, newMenu]);
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={!currentUser ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        
        <Route element={currentUser ? <Layout user={currentUser} onLogout={handleLogout} /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard transactions={transactions} menus={menus} />} />
          <Route path="/pos" element={<PointOfSale user={currentUser!} menus={menus} onSave={addTransaction} />} />
          <Route path="/history" element={<Reports transactions={transactions} user={currentUser!} viewType="history" />} />
          <Route path="/reports" element={
            currentUser?.role === UserRole.ADMIN 
              ? <Reports transactions={transactions} user={currentUser} viewType="report" /> 
              : <Navigate to="/" />
          } />
          <Route path="/menus" element={
            currentUser?.role === UserRole.ADMIN 
              ? <MenuManagement menus={menus} categories={categories} onUpdate={updateMenu} onDelete={deleteMenu} onAdd={addMenu} /> 
              : <Navigate to="/" />
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
