import React, { useEffect, useState } from 'react';
import { AlertTriangle, Plus, Check } from 'lucide-react';
import { adminService } from '../../services';
import { Product } from '../../types';

export const AdminInventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockInputs, setStockInputs] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchLowStock = async () => {
    try {
      setLoading(true);
      const res = await adminService.getLowStockInventory();
      if (res.data.success) {
        setProducts(res.data.data);
        const inputs: Record<string, number> = {};
        res.data.data.forEach((p: Product) => {
          inputs[p.id] = p.stockQuantity;
        });
        setStockInputs(inputs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStock();
  }, []);

  const handleUpdateStock = async (product: Product) => {
    const newQty = stockInputs[product.id];
    if (newQty === undefined) return;
    setSavingId(product.id);
    try {
      await adminService.updateProduct(product.id, {
        stockQuantity: Number(newQty),
        isAvailable: Number(newQty) > 0,
      });
      fetchLowStock();
    } catch (e) {
      console.error(e);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Low Stock Inventory Alerts
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Items with remaining inventory ≤ 10 units that need restock
        </p>
      </div>

      {loading ? (
        <div className="h-64 bg-white rounded-3xl animate-pulse" />
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
            ✓
          </div>
          <h3 className="text-base font-extrabold text-gray-900">Inventory is Healthy!</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            No items are currently below the low-stock threshold.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Restock Quantity</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/70 transition">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img
                      src={p.image || 'https://placehold.co/80x80?text=Product'}
                      alt={p.name}
                      className="w-10 h-10 rounded-xl object-cover bg-gray-100 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-gray-900">{p.name}</p>
                      <p className="text-[11px] text-gray-400">{p.unit} • ₹{p.price}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{p.category?.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-bold border border-red-200">
                      {p.stockQuantity} remaining
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min={0}
                      value={stockInputs[p.id] ?? p.stockQuantity}
                      onChange={(e) =>
                        setStockInputs({ ...stockInputs, [p.id]: Number(e.target.value) })
                      }
                      className="w-24 p-1.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleUpdateStock(p)}
                      disabled={savingId === p.id}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                    >
                      {savingId === p.id ? 'Saving...' : 'Update Stock'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminInventoryPage;