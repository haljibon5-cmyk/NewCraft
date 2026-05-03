import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, ArrowLeft } from 'lucide-react';

interface PhoneModel {
  id: string;
  name: string;
  stock: number;
}

interface ProductDesign {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
}

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [design, setDesign] = useState<ProductDesign | null>(null);
  const [models, setModels] = useState<PhoneModel[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      const [designRes, modelsRes] = await Promise.all([
        fetch(`/api/products/${id}`),
        fetch('/api/inventory')
      ]);
      const designData = await designRes.json();
      const modelsData = await modelsRes.json();
      
      if (designRes.ok) setDesign(designData);
      if (modelsRes.ok) setModels(modelsData);
    } catch (error) {
      console.error('Failed to fetch product data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center py-20 text-slate-500">Loading product details...</div>;
  }

  if (!design) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Product Not Found</h2>
        <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>
      </div>
    );
  }

  const selectedModel = models.find(m => m.id === selectedModelId);
  const isOutOfStock = selectedModel && selectedModel.stock <= 0;
  const isLowStock = selectedModel && selectedModel.stock > 0 && selectedModel.stock <= 2;

  const handleOrder = async () => {
    if (!selectedModelId) return;

    setIsOrdering(true);
    setMessage(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designId: design.id,
          phoneModelId: selectedModelId,
          quantity: 1,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Order placed successfully!' });
        // Refresh models stock
        const modelsRes = await fetch('/api/inventory');
        const modelsData = await modelsRes.json();
        setModels(modelsData);
        
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to place order.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to gallery
      </Link>
      
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col shadow-sm">
        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-4">Store Preview</span>
        <div className="flex flex-col sm:flex-row gap-8 items-start h-full">
          <div className="w-full sm:w-1/2 md:w-2/5 aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-100 shrink-0 relative">
            <img 
              src={design.imageUrl} 
              alt={design.name} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          
          <div className="flex flex-col flex-grow w-full h-full">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{design.name}</h3>
            </div>
            <p className="text-base border-b border-slate-100 pb-6 text-slate-500 mb-6 flex justify-between">
              <span>Premium matte finish case.</span>
              <span className="font-semibold text-slate-900">${design.price.toFixed(2)}</span>
            </p>

            <div className="mt-auto space-y-6">
              <div className="flex flex-col gap-2">
                <label htmlFor={`model-${design.id}`} className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Select Phone Model
                </label>
                <select
                  id={`model-${design.id}`}
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg text-base bg-white outline-none focus:border-indigo-500 transition-colors shadow-sm"
                >
                  <option value="" disabled>Choose your phone...</option>
                  {models.map(model => (
                    <option 
                      key={model.id} 
                      value={model.id} 
                      disabled={model.stock <= 0}
                    >
                      {model.name} {model.stock <= 0 ? '(Out of stock)' : `(${model.stock} available)`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Indicator alerts */}
              {selectedModel && (
                <div className="text-sm">
                   {isOutOfStock ? (
                      <div className="flex items-center text-red-600 gap-1.5 text-sm font-medium bg-red-50 p-2.5 rounded-md border border-red-100">
                        <AlertCircle className="w-4 h-4" />
                        <span>Out of stock globally</span>
                      </div>
                   ) : isLowStock ? (
                      <div className="flex items-center text-amber-700 gap-1.5 text-sm font-medium bg-amber-50 p-2.5 rounded-md border border-amber-200">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Only {selectedModel.stock} left in stock!</span>
                      </div>
                   ) : (
                      <div className="flex items-center text-emerald-700 gap-1.5 text-sm font-medium bg-emerald-50 p-2.5 rounded-md border border-emerald-100">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>In stock and ready to print</span>
                      </div>
                   )}
                </div>
              )}

              <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100 flex items-start gap-3">
                <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] text-white shrink-0 mt-0.5">
                  <Info className="w-3 h-3" />
                </div>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Inventory is synced across <span className="font-bold">all designs</span> for this phone model. We keep blank cases and print on demand!
                </p>
              </div>

              <button
                onClick={handleOrder}
                disabled={!selectedModelId || isOutOfStock || isOrdering}
                className="w-full py-4 bg-slate-900 text-white rounded-lg text-sm font-bold uppercase tracking-wide transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-sm"
              >
                {isOrdering ? 'Processing...' : (isOutOfStock ? 'Out of Stock' : 'Add to Cart')}
              </button>

              {message && (
                <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {message.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
