
import React, { useMemo } from 'react';
import { Transaction, MenuItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
  menus: MenuItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, menus }) => {
  const today = new Date().toLocaleDateString('id-ID');
  
  const stats = useMemo(() => {
    const todayTransactions = transactions.filter(t => 
      new Date(t.timestamp).toLocaleDateString('id-ID') === today
    );

    const revenue = todayTransactions.reduce((acc, t) => acc + t.total, 0);
    const activeMenuCount = menus.filter(m => m.status === 'aktif').length;

    // Calculate top menu
    const menuCounts: Record<string, number> = {};
    todayTransactions.forEach(t => {
      t.items.forEach(item => {
        menuCounts[item.name] = (menuCounts[item.name] || 0) + item.quantity;
      });
    });

    let topMenuName = 'N/A';
    let maxQty = 0;
    Object.entries(menuCounts).forEach(([name, qty]) => {
      if (qty > maxQty) {
        maxQty = qty;
        topMenuName = name;
      }
    });

    return {
      revenue,
      count: todayTransactions.length,
      activeMenus: activeMenuCount,
      topMenu: topMenuName
    };
  }, [transactions, menus, today]);

  const chartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      const dailyTransactions = transactions.filter(t => 
        new Date(t.timestamp).toLocaleDateString('id-ID') === d.toLocaleDateString('id-ID')
      );
      return {
        name: dateStr,
        omzet: dailyTransactions.reduce((acc, t) => acc + t.total, 0)
      };
    });
    return last7Days;
  }, [transactions]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const StatBox = ({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center transition-transform hover:translate-y-[-4px]">
      <div className={`${color} w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg mr-4`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Selamat datang di panel kendali POS Resto Pro.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center">
          <i className="fas fa-calendar-alt text-indigo-500 mr-3"></i>
          <span className="font-semibold">{today}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatBox title="Omzet Hari Ini" value={formatCurrency(stats.revenue)} icon="fa-wallet" color="bg-emerald-500" />
        <StatBox title="Transaksi Hari Ini" value={stats.count} icon="fa-shopping-cart" color="bg-blue-500" />
        <StatBox title="Menu Terlaris" value={stats.topMenu} icon="fa-star" color="bg-amber-500" />
        <StatBox title="Menu Aktif" value={stats.activeMenus} icon="fa-utensils" color="bg-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 flex items-center">
            <i className="fas fa-chart-bar text-indigo-600 mr-2"></i> Grafik Omzet 7 Hari Terakhir
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `Rp ${value/1000}k`} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Omzet']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="omzet" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 6 ? '#4f46e5' : '#818cf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 flex items-center">
            <i className="fas fa-history text-indigo-600 mr-2"></i> Transaksi Terbaru
          </h3>
          <div className="space-y-4">
            {transactions.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                    <i className="fas fa-receipt"></i>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{t.orderNumber}</p>
                    <p className="text-xs text-gray-500">{new Date(t.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-indigo-600">{formatCurrency(t.total)}</p>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <i className="fas fa-inbox text-4xl mb-2"></i>
                <p>Belum ada transaksi</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
