import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import axiosClient, { BASE_URL } from '../../api/axiosClient';

export default function AdminListingDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const fetchProduct = async () => {
      try {
        const response = await axiosClient.get(`/items/${id}`);
        setProduct(response.data);
        setMainImage(`${BASE_URL}${response.data.main_image}`);
      } catch (error) {
        console.error("Error fetching product details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const scrollGallery = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="p-20 text-center text-sm font-bold tracking-widest uppercase text-gray-500">Loading Preview...</div>;
  if (!product) return <div className="p-20 text-center">Product not found.</div>;

  const allImages = [
    `${BASE_URL}${product.main_image}`, 
    ...(product.additional_images?.map(img => `${BASE_URL}${img}`) || [])
  ];

  const hasSize = product.category === 'Vòng Tay';

  return (
    <div className="bg-white min-h-screen pb-20">
      <section className="max-w-7xl mx-auto px-8 py-8 md:py-16">
        
        <Link to="/admin/listings" className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 hover:text-black transition-colors uppercase mb-10">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="w-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-bold tracking-widest uppercase p-4 text-center mb-8">
          Admin View: Listing Preview
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          
          <div className="md:col-span-7 flex flex-col gap-6">
            <div className="w-full aspect-square bg-gray-50 relative overflow-hidden flex items-center justify-center p-8 rounded-sm">
              <img src={mainImage} alt={product.title} className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-500" />
            </div>
            
            <div className="relative w-full group/carousel">
              <button onClick={() => scrollGallery('left')} className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/60 backdrop-blur-md hover:bg-white/90 w-10 h-16 flex items-center justify-center rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-all duration-300 opacity-0 group-hover/carousel:opacity-100">
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>
              
              <div ref={scrollRef} className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>{`div::-webkit-scrollbar { display: none; }`}</style>
                {allImages.map((img, idx) => (
                  <button 
                    key={idx} onClick={() => setMainImage(img)}
                    className={`group/thumb w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-2xl snap-start relative overflow-hidden focus:outline-none transition-all duration-500 ease-in-out bg-gray-100 flex items-center justify-center
                      ${mainImage === img ? 'ring-2 ring-black scale-100 opacity-100' : 'scale-[0.95] opacity-50 hover:scale-100 hover:opacity-100 hover:shadow-md'}`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover/thumb:scale-110" />
                    <div className={`absolute inset-0 bg-white/20 transition-opacity duration-300 ${mainImage === img ? 'opacity-0' : 'group-hover/thumb:opacity-0 opacity-100'}`} />
                  </button>
                ))}
              </div>

              <button onClick={() => scrollGallery('right')} className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white/60 backdrop-blur-md hover:bg-white/90 w-10 h-16 flex items-center justify-center rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-all duration-300 opacity-0 group-hover/carousel:opacity-100">
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </button>
            </div>
          </div>

          <div className="md:col-span-5 flex flex-col justify-center">
            <div className="mb-6 border-b border-gray-100 pb-6">
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-3">{product.category} Collection</p>
              
              <h1 className="text-3xl md:text-4xl font-serif text-black mb-4 leading-tight">
                {product.title}
              </h1>
              
              <p className="text-lg font-bold text-gray-900">{Number(product.price).toLocaleString('en-US')}₫</p>
            </div>

            <p className="text-sm text-gray-600 mb-8 leading-relaxed whitespace-pre-wrap">
              {product.description || 'No description provided.'}
            </p>

            {hasSize && (
              <div className="mb-8">
                <div className="grid grid-cols-2 gap-4 mb-4 border border-gray-100 p-4">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1">Color</span>
                    <span className="text-sm font-semibold text-black">{product.attributes?.color || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1">Size (cm)</span>
                    <span className="text-sm font-semibold text-black">{product.attributes?.size}</span>
                  </div>
                </div>
              </div>
            )}

            <button disabled className="w-full bg-gray-200 text-gray-500 text-xs font-bold tracking-[0.15em] uppercase py-4 flex justify-center items-center gap-2 cursor-not-allowed">
              Add to Collection (Disabled in Preview)
            </button>

            <div className="mt-12 border-t border-gray-200">
              <details className="group py-4 border-b border-gray-100 cursor-pointer">
                <summary className="flex justify-between items-center text-xs font-bold tracking-widest uppercase text-black list-none">
                  Materials & Craftsmanship
                  <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180 text-gray-400" />
                </summary>
                <div className="mt-4 text-sm text-gray-600 leading-relaxed pr-8">
                  Forged from premium materials, each piece is individually cast and hand-polished by master silversmiths to achieve a luminous finish.
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}