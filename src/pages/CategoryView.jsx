import React, { useState, useMemo, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Filter, Check, ChevronDown } from 'lucide-react';
import axiosClient, { BASE_URL } from '../api/axiosClient';

const VONG_TAY_TYPES = [
  'Tụ Nham', 'Du long hoa bay', 'Thiên Sơn thuỷ', 'Du long', 
  'Đông linh', 'Thiên Sơn thuỷ đũa', 'Mã não', 'Hoà điền'
];

const VONG_TAY_COLORS = {
  'Du long': ['Aqua', 'Đỏ', 'Tím'],
  'Đông linh': ['Hẹ', 'Đũa'],
  'Mã não': ['Vàng', 'Trắng', 'Xanh thiên thanh', 'Xanh tiffany', 'Hồng bưởi', 'Xanh hồng', 'Trắng hồng', 'Xanh mạ', 'Xanh lá']
};

export default function CategoryView() {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeType, setActiveType] = useState('All');
  const [activeColor, setActiveColor] = useState('All');

  useEffect(() => {
    setActiveType('All');
    setActiveColor('All');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        // FIX: Added ?limit=1000 to fetch full inventory for client-side filtering
        const response = await axiosClient.get('/items?limit=1000');
        const safeData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        const filtered = safeData.filter(item => item.category === categoryName);
        setProducts(filtered);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryProducts();
  }, [categoryName]);

  const otherCategoryFilters = useMemo(() => {
    if (categoryName === 'Vòng Tay') return [];
    const types = products.map(p => p.attributes?.type).filter(Boolean);
    return [...new Set(types)];
  }, [products, categoryName]);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeType !== 'All') {
      result = result.filter(p => p.attributes?.type === activeType);
    }
    if (activeColor !== 'All') {
      result = result.filter(p => p.attributes?.color === activeColor);
    }
    return result;
  }, [products, activeType, activeColor]);

  return (
    <div className="bg-gray-50/50 min-h-full py-12">
      <div className="max-w-7xl mx-auto px-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6 mb-8">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-100 transition shadow-sm">
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </Link>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Collections</p>
              <h2 className="text-3xl font-serif text-black uppercase tracking-wide mt-0.5">{categoryName}</h2>
            </div>
          </div>
          <div className="text-sm text-gray-500 italic font-medium">
            Showing {filteredProducts.length} products
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <div className="w-full lg:w-64 bg-white border border-gray-200 p-6 shadow-sm rounded-sm">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
              <Filter className="w-4 h-4 text-black" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-black">Search Filters</h3>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => { setActiveType('All'); setActiveColor('All'); }}
                className={`flex items-center justify-between px-3 py-2.5 text-xs font-semibold tracking-wide uppercase transition rounded-sm w-full text-left ${activeType === 'All' ? 'bg-black text-white' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}
              >
                <span>All {categoryName}</span>
                {activeType === 'All' && <Check className="w-3.5 h-3.5" />}
              </button>

              {categoryName === 'Vòng Tay' ? (
                VONG_TAY_TYPES.map((typeName) => {
                  const hasColors = !!VONG_TAY_COLORS[typeName];
                  const isTypeActive = activeType === typeName;

                  return (
                    <div key={typeName} className="flex flex-col gap-1">
                      <button
                        onClick={() => { 
                          if (isTypeActive) {
                            setActiveType('All');
                            setActiveColor('All');
                          } else {
                            setActiveType(typeName); 
                            setActiveColor('All'); 
                          }
                        }}
                        className={`flex items-center justify-between px-3 py-2.5 text-xs font-semibold tracking-wide uppercase transition rounded-sm w-full text-left ${isTypeActive ? 'bg-black text-white' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}
                      >
                        <span className="truncate pr-2">{typeName}</span>
                        {isTypeActive && !hasColors && <Check className="w-3.5 h-3.5" />}
                        {hasColors && (
                           <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isTypeActive ? 'rotate-180' : ''}`} />
                        )}
                      </button>

                      {isTypeActive && hasColors && (
                        <div className="pl-4 flex flex-col gap-1 border-l-2 border-gray-100 ml-3 my-1">
                          {VONG_TAY_COLORS[typeName].map((colorName) => {
                            const isColorActive = activeColor === colorName;
                            return (
                              <button
                                key={colorName}
                                onClick={() => setActiveColor(colorName)}
                                className={`flex items-center justify-between px-3 py-2 text-[10px] font-bold tracking-widest uppercase transition rounded-sm w-full text-left ${isColorActive ? 'text-black bg-gray-100' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}
                              >
                                <span className="truncate pr-2">{colorName}</span>
                                {isColorActive && <Check className="w-3 h-3" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                otherCategoryFilters.map((filterName) => (
                  <button
                    key={filterName}
                    onClick={() => setActiveType(filterName)}
                    className={`flex items-center justify-between px-3 py-2.5 text-xs font-semibold tracking-wide uppercase transition rounded-sm w-full text-left ${activeType === filterName ? 'bg-black text-white' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}
                  >
                    <span className="truncate pr-2">{filterName}</span>
                    {activeType === filterName && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 w-full">
            {loading ? (
              <div className="py-20 text-center text-sm tracking-widest text-gray-400 uppercase">Loading Collection...</div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <Link to={`/product/${product.id}`} key={product.id} className="group bg-white border border-gray-100 p-4 rounded-sm shadow-sm hover:shadow-md transition duration-300 cursor-pointer block">
                    <div className="bg-gray-50 aspect-square mb-4 overflow-hidden flex items-center justify-center p-4 relative">
                      <img src={`${BASE_URL}${product.main_image}`} alt={product.title} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-500" />
                      <span className="absolute top-2 left-2 bg-white/90 text-gray-800 text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase rounded-sm shadow-sm">
                        {product.attributes?.color || product.attributes?.type || product.title}
                      </span>
                    </div>
                    <div className="text-center mt-2">
                      <h4 className="text-sm font-semibold mb-1 group-hover:text-gray-600 transition-colors line-clamp-1">{product.title}</h4>
                      <p className="text-sm text-[#a68a56] font-bold">{Number(product.price).toLocaleString('en-US')}₫</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 py-20 text-center rounded-sm shadow-sm">
                <p className="text-gray-400 text-sm font-medium">No products found matching this filter combination.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}