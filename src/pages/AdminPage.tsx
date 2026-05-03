import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

interface PhoneModel {
  id: string;
  name: string;
  stock: number;
}

interface DetailedOrder {
  id: string;
  designId: string;
  phoneModelId: string;
  quantity: number;
  status: string;
  createdAt: string;
  design?: { name: string; imageUrl: string };
  phoneModel?: { name: string };
}

export function AdminPage() {
  const [models, setModels] = useState<PhoneModel[]>([]);
  const [orders, setOrders] = useState<DetailedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [modelsRes, ordersRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/orders')
      ]);
      const modelsData = await modelsRes.json();
      const ordersData = await ordersRes.json();
      
      setModels(modelsData);
      // Sort orders by newest first
      setOrders(ordersData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStock = async (id: string, newStockStr: string) => {
    const newStock = parseInt(newStockStr, 10);
    if (isNaN(newStock) || newStock < 0) return;

    setUpdatingId(id);
    try {
      await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      await fetchData();
    } catch (error) {
      console.error('Failed to update stock', error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20 text-slate-500">Loading admin panel...</div>;
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Central Stock Management</h1>
          <p className="text-sm text-slate-500 max-w-2xl mt-1">Update blank case inventory here. This affects all designs globally.</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm transition-colors text-slate-700 shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      {/* Inventory Section */}
      <section>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Device Model</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Available Stock</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Update Stock</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {models.map((model) => {
                const isOutOfStock = model.stock <= 0;
                const isLowStock = model.stock > 0 && model.stock <= 2;

                return (
                  <tr key={model.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                      {model.name}
                      <span className="ml-2 text-[10px] font-mono bg-white px-2 py-0.5 border border-slate-200 rounded text-slate-500">ID: {model.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded tracking-wide uppercase">
                          <AlertCircle className="w-3 h-3" /> OUT
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded tracking-wide uppercase">
                          <AlertTriangle className="w-3 h-3" /> LOW
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded tracking-wide uppercase">
                          <CheckCircle2 className="w-3 h-3" /> OK
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-slate-900">
                      {model.stock} units
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end items-center gap-2">
                        <input 
                          type="number" 
                          defaultValue={model.stock}
                          min="0"
                          id={`stock-${model.id}`}
                          className={`w-20 h-8 rounded border px-2 py-1.5 text-sm text-right focus:border-indigo-500 outline-none
                            ${isOutOfStock ? 'border-red-300 bg-white shadow-sm' : isLowStock ? 'border-amber-300 bg-white shadow-sm' : 'border-slate-200 bg-slate-50 shadow-sm'}`}
                        />
                        <button
                          onClick={() => {
                            const input = document.getElementById(`stock-${model.id}`) as HTMLInputElement;
                            if (input) handleUpdateStock(model.id, input.value);
                          }}
                          disabled={updatingId === model.id}
                          className="px-3 py-1.5 h-8 bg-indigo-600 text-white font-medium rounded text-xs hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                          {updatingId === model.id ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-slate-500 flex items-center gap-1.5 bg-slate-100/50 p-3 rounded-lg border border-slate-200">
          <AlertCircle className="w-4 h-4 text-slate-400" /> This stock is shared across ALL product designs perfectly. You do not need to restock designs individually.
        </p>
      </section>

      {/* Orders Section */}
      <section>
        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2 block">System Activity</span>
        <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Recent Global Orders</h2>
        
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <p className="text-slate-500 text-sm">No orders yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <ul className="divide-y divide-slate-200">
              {orders.map(order => (
                <li key={order.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {order.design && (
                      <img 
                        src={order.design.imageUrl} 
                        alt={order.design.name} 
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        Order #{order.id}
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">{order.design?.name || order.designId}</span> 
                        {' for '} 
                        <span className="font-semibold text-slate-700">{order.phoneModel?.name || order.phoneModelId}</span>
                      </p>
                      <p className="text-[11px] font-mono text-slate-400 mt-1.5 uppercase">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1.5 text-slate-700 bg-slate-100 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border border-slate-200">
                        Qty: {order.quantity}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

    </div>
  );
}
