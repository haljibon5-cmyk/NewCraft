import { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';

interface ProductDesign {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
}

export function StorePage() {
  const [designs, setDesigns] = useState<ProductDesign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const designsRes = await fetch('/api/products');
      const designsData = await designsRes.json();
      setDesigns(designsData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20 text-slate-500">Loading store...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">Design Collections</h1>
        <p className="text-sm text-slate-500 max-w-2xl">Pick a design and select your phone model. Our blank cases are shared across designs, ensuring you only see what's truly available.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {designs.map(design => (
          <ProductCard 
            key={design.id} 
            design={design} 
          />
        ))}
      </div>
    </div>
  );
}
