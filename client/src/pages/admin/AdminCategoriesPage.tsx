import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { categoryService, adminService } from '../../services';
import { Category } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    displayOrder: 0,
    isActive: true,
  });

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategories(true);
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setFormData({ name: '', description: '', image: '', displayOrder: categories.length + 1, isActive: true });
    setModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCat(c);
    setFormData({
      name: c.name,
      description: c.description || '',
      image: c.image || '',
      displayOrder: c.displayOrder,
      isActive: c.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await adminService.updateCategory(editingCat.id, formData);
      } else {
        await adminService.createCategory(formData);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await adminService.deleteCategory(id);
      fetchCategories();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Categories Management</h1>
          <p className="text-xs text-gray-500 mt-1">Organize your store sections and banner icons</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px]">
            <tr>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Slug</th>
              <th className="py-3.5 px-4">Order</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/70 transition">
                <td className="py-3 px-4 flex items-center gap-3 font-bold text-gray-900">
                  <img
                    src={c.image || 'https://placehold.co/80x80?text=Category'}
                    alt={c.name}
                    className="w-9 h-9 rounded-xl object-cover bg-gray-100 shrink-0"
                  />
                  <span>{c.name}</span>
                </td>
                <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">{c.slug}</td>
                <td className="py-3 px-4 font-bold text-gray-700">{c.displayOrder}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 animate-slide-up">
            <h2 className="text-base font-extrabold text-gray-900 mb-4">
              {editingCat ? 'Edit Category' : 'Create Category'}
            </h2>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Display Order</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none"
                />
              </div>
              <label className="flex items-center gap-2 font-bold cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-emerald-600 w-4 h-4"
                />
                <span>Active</span>
              </label>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;