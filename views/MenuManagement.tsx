
import React, { useState } from 'react';
import { MenuItem, Category } from '../types';

interface MenuManagementProps {
  menus: MenuItem[];
  categories: Category[];
  onAdd: (menu: MenuItem) => void;
  onUpdate: (menu: MenuItem) => void;
  onDelete: (id: string) => void;
}

const MenuManagement: React.FC<MenuManagementProps> = ({ menus, categories, onAdd, onUpdate, onDelete }) => {
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    categoryId: categories[0]?.id || '',
    price: 0,
    stock: 0,
    status: 'aktif',
    image: 'https://picsum.photos/seed/menu/200'
  });

  const handleOpenAdd = () => {
    setEditingMenu(null);
    setFormData({
      name: '',
      categoryId: categories[0]?.id || '',
      price: 0,
      stock: 0,
      status: 'aktif',
      image: `https://picsum.photos/seed/${Math.random()}/200`
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (menu: MenuItem) => {
    setEditingMenu(menu);
    setFormData(menu);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMenu) {
      onUpdate({ ...editingMenu, ...formData } as MenuItem);
    } else {
      onAdd({ ...formData, id: Date.now().toString() } as MenuItem);
    }
    setIsModalOpen(false);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Menu</h1>
          <p className="text-gray-500">Kelola daftar menu makanan dan minuman Anda.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center"
        >
          <i className="fas fa-plus mr-2"></i> Tambah Menu
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Produk</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Kategori</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Harga</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Stok</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {menus.map(menu => (
              <tr key={menu.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img src={menu.image} className="w-12 h-12 rounded-lg object-cover mr-4" alt={menu.name} />
                    <span className="font-bold text-gray-800">{menu.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {categories.find(c => c.id === menu.categoryId)?.name}
                </td>
                <td className="px-6 py-4 font-bold text-indigo-600">
                  {formatCurrency(menu.price)}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${menu.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                    {menu.stock} item
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${menu.status === 'aktif' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                    {menu.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button onClick={() => handleOpenEdit(menu)} className="text-blue-500 hover:bg-blue-50 p-2 rounded transition-colors">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button onClick={() => { if(confirm('Hapus menu ini?')) onDelete(menu.id) }} className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors">
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Menu</label>
                  <input
                    type="text" required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                  <input
                    type="number" required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok Awal</label>
                  <input
                    type="number" required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all">
                  Simpan Perubahan
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
