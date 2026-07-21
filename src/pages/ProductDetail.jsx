import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronDown, ChevronLeft, ChevronRight, ArrowRight, Loader2, Check, 
  RefreshCcw, Package, Award, Truck, ClipboardCheck, ShieldCheck 
} from 'lucide-react';
import axiosClient, { BASE_URL } from '../api/axiosClient';
import { useShop } from '../context/ShopContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart, cartItems } = useShop(); 
  
  const [product, setProduct] = useState(null);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [mainImage, setMainImage] = useState('');
  const [loading, setLoading] = useState(true);
  const isAlreadyInCart = product ? cartItems.some(item => item.id === product.id) : false;
  
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const prodRes = await axiosClient.get(`/items/${id}`);
        setProduct(prodRes.data);
        setMainImage(`${BASE_URL}${prodRes.data.main_image}`);

        const itemsRes = await axiosClient.get('/items');
        const safeData = Array.isArray(itemsRes.data) ? itemsRes.data : (itemsRes.data?.data || []);
        const recs = safeData.filter(p => p.id !== Number(id)).slice(0, 4);
        setTrendingProducts(recs);
      } catch (error) {
        console.error("Failed to load product", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  const scrollGallery = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    setIsAdding(true);
    
    setTimeout(() => {
      addToCart({
        id: product.id,
        category: product.category,
        name: product.title,
        price: product.price,
        image: `${BASE_URL}${product.main_image}`,
        color: product.attributes?.color,
        size: product.attributes?.size,
        type: product.attributes?.type
      });
      
      setIsAdding(false);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }, 600); 
  };

  if (loading) return <div className="p-32 text-center text-sm font-bold tracking-widest text-gray-500 uppercase">Loading Product...</div>;
  if (!product) return <div className="p-32 text-center text-lg text-gray-500">Product not found.</div>;

  const allImages = [
    `${BASE_URL}${product.main_image}`, 
    ...(product.additional_images?.map(img => `${BASE_URL}${img}`) || [])
  ];

  const hasSize = product.category === 'Vòng Tay';

  return (
    <div className="bg-white min-h-screen pb-20">
      <section className="max-w-7xl mx-auto px-8 py-12 md:py-24">
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
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-3">
                {product.category} Collection
              </p>
              <h1 className="text-3xl md:text-4xl font-serif text-black mb-4 leading-tight">
                {product.title}
              </h1>
              <p className="text-lg font-bold text-[#a68a56]">{Number(product.price).toLocaleString('en-US')}₫</p>
            </div>

            <p className="text-sm text-gray-600 mb-8 leading-relaxed whitespace-pre-wrap">
              {product.description || 'A timeless expression of strength and elegance. Crafted with meticulous attention to detail.'}
            </p>

            {hasSize && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold tracking-widest text-black uppercase">Type, Color & Size</span>
                  <Link to="/size-guide" className="text-[10px] font-bold tracking-widest text-gray-500 underline decoration-1 underline-offset-4 hover:text-black uppercase transition-colors">
                    Size Guide
                  </Link>
                </div>
                
                {/* NEW: 3 Column Grid for Type, Color, and Size */}
                <div className="grid grid-cols-3 gap-4 border border-gray-100 p-4">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase block mb-1">Type</span>
                    <span className="text-sm font-semibold text-black">{product.attributes?.type || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase block mb-1">Color</span>
                    <span className="text-sm font-semibold text-black">{product.attributes?.color || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase block mb-1">Size (cm)</span>
                    <span className="text-sm font-semibold text-black">{product.attributes?.size || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={handleAddToCart}
              disabled={isAdding || isAdded || isAlreadyInCart}
              className={`w-full text-xs font-bold tracking-[0.15em] uppercase py-4 transition-all duration-300 flex justify-center items-center gap-2 group
                ${isAdded || isAlreadyInCart ? 'bg-green-600 text-white hover:bg-green-700 cursor-not-allowed' : 'bg-[#1a1a1a] text-white hover:bg-black'}
              `}
            >
              {isAdding ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> ADDING...</>
              ) : isAdded ? (
                <><Check className="w-4 h-4" /> ADDED TO CART</>
              ) : isAlreadyInCart ? (
                <><Check className="w-4 h-4" /> ALREADY IN CART</>
              ) : (
                <>ADD TO CART <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
            <p className="text-[11px] text-gray-500 mt-4 text-center tracking-wide">
              Complimentary global shipping on all orders.
            </p>

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
              
              <details className="group py-4 border-b border-gray-100 cursor-pointer">
                <summary className="flex justify-between items-center text-xs font-bold tracking-widest uppercase text-black list-none">
                  Care Guide
                  <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180 text-gray-400" />
                </summary>
                <div className="mt-4 text-sm text-gray-600 leading-relaxed pr-8">
                  To maintain its ethereal luminescence, store in the provided suede pouch when not worn. Avoid direct contact with harsh chemicals, perfumes, and extended exposure to moisture.
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended & FAQ Section */}
      <section className="py-16 px-8 max-w-7xl mx-auto border-t border-gray-100">
        
        <div className="bg-[#f2f2f2] rounded-xl p-8 mb-20 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-6">
            <div className="flex items-center gap-4">
              <RefreshCcw className="w-8 h-8 text-gray-500 stroke-[1.5]" />
              <span className="text-sm font-medium text-gray-700">Hoàn tiền nếu chưa<br/>hài lòng</span>
            </div>
            <div className="flex items-center gap-4">
              <Package className="w-8 h-8 text-gray-500 stroke-[1.5]" />
              <span className="text-sm font-medium text-gray-700">10 ngày đổi trả tận<br/>nơi</span>
            </div>
            <div className="flex items-center gap-4">
              <Award className="w-8 h-8 text-gray-500 stroke-[1.5]" />
              <span className="text-sm font-medium text-gray-700">Cam kết chất lượng<br/>sản phẩm</span>
            </div>
            <div className="flex items-center gap-4">
              <Truck className="w-8 h-8 text-gray-500 stroke-[1.5]" />
              <span className="text-sm font-medium text-gray-700">Free Ship toàn quốc<br/>từ 498k</span>
            </div>
            <div className="flex items-center gap-4">
              <ClipboardCheck className="w-8 h-8 text-gray-500 stroke-[1.5]" />
              <span className="text-sm font-medium text-gray-700">Kiểm tra trước khi<br/>thanh toán</span>
            </div>
            <div className="flex items-center gap-4">
              <ShieldCheck className="w-8 h-8 text-gray-500 stroke-[1.5]" />
              <span className="text-sm font-medium text-gray-700">Bảo hành 12 tháng<br/>tận nơi</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end mb-10">
          <h2 className="text-2xl font-serif text-black uppercase">You May Also Like</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-24">
          {trendingProducts.map((recProduct) => (
            <Link to={`/product/${recProduct.id}`} key={recProduct.id} className="group cursor-pointer block">
              <div className="bg-gray-50 aspect-square mb-4 overflow-hidden flex items-center justify-center p-6 relative">
                <img 
                  src={`${BASE_URL}${recProduct.main_image}`} 
                  alt={recProduct.title} 
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="text-center">
                <h4 className="text-sm font-semibold mb-1 group-hover:text-gray-600 transition-colors truncate">
                  {recProduct.title}
                </h4>
                <p className="text-sm text-[#a68a56] font-bold">{Number(recProduct.price).toLocaleString('en-US')}₫</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="max-w-4xl mx-auto pt-8">
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-px bg-gray-300 flex-1"></div>
            <h2 className="text-xl md:text-2xl font-serif text-black uppercase tracking-widest text-center px-4">
              Điều Khách Hàng Thường Hỏi
            </h2>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>

          <div className="flex flex-col">
            <details className="group py-5 border-b border-gray-200 cursor-pointer">
              <summary className="flex justify-between items-center text-sm font-medium text-gray-800 list-none outline-none">
                Trang sức Aurora khác gì so với các sản phẩm phổ thông trên thị trường?
                <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90 text-gray-400 flex-shrink-0" />
              </summary>
              <div className="mt-4 text-sm text-gray-600 leading-relaxed pr-8">
                Tất cả sản phẩm của Aurora đều được chế tác từ những chất liệu cao cấp và tuyển chọn kỹ lưỡng. Chúng tôi cam kết về độ tinh xảo trong từng chi tiết, mang đến trải nghiệm sang trọng và độ bền vượt trội so với các sản phẩm đại trà.
              </div>
            </details>
            <details className="group py-5 border-b border-gray-200 cursor-pointer">
              <summary className="flex justify-between items-center text-sm font-medium text-gray-800 list-none outline-none">
                Trang sức có bị xỉn màu sau khi đeo một thời gian không?
                <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90 text-gray-400 flex-shrink-0" />
              </summary>
              <div className="mt-4 text-sm text-gray-600 leading-relaxed pr-8">
                Tùy thuộc vào cơ địa và cách bảo quản, trang sức có thể giảm độ sáng bóng tự nhiên. Tuy nhiên, Aurora cung cấp dịch vụ đánh bóng và làm mới miễn phí để sản phẩm của bạn luôn rạng rỡ như ngày đầu.
              </div>
            </details>
            <details className="group py-5 border-b border-gray-200 cursor-pointer">
              <summary className="flex justify-between items-center text-sm font-medium text-gray-800 list-none outline-none">
                Tôi có thể đổi sang mẫu khác nếu sản phẩm chưa thật sự phù hợp không?
                <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90 text-gray-400 flex-shrink-0" />
              </summary>
              <div className="mt-4 text-sm text-gray-600 leading-relaxed pr-8">
                Hoàn toàn có thể. Aurora hỗ trợ chính sách đổi trả tận nơi trong vòng 10 ngày đầu tiên nếu sản phẩm chưa qua sử dụng và còn nguyên vẹn tem mác, hộp đựng.
              </div>
            </details>
            <details className="group py-5 border-b border-gray-200 cursor-pointer">
              <summary className="flex justify-between items-center text-sm font-medium text-gray-800 list-none outline-none">
                Trang sức có được bảo hành và chăm sóc sau khi mua không?
                <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90 text-gray-400 flex-shrink-0" />
              </summary>
              <div className="mt-4 text-sm text-gray-600 leading-relaxed pr-8">
                Có. Chúng tôi cung cấp chính sách bảo hành 12 tháng tận nơi cho tất cả các lỗi kỹ thuật từ nhà sản xuất, cùng dịch vụ làm sạch trọn đời.
              </div>
            </details>
            <details className="group py-5 border-b border-gray-200 cursor-pointer">
              <summary className="flex justify-between items-center text-sm font-medium text-gray-800 list-none outline-none">
                Aurora có hỗ trợ khắc tên hoặc đóng gói quà tặng cá nhân hóa không?
                <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90 text-gray-400 flex-shrink-0" />
              </summary>
              <div className="mt-4 text-sm text-gray-600 leading-relaxed pr-8">
                Dịch vụ đóng gói quà tặng cao cấp được cung cấp miễn phí kèm theo thiệp viết tay. Đối với dịch vụ khắc tên, quý khách vui lòng liên hệ bộ phận CSKH để được tư vấn các mẫu thiết kế phù hợp.
              </div>
            </details>
            <details className="group py-5 border-b border-gray-200 cursor-pointer">
              <summary className="flex justify-between items-center text-sm font-medium text-gray-800 list-none outline-none">
                Tôi sẽ nhận được sản phẩm trong bao lâu sau khi đặt hàng?
                <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90 text-gray-400 flex-shrink-0" />
              </summary>
              <div className="mt-4 text-sm text-gray-600 leading-relaxed pr-8">
                Đối với khu vực nội thành, thời gian giao hàng từ 1-2 ngày làm việc. Các tỉnh thành khác sẽ mất từ 3-5 ngày làm việc thông qua dịch vụ chuyển phát nhanh bảo hiểm toàn giá trị.
              </div>
            </details>
          </div>
        </div>

      </section>
    </div>
  );
}