
import React, { useState, useMemo } from 'react';
import { Transaction, User, UserRole } from '../types';

interface ReportsProps {
  transactions: Transaction[];
  user: User;
  viewType: 'history' | 'report';
}

const Reports: React.FC<ReportsProps> = ({ transactions, user, viewType }) => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    let list = transactions.filter(t => {
      const date = t.timestamp.split('T')[0];
      return date >= startDate && date <= endDate;
    });

    if (viewType === 'history' && user.role === UserRole.KASIR) {
      list = list.filter(t => t.kasirId === user.id);
    }

    return list;
  }, [transactions, startDate, endDate, viewType, user]);

  const summary = useMemo(() => {
    return {
      totalRevenue: filteredTransactions.reduce((acc, t) => acc + t.total, 0),
      totalDiscount: filteredTransactions.reduce((acc, t) => acc + t.discount, 0),
      totalTransactions: filteredTransactions.length,
      avgOrderValue: filteredTransactions.length > 0 
        ? Math.round(filteredTransactions.reduce((acc, t) => acc + t.total, 0) / filteredTransactions.length) 
        : 0
    };
  }, [filteredTransactions]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{viewType === 'history' ? 'Riwayat Transaksi' : 'Laporan Penjualan'}</h1>
          <p className="text-gray-500">Filter data berdasarkan rentang waktu tertentu.</p>
        </div>
        <div className="flex items-center gap-3 no-print">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <i className="fas fa-calendar-alt text-indigo-500 mr-2"></i>
            <input
              type="date"
              className="outline-none text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="mx-2 text-gray-400">s/d</span>
            <input
              type="date"
              className="outline-none text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold shadow-md transition-all flex items-center"
          >
            <i className="fas fa-print mr-2"></i> Cetak
          </button>
        </div>
      </div>

      {viewType === 'report' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total Pendapatan</p>
            <p className="text-2xl font-black text-indigo-600">{formatCurrency(summary.totalRevenue)}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total Diskon</p>
            <p className="text-2xl font-black text-red-500">{formatCurrency(summary.totalDiscount)}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Jumlah Transaksi</p>
            <p className="text-2xl font-black text-gray-800">{summary.totalTransactions} Nota</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Rata-rata Nota</p>
            <p className="text-2xl font-black text-emerald-600">{formatCurrency(summary.avgOrderValue)}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Waktu</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">No. Transaksi</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Kasir</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Metode</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Total</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase no-print">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTransactions.map(t => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(t.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="px-6 py-4 font-bold text-gray-800">{t.orderNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{t.kasirName}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.paymentMethod === 'Tunai' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                    {t.paymentMethod}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-indigo-600">{formatCurrency(t.total)}</td>
                <td className="px-6 py-4 no-print">
                  <button
                    onClick={() => setSelectedTransaction(t)}
                    className="text-indigo-600 hover:text-indigo-800 font-bold text-sm flex items-center"
                  >
                    Lihat <i className="fas fa-chevron-right ml-1 text-xs"></i>
                  </button>
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                  <i className="fas fa-search-minus text-4xl mb-4 opacity-20"></i>
                  <p className="font-medium">Tidak ada transaksi ditemukan pada periode ini</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm no-print">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Detail Transaksi</h3>
              <button onClick={() => setSelectedTransaction(null)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <p className="text-gray-500 uppercase text-[10px] font-bold">Nomor Pesanan</p>
                  <p className="font-bold text-gray-800">{selectedTransaction.orderNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase text-[10px] font-bold">Waktu Transaksi</p>
                  <p className="font-bold text-gray-800">{new Date(selectedTransaction.timestamp).toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase text-[10px] font-bold">Kasir</p>
                  <p className="font-bold text-gray-800">{selectedTransaction.kasirName}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase text-[10px] font-bold">Metode Pembayaran</p>
                  <p className="font-bold text-indigo-600">{selectedTransaction.paymentMethod}</p>
                </div>
              </div>

              <div className="border border-gray-100 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-2 text-left">Item</th>
                      <th className="px-4 py-2 text-center">Qty</th>
                      <th className="px-4 py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedTransaction.items.map(item => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 font-medium">{item.name}</td>
                        <td className="px-4 py-2 text-center">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold">
                    <tr>
                      <td colSpan={2} className="px-4 py-2 text-right">Subtotal</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(selectedTransaction.subtotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="px-4 py-2 text-right text-red-500">Diskon</td>
                      <td className="px-4 py-2 text-right text-red-500">-{formatCurrency(selectedTransaction.discount)}</td>
                    </tr>
                    <tr className="text-indigo-600 text-lg">
                      <td colSpan={2} className="px-4 py-3 text-right">GRAND TOTAL</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(selectedTransaction.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
