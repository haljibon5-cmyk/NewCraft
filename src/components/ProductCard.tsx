import { Link } from 'react-router-dom';

interface ProductDesign {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
}

interface ProductCardProps {
  design: ProductDesign;
}

export function ProductCard({ design }: ProductCardProps) {
  return (
    <Link 
      to={`/product/${design.id}`} 
      className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer"
    >
      <div className="aspect-[4/5] sm:aspect-square bg-slate-100 overflow-hidden relative border-b border-slate-100">
        <img 
          src={design.imageUrl} 
          alt={design.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors duration-300"></div>
      </div>
      <div className="p-4 sm:p-5 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{design.name}</h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Select Phone Model</p>
        </div>
        <div className="bg-slate-50 px-2 py-1 rounded border border-slate-200 shrink-0">
          <span className="font-semibold text-slate-700 text-sm">${design.price.toFixed(2)}</span>
        </div>
      </div>
    </Link>
  );
}
