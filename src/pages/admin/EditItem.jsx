import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, Loader2, Check } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(''); 
  
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axiosClient.get(`/items/${id}`);
        const data = res.data;
        
        setCategory(data.category || '');
        setTitle(data.title || '');
        setType(data.attributes?.type || '');
        setColor(data.attributes?.color || '');
        setSize(data.attributes?.size || '');
        setDescription(data.description || '');
        setPrice(Number(data.price).toLocaleString('en-US'));
      } catch (err) {
        setError("Failed to load item details.");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const needsColor = ['Du long', 'Đông linh', 'Mã não'].includes(type);

  useEffect(() => {
    if (!needsColor) setColor('');
  }, [type, needsColor]);

  const handlePriceChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, ''); 
    if (!rawValue) { setPrice(''); return; }
    setPrice(Number(rawValue).toLocaleString('en-US'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('category', category); // Still required by backend validation
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price.replace(/,/g, ''));
    
    if (category === 'Vòng Tay') {
      formData.append('type', type);
      formData.append('color', color);
      formData.append('size', size);
    }

    if (mainImage) formData.append('main_image', mainImage);
    additionalImages.forEach(file => formData.append('additional_images', file));

    try {
      await axiosClient.put(`/items/${id}`, formData);
      setSuccess(true);
      setTimeout(() => navigate('/admin/listings'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update the listing.");
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold tracking-widest text-gray-500 uppercase">Loading Data...</div>;

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans pb-20 relative">
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-all">
          <div className="bg-white p-10 border border-gray-200 shadow-2xl text-center max-w-sm flex flex-col items-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-serif text-black mb-2">Item Updated!</h3>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-8 py-16">
        <Link to="/admin/listings" className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 hover:text-black transition-colors uppercase mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Listings
        </Link>
        <h1 className="text-4xl font-serif text-black mb-10">Edit Item</h1>
        {error && <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white p-10 border border-gray-100 flex flex-col gap-8 shadow-sm">
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold tracking-widest text-gray-800 uppercase">Category (Locked)</label>
            <input type="text" disabled value={category} className="w-full border border-gray-200 px-4 py-3.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold tracking-widest text-gray-800 uppercase">Title *</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:outline-none focus:border-gray-400" />
          </div>

          {category === 'Vòng Tay' && (
            <div className={`grid grid-cols-1 ${needsColor ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 bg-gray-50 p-6 border border-gray-100`}>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold tracking-widest text-gray-800 uppercase">Type *</label>
                <select value={type} onChange={(e) => setType(e.target.value)} required className="w-full border border-gray-200 px-3 py-3 text-sm focus:outline-none">
                  <option value="Tụ Nham">Tụ Nham</option>
                  <option value="Du long hoa bay">Du long hoa bay</option>
                  <option value="Thiên Sơn thuỷ">Thiên Sơn thuỷ</option>
                  <option value="Du long">Du long</option>
                  <option value="Đông linh">Đông linh</option>
                  <option value="Thiên Sơn thuỷ đũa">Thiên Sơn thuỷ đũa</option>
                  <option value="Mã não">Mã não</option>
                  <option value="Hoà điền">Hoà điền</option>
                </select>
              </div>
              {needsColor && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-800 uppercase">Color *</label>
                  <select value={color} onChange={(e) => setColor(e.target.value)} required className="w-full border border-gray-200 px-3 py-3 text-sm focus:outline-none">
                    <option value="Aqua">Aqua</option>
                    <option value="Đỏ">Đỏ</option>
                    <option value="Tím">Tím</option>
                    <option value="Hẹ">Hẹ</option>
                    <option value="Đũa">Đũa</option>
                    <option value="Trắng">Trắng</option>
                    <option value="Vàng">Vàng</option>
                    <option value="Xanh thiên thanh">Xanh thiên thanh</option>
                    <option value="Xanh tiffany">Xanh tiffany</option>
                    <option value="Hồng bưởi">Hồng bưởi</option>
                    <option value="Xanh hồng">Xanh hồng</option>
                    <option value="Trắng hồng">Trắng hồng</option>
                    <option value="Xanh mạ">Xanh mạ</option>
                    <option value="Xanh lá">Xanh lá</option>
                  </select>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold tracking-widest text-gray-800 uppercase">Size (cm) *</label>
                <select value={size} onChange={(e) => setSize(e.target.value)} required className="w-full border border-gray-200 px-3 py-3 text-sm focus:outline-none">
                  <option value="51">51</option>
                  <option value="52">52</option>
                  <option value="53">53</option>
                  <option value="54">54</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold tracking-widest text-gray-800 uppercase">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4" className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:outline-none focus:border-gray-400 resize-none" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold tracking-widest text-gray-800 uppercase">Price (VND) *</label>
            <input type="text" required value={price} onChange={handlePriceChange} className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:outline-none focus:border-gray-400" />
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col gap-6">
            <h3 className="text-xl font-serif text-black">Update Images (Optional)</h3>
            <p className="text-xs text-gray-500 -mt-4">Leave these blank to keep your current images.</p>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold tracking-widest text-gray-800 uppercase">New Main Image</label>
              <input type="file" accept="image/*" onChange={(e) => setMainImage(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:tracking-widest file:uppercase file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold tracking-widest text-gray-800 uppercase">New Additional Images</label>
              <input type="file" accept="image/*" multiple onChange={(e) => setAdditionalImages(Array.from(e.target.files))} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:tracking-widest file:uppercase file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className={`w-full text-white text-xs font-bold tracking-[0.15em] uppercase py-4 mt-6 flex justify-center items-center gap-2 transition-colors ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1a1a1a] hover:bg-black'}`}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isSubmitting ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </form>
      </div>
    </div>
  );
}