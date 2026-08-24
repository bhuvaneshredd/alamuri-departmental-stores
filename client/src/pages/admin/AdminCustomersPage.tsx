import React, { useEffect, useState } from 'react';
import { Search, UserCheck, UserX, Shield } from 'lucide-react';
import { adminService } from '../../services';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCustomers({ search: search || undefined });
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleToggleStatus = async (id: string) => {
    try {
      await adminService.toggleCustomerStatus(id);
      fetchCustomers();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Customer Management</h1>
        <p className="text-xs text-gray-500 mt-1">View registered customers, lifetime order spend, and account access</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name, email, or phone number..."
          className="w-full text-xs sm:text-sm bg-transparent outline-none text-gray-900 placeholder-gray-400"
        />
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px]">
            <tr>
              <th className="py-3.5 px-4">Customer Name</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Phone</th>
              <th className="py-3.5 px-4">Total Orders</th>
              <th className="py-3.5 px-4">Lifetime Spend</th>
              <th className="py-3.5 px-4">Joined Date</th>
              <th className="py-3.5 px-4 text-right">Account Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/70 transition">
                <td className="py-3 px-4 font-bold text-gray-900">{c.name}</td>
                <td className="py-3 px-4 text-gray-600">{c.email}</td>
                <td className="py-3 px-4 text-gray-500">{c.phone || 'N/A'}</td>
                <td className="py-3 px-4 font-bold text-gray-900">{c.totalOrders}</td>
                <td className="py-3 px-4 font-black text-emerald-700">₹{c.lifetimeSpend.toFixed(2)}</td>
                <td className="py-3 px-4 text-gray-400">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleToggleStatus(c.id)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition ${
                      c.isActive
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:text-red-700'
                        : 'bg-red-50 text-red-700 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    {c.isActive ? 'Active (Click to Disable)' : 'Disabled (Click to Enable)'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCustomersPage;