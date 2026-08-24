import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp } from 'lucide-react';
import { productService } from '../../services';
import { Product } from '../../types';

export const SearchBar: React.FC<{ placeholder?: string }> = ({
  placeholder = 'Search for "milk", "lays", "apples", "atta"...',
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [previewProducts, setPreviewProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setPreviewProducts([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await productService.search(query.trim(), 4);
        if (res.data.success && res.data.data) {
          setSuggestions(res.data.data.suggestions || []);
          setPreviewProducts(res.data.data.products || []);
        }
      } catch (e) {
        console.error('Search error:', e);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectSuggestion = (text: string) => {
    setQuery(text);
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(text)}`);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSearchSubmit} className="relative w-full">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 sm:py-2.5 bg-gray-100/90 focus:bg-white text-xs sm:text-sm text-gray-900 placeholder-gray-400 rounded-xl border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setPreviewProducts([]);
              }}
              className="absolute right-3 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Auto-suggest dropdown */}
      {isOpen && (suggestions.length > 0 || previewProducts.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in divide-y divide-gray-50">
          {/* Keyword suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">
                Suggestions
              </span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(sug)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-emerald-50 text-xs text-gray-700 hover:text-emerald-700 transition"
                  >
                    <TrendingUp className="w-3 h-3 text-gray-400" />
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Instant Product Previews */}
          {previewProducts.length > 0 && (
            <div className="p-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">
                Products
              </span>
              <div className="mt-1 space-y-1">
                {previewProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      navigate(`/products/${product.slug}`);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 text-left transition group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={product.image || 'https://placehold.co/80x80?text=Product'}
                        alt={product.name}
                        className="w-9 h-9 object-cover rounded-lg bg-gray-100 shrink-0"
                      />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-gray-900 group-hover:text-emerald-600 transition truncate">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-gray-500">{product.unit}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="text-xs font-bold text-gray-900">₹{product.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;