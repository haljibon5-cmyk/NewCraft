import { Link, useLocation } from 'react-router-dom';
import { Package, ShoppingBag } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 shadow-sm">
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <Link to="/" className="text-sm sm:text-lg font-semibold tracking-tight text-slate-900 truncate hidden sm:block">
            CaseLogic <span className="text-slate-400 font-normal">| Global Inventory System</span>
          </Link>
          <Link to="/" className="text-sm sm:text-lg font-semibold tracking-tight text-slate-900 truncate sm:hidden">
            CaseLogic
          </Link>
        </div>
        <div className="flex space-x-2 sm:space-x-4 border-l border-slate-200 pl-4 sm:pl-6 h-8 items-center">
          <Link
            to="/"
            className={`text-sm font-medium ${
              location.pathname === '/'
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Storefront
          </Link>
          <Link
            to="/admin"
            className={`text-sm font-medium flex items-center ${
              location.pathname === '/admin'
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="h-4 w-4 mr-1.5 hidden sm:block" />
            Admin
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span className="text-xs font-medium text-amber-700">Live Inventory</span>
        </div>
        <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
      </div>
    </header>
  );
}
