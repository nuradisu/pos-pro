
import React, { useState, useMemo, useEffect } from 'react';
import { User, MenuItem, CartItem, Transaction } from '../types';

interface PointOfSaleProps {
  user: User;
  menus: MenuItem[];
  onSave: (transaction: Transaction) => void;
}

const PointOfSale: React.FC<PointOfSaleProps> = ({ user, menus, onSave }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'QRIS'>('Tunai');
  const [showReceipt, setShowReceipt] = useState<Transaction | null>(null);

  const filteredMenus = useMemo(() => {
    return menus.filter(m => 
      m.status === 'aktif' && 
      m.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [menus, search]);

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
  const total = useMemo(() => subtotal - discount, [subtotal, discount]);

  const addToCart = (menu: MenuItem) => {
    if (menu.stock <= 0) {
      alert('Stok habis!');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === menu.id);
      if (existing) {
        if (existing.quantity >= menu.stock) {
          alert('Stok tidak mencukupi!');
          return prev;
        }
        return prev.map(item => item.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...menu, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        if (newQty > item.stock) {
          alert('Stok terbatas!');
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      orderNumber: `TRX-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      kasirId: user.id,
      kasirName: user.name,
      items: cart,
      subtotal,
      discount,
      total,
      paymentMethod
    };

    onSave(newTransaction);
    setShowReceipt(newTransaction);
    setCart([]);
    setDiscount(0);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* Left: Menu Grid */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Kasir Resto</h1>
          <div className="relative w-full max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Cari menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4 pr-2">
          {filteredMenus.map(menu => (
            <button
              key={menu.id}
              onClick={() => addToCart(menu)}
              className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-left hover:border-indigo-500 hover:shadow-md transition-all group flex flex-col h-full"
            >
              <div className="aspect-video w-full rounded-xl overflow-hidden mb-3 bg-gray-100">
                <img src={menu.image} alt={menu.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <p className="font-bold text-gray-800 line-clamp-1">{menu.name}</p>
              <div className="mt-auto flex items-center justify-between">
                <p className="text-indigo-600 font-bold">{formatCurrency(menu.price)}</p>
                <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">Stok: {menu.stock}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Cart & Summary */}
      <div className="w-full lg:w-[400px] flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 sticky top-0 h-[calc(100vh-100px)]">
        <div className="p-6 border-b border-gray-100 bg-indigo-50">
          <h2 className="text-xl font-bold text-indigo-900 flex items-center">
            <i className="fas fa-shopping-cart mr-2"></i> Keranjang
          </h2>
          <p className="text-xs text-indigo-600 mt-1 uppercase font-semibold">Petugas: {user.name}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 opacity-50">
              <i className="fas fa-cart-plus text-5xl"></i>
              <p className="font-medium">Belum ada item dipilih</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center justify-between group animate-fadeIn">
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 flex items-center justify-center hover:bg-white rounded transition-colors text-indigo-600">
                    <i className="fas fa-minus text-xs"></i>
                  </button>
                  <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 flex items-center justify-center hover:bg-white rounded transition-colors text-indigo-600">
                    <i className="fas fa-plus text-xs"></i>
                  </button>
                </div>
                <div className="w-20 text-right">
                  <p className="font-bold text-gray-800 text-sm">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Diskon (Rp)</span>
              <input
                type="number"
                className="w-24 text-right border border-gray-200 rounded px-2 py-0.5 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, parseInt(e.target.value) || 0))}
              />
            </div>
            <div className="pt-2 flex justify-between font-bold text-xl text-gray-900">
              <span>Total</span>
              <span className="text-indigo-600">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod('Tunai')}
              className={`py-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                paymentMethod === 'Tunai' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-400 grayscale'
              }`}
            >
              <i className="fas fa-money-bill-wave text-xl mb-1"></i>
              <span className="text-xs font-bold">Tunai</span>
            </button>
            <button
              onClick={() => setPaymentMethod('QRIS')}
              className={`py-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                paymentMethod === 'QRIS' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-400 grayscale'
              }`}
            >
              <i className="fas fa-qrcode text-xl mb-1"></i>
              <span className="text-xs font-bold">QRIS</span>
            </button>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
              cart.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            Selesaikan Pesanan
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-6 text-center border-b border-gray-100">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-check text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold">Transaksi Berhasil</h3>
              <p className="text-gray-500">Struk telah siap untuk dicetak</p>
            </div>
            
            <div className="p-8 bg-gray-50 text-center">
              <div className="bg-white p-6 rounded-xl border border-dashed border-gray-300 mx-auto shadow-sm">
                <h4 className="font-bold text-lg border-b border-gray-200 pb-2 mb-4">RESTO PRO</h4>
                <div className="space-y-1 text-xs text-left text-gray-600">
                  <div className="flex justify-between"><span>Nomor:</span> <span className="font-bold">{showReceipt.orderNumber}</span></div>
                  <div className="flex justify-between"><span>Tgl:</span> <span>{new Date(showReceipt.timestamp).toLocaleString('id-ID')}</span></div>
                  <div className="flex justify-between"><span>Kasir:</span> <span>{showReceipt.kasirName}</span></div>
                </div>
                <div className="my-4 border-t border-gray-100 pt-2 space-y-2">
                  {showReceipt.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="flex-1 text-left">{item.name} x{item.quantity}</span>
                      <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 border-gray-200 pt-2 space-y-1">
                  <div className="flex justify-between text-xs"><span>Subtotal:</span> <span>{formatCurrency(showReceipt.subtotal)}</span></div>
                  <div className="flex justify-between text-xs text-red-500"><span>Diskon:</span> <span>-{formatCurrency(showReceipt.discount)}</span></div>
                  <div className="flex justify-between font-bold text-lg pt-1 border-t border-gray-100">
                    <span>TOTAL:</span> <span>{formatCurrency(showReceipt.total)}</span>
                  </div>
                </div>
                <p className="mt-4 text-[10px] text-gray-400 uppercase tracking-widest">Terima kasih atas kunjungannya</p>
              </div>
            </div>

            <div className="p-4 bg-white grid grid-cols-2 gap-3">
              <button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all">
                <i className="fas fa-print mr-2"></i> Cetak
              </button>
              <button onClick={() => setShowReceipt(null)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden print layout */}
      <div className="print-only p-8 text-center bg-white" style={{ width: '80mm', margin: '0 auto' }}>
        {showReceipt && (
          <div className="receipt-content text-sm">
            <h1 className="text-xl font-bold">POS RESTO PRO</h1>
            <p className="text-xs mb-4">Jl. Melati No. 123, Jakarta</p>
            <div className="border-t border-b border-black py-2 mb-4 text-left">
              <p>Nota: {showReceipt.orderNumber}</p>
              <p>Tgl: {new Date(showReceipt.timestamp).toLocaleString('id-ID')}</p>
              <p>Kasir: {showReceipt.kasirName}</p>
            </div>
            <div className="mb-4">
              {showReceipt.items.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-black pt-2 font-bold space-y-1">
               <div className="flex justify-between"><span>Subtotal:</span> <span>{formatCurrency(showReceipt.subtotal)}</span></div>
               <div className="flex justify-between"><span>Diskon:</span> <span>-{formatCurrency(showReceipt.discount)}</span></div>
               <div className="flex justify-between text-lg mt-2"><span>TOTAL:</span> <span>{formatCurrency(showReceipt.total)}</span></div>
               <div className="flex justify-between text-xs"><span>Metode:</span> <span>{showReceipt.paymentMethod}</span></div>
            </div>
            <p className="mt-8 text-xs">--- TERIMA KASIH ---</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointOfSale;
