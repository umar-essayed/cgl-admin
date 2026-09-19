'use client';
import LoadingSpinner from '@/components/LoadingSpinner';

import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Edit3, 
  Video, 
  Image as ImageIcon, 
  Clock, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  X, 
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Save,
  Globe,
  Film
} from 'lucide-react';
import MediaUploader from '@/components/MediaUploader';

interface HeroSlideItem {
  id: string;
  order: number;
  isActive: boolean;
  type: 'image' | 'video';
  mediaUrl: string;
  tagAr: string;
  tagEn: string;
  metricsAr?: string;
  metricsEn?: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  duration: number;
}

const EMPTY_SLIDE: HeroSlideItem = {
  id: '',
  order: 1,
  isActive: true,
  type: 'image',
  mediaUrl: '',
  tagAr: '',
  tagEn: '',
  titleAr: '',
  titleEn: '',
  subtitleAr: '',
  subtitleEn: '',
  duration: 6,
};

export default function HeroSliderDashboardPage() {
  const [slides, setSlides] = useState<HeroSlideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlideItem | null>(null);
  const [formData, setFormData] = useState<HeroSlideItem>(EMPTY_SLIDE);
  const [activeTab, setActiveTab] = useState<'ar' | 'en' | 'media'>('ar');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hero');
      const data = await res.json();
      if (data.success) {
        setSlides(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const openAddModal = () => {
    setEditingSlide(null);
    setFormData({
      ...EMPTY_SLIDE,
      id: `hero-slide-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      order: slides.length + 1,
      duration: 6,
    });
    setErrorMsg(null);
    setActiveTab('ar');
    setModalOpen(true);
  };

  const openEditModal = (slide: HeroSlideItem) => {
    setEditingSlide(slide);
    setFormData({ ...slide });
    setErrorMsg(null);
    setActiveTab('ar');
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا السلايد؟')) return;
    try {
      const res = await fetch(`/api/hero/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('تم حذف السلايد بنجاح وتحديث الموقع');
        setTimeout(() => setSuccessMsg(null), 3500);
        fetchSlides();
      } else {
        alert(data.message || 'فشل في حذف السلايد');
      }
    } catch (err: any) {
      alert(err.message || 'حدث خطأ');
    }
  };

  const handleToggleActive = async (slide: HeroSlideItem) => {
    try {
      const updated = { ...slide, isActive: !slide.isActive };
      const res = await fetch(`/api/hero/${slide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setSlides((prev) => prev.map((s) => (s.id === slide.id ? updated : s)));
        setSuccessMsg(updated.isActive ? 'تم تفعيل السلايد في الموقع' : 'تم إخفاء السلايد عن الموقع');
        setTimeout(() => setSuccessMsg(null), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const newSlides = [...slides];
    const [moved] = newSlides.splice(index, 1);
    newSlides.splice(targetIndex, 0, moved);

    const reorderedSlides = newSlides.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSlides(reorderedSlides);

    try {
      await Promise.all(
        reorderedSlides.map((s) =>
          fetch(`/api/hero/${s.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: s.order }),
          })
        )
      );

      setSuccessMsg('تم تحديث ترتيب ظهور السلايدات بنجاح');
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchSlides();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaving(true);

    if (!formData.titleAr) {
      setErrorMsg('يرجى كتابة عنوان السلايد بالعربية');
      setActiveTab('ar');
      setSaving(false);
      return;
    }

    if (!formData.mediaUrl) {
      setErrorMsg('يرجى رفع صورة أو فيديو للسلايد');
      setActiveTab('media');
      setSaving(false);
      return;
    }

    try {
      const isEdit = !!editingSlide;
      const url = isEdit ? `/api/hero/${editingSlide.id}` : '/api/hero';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(isEdit ? 'تم تحديث السلايد بنجاح' : 'تمت إضافة السلايد بنجاح');
        setTimeout(() => setSuccessMsg(null), 3500);
        setModalOpen(false);
        fetchSlides();
      } else {
        setErrorMsg(data.message || 'فشل في حفظ البيانات');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-[#3b76b3]" />
            <span>إدارة سلايدر الهيرو التفاعلي</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            التحكم الكامل في شرائح العرض في الواجهة الرئيسية، وتحديد الصور أو الفيديوهات، ومدة كل شريحة وترتيبها.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3b76b3] hover:bg-[#2a5b8c] text-white text-xs font-bold transition-all active:scale-[0.99] shadow-lg shadow-[#3b76b3]/10"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة شريحة جديدة</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-300">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Slides Grid / List */}
      {loading ? (
        <div className="py-24 text-center text-xs text-stone-400 font-mono">
          جاري استرجاع شرائح الهيرو من قاعدة البيانات...
        </div>
      ) : slides.length === 0 ? (
        <div className="py-20 text-center text-stone-400 text-xs bg-[#15181e] rounded-2xl border border-[#222630] p-8">
          <Sliders className="w-10 h-10 text-stone-600 mx-auto mb-3" />
          <p className="font-medium text-sm text-stone-300">لا توجد أي شرائح مضافة حالياً في الهيرو</p>
          <p className="text-xs text-stone-500 mt-1">انقر على زر "إضافة شريحة جديدة" لإدراج شريحة عرض رئيسية</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                slide.isActive
                  ? 'bg-[#15181e] border-[#222630] hover:border-stone-600'
                  : 'bg-[#111317] border-[#1d2027] opacity-60'
              }`}
            >
              {/* Order & Drag Indicator */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveOrder(index, 'up')}
                    className="p-1 rounded bg-[#101217] hover:bg-[#202530] text-stone-400 hover:text-white disabled:opacity-20"
                    title="تحريك لأعلى"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === slides.length - 1}
                    onClick={() => handleMoveOrder(index, 'down')}
                    className="p-1 rounded bg-[#101217] hover:bg-[#202530] text-stone-400 hover:text-white disabled:opacity-20"
                    title="تحريك لأسفل"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-8 h-8 rounded-xl bg-[#101217] border border-[#222630] flex items-center justify-center text-xs font-mono font-bold text-[#3b76b3]">
                  #{slide.order || index + 1}
                </div>
              </div>

              {/* Media Preview */}
              <div className="relative w-28 h-16 rounded-xl bg-black overflow-hidden border border-[#222630] flex-shrink-0 flex items-center justify-center">
                {slide.type === 'video' ? (
                  <video
                    src={slide.mediaUrl}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={slide.mediaUrl}
                    alt={slide.titleAr}
                    className="w-full h-full object-cover"
                    onError={(e: any) => {
                      e.target.src = '/assets/sliders/slider1.jpg';
                    }}
                  />
                )}
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/80 text-white flex items-center gap-1">
                  {slide.type === 'video' ? <Video className="w-2.5 h-2.5 text-sky-400" /> : <ImageIcon className="w-2.5 h-2.5 text-amber-400" />}
                  <span>{slide.duration || 6} ثوانٍ</span>
                </span>
              </div>

              {/* Details Text */}
              <div className="flex-1 min-w-0 space-y-1 w-full md:w-auto">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#3b76b3]/10 text-[#3b76b3] border border-[#3b76b3]/20">
                    {slide.tagAr || 'سلايد عام'}
                  </span>
                  <span className="text-xs text-stone-500 font-mono">
                    المدة: {slide.duration || 6} ثوانٍ
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white line-clamp-1">
                  {slide.titleAr || 'بدون عنوان'}
                </h3>

                <p className="text-xs text-stone-400 line-clamp-1 max-w-xl">
                  {slide.subtitleAr || slide.titleEn}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[#222630]/60">
                <button
                  type="button"
                  onClick={() => handleToggleActive(slide)}
                  className={`px-3 py-2 rounded-xl text-xs border transition-colors flex items-center gap-1.5 active:scale-95 ${
                    slide.isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                      : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-white'
                  }`}
                  title={slide.isActive ? 'إخفاء من الموقع' : 'تفعيل العرض بالموقع'}
                >
                  {slide.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span className="text-[11px] font-mono">{slide.isActive ? 'مفعل' : 'مخفي'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(slide)}
                    className="p-2.5 rounded-xl bg-[#1a1e26] hover:bg-[#222833] text-stone-300 hover:text-white border border-[#2a2f3d] transition-colors active:scale-95"
                    title="تعديل الشريحة"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(slide.id)}
                    className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors active:scale-95"
                    title="حذف الشريحة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simplified, Clean Hero Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#13151a] border border-[#222630] rounded-t-3xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl my-0 sm:my-8 max-h-[92vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#222630] mb-4">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 sm:w-5 sm:h-5 text-[#3b76b3]" />
                <span>{editingSlide ? 'تعديل شريحة الهيرو' : 'إضافة شريحة جديدة للهيرو'}</span>
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg bg-[#1a1e26] text-stone-400 hover:text-white border border-[#222630]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Language & Settings Tabs */}
            <div className="flex border-b border-[#222630] bg-[#0c0e12] rounded-xl p-1 mb-4 gap-1 overflow-x-auto no-scrollbar scrollbar-none flex-nowrap">
              <button
                type="button"
                onClick={() => setActiveTab('ar')}
                className={`flex-1 min-w-[100px] py-2 px-2 text-[11px] sm:text-xs font-semibold rounded-lg transition-all whitespace-nowrap text-center ${
                  activeTab === 'ar'
                    ? 'bg-[#1a1e26] text-[#3b76b3] shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                🇸🇦 عربي
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('en')}
                className={`flex-1 min-w-[100px] py-2 px-2 text-[11px] sm:text-xs font-semibold rounded-lg transition-all whitespace-nowrap text-center ${
                  activeTab === 'en'
                    ? 'bg-[#1a1e26] text-[#3b76b3] shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                🇬🇧 English
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('media')}
                className={`flex-1 min-w-[110px] py-2 px-2 text-[11px] sm:text-xs font-semibold rounded-lg transition-all whitespace-nowrap text-center ${
                  activeTab === 'media'
                    ? 'bg-[#1a1e26] text-[#3b76b3] shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                🎬 الوسائط والإعداد
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 overflow-y-auto flex-1 pr-0.5">
              
              {/* TAB 1: Arabic Content */}
              {activeTab === 'ar' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-stone-200 font-medium mb-1.5">
                      العنوان الرئيسي للشريحة (عربي) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={formData.titleAr}
                      onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                      placeholder="مثال: الدقة الهندسية في فحص التربة التي ترتكز عليها كبرى مشاريع المملكة..."
                      className="w-full bg-[#0c0e12] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-200 font-medium mb-1.5">
                      الوصف المختصر (عربي)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.subtitleAr}
                      onChange={(e) => setFormData({ ...formData, subtitleAr: e.target.value })}
                      placeholder="مثال: حفر الجسات الآلية، استخراج العينات الصخرية، واختبارات السلامة الإنشائية المعتمدة."
                      className="w-full bg-[#0c0e12] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-200 font-medium mb-1.5">
                      الوسم التصنيفي الصغير (عربي - اختياري)
                    </label>
                    <input
                      type="text"
                      value={formData.tagAr}
                      onChange={(e) => setFormData({ ...formData, tagAr: e.target.value })}
                      placeholder="مثال: الدراسات الجيوتقنية واستكشاف التربة"
                      className="w-full bg-[#0c0e12] border border-[#222630] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: English Content */}
              {activeTab === 'en' && (
                <div className="space-y-4" dir="ltr">
                  <div>
                    <label className="block text-xs text-stone-200 font-medium mb-1.5">
                      Slide Main Title (English) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={formData.titleEn}
                      onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                      placeholder="e.g. Geotechnical Engineering Precision Anchoring Saudi Arabia's Vision Projects..."
                      className="w-full bg-[#0c0e12] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-200 font-medium mb-1.5">
                      Short Subtitle Description (English)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.subtitleEn}
                      onChange={(e) => setFormData({ ...formData, subtitleEn: e.target.value })}
                      placeholder="e.g. Automated deep core drilling, slope stability evaluation, and certified foundation testing."
                      className="w-full bg-[#0c0e12] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-200 font-medium mb-1.5">
                      Small Category Badge (English - optional)
                    </label>
                    <input
                      type="text"
                      value={formData.tagEn}
                      onChange={(e) => setFormData({ ...formData, tagEn: e.target.value })}
                      placeholder="e.g. Geotechnical & Subsurface Exploration"
                      className="w-full bg-[#0c0e12] border border-[#222630] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: Media & Settings */}
              {activeTab === 'media' && (
                <div className="space-y-4">
                  {/* Clean Media Uploader */}
                  <MediaUploader
                    value={formData.mediaUrl}
                    onChange={(url) => setFormData({ ...formData, mediaUrl: url })}
                    mediaType={formData.type}
                    onMediaTypeChange={(type) => setFormData({ ...formData, type })}
                    folder="hero"
                    label="خلفية الشريحة (صورة أو فيديو)"
                    description="اختر ملف صورة (JPG, PNG) أو فيديو قصير (MP4)"
                  />

                  {/* Duration & Order */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="p-3.5 bg-[#0c0e12] rounded-xl border border-[#222630]">
                      <label className="block text-xs text-stone-200 font-medium mb-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#3b76b3]" />
                        <span>مدة العرض:</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, duration: Math.max(2, (prev.duration || 6) - 1) }))}
                          className="w-8 h-8 rounded-lg bg-[#1a1e26] hover:bg-[#252b37] border border-[#2e3543] text-stone-200 flex items-center justify-center font-bold text-base transition-colors"
                          title="تقليل الثواني"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={2}
                          max={60}
                          value={formData.duration || 6}
                          onChange={(e) => setFormData({ ...formData, duration: Math.max(2, Math.min(60, Number(e.target.value) || 2)) })}
                          className="w-14 bg-[#15181e] border border-[#222630] rounded-lg py-1.5 text-xs text-white font-mono text-center focus:outline-none focus:border-[#3b76b3]"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, duration: Math.min(60, (prev.duration || 6) + 1) }))}
                          className="w-8 h-8 rounded-lg bg-[#1a1e26] hover:bg-[#252b37] border border-[#2e3543] text-stone-200 flex items-center justify-center font-bold text-base transition-colors"
                          title="زيادة الثواني"
                        >
                          +
                        </button>
                        <span className="text-xs text-stone-400 font-mono pr-1">ثوانٍ</span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#0c0e12] rounded-xl border border-[#222630]">
                      <label className="block text-xs text-stone-200 font-medium mb-2">
                        ترتيب الشريحة:
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, order: Math.max(1, (prev.order || 1) - 1) }))}
                          className="w-8 h-8 rounded-lg bg-[#1a1e26] hover:bg-[#252b37] border border-[#2e3543] text-stone-200 flex items-center justify-center font-bold text-base transition-colors"
                          title="ترتيب سابق"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={formData.order || 1}
                          onChange={(e) => setFormData({ ...formData, order: Math.max(1, Number(e.target.value) || 1) })}
                          className="w-14 bg-[#15181e] border border-[#222630] rounded-lg py-1.5 text-xs text-white font-mono text-center focus:outline-none focus:border-[#3b76b3]"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, order: (prev.order || 1) + 1 }))}
                          className="w-8 h-8 rounded-lg bg-[#1a1e26] hover:bg-[#252b37] border border-[#2e3543] text-stone-200 flex items-center justify-center font-bold text-base transition-colors"
                          title="ترتيب لاحق"
                        >
                          +
                        </button>
                        <span className="text-xs text-stone-400 font-mono pr-1">في القائمة</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Switch */}
                  <div className="p-3 bg-[#0c0e12] rounded-xl border border-[#222630] flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-[#222630] text-[#3b76b3] focus:ring-0 bg-[#15181e]"
                    />
                    <label htmlFor="isActive" className="text-xs text-stone-200 font-medium cursor-pointer">
                      تفعيل ظهور هذه الشريحة فوراً في الصفحة الرئيسية
                    </label>
                  </div>
                </div>
              )}

              {/* Modal Bottom Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 sm:pt-4 border-t border-[#222630]">
                <div className="flex items-center justify-center sm:justify-start gap-1 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('ar')}
                    className={`px-2.5 py-1 rounded text-[11px] ${activeTab === 'ar' ? 'bg-[#3b76b3]/20 text-[#3b76b3]' : 'text-stone-500'}`}
                  >
                    1. عربي
                  </button>
                  <span className="text-stone-600">›</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('en')}
                    className={`px-2.5 py-1 rounded text-[11px] ${activeTab === 'en' ? 'bg-[#3b76b3]/20 text-[#3b76b3]' : 'text-stone-500'}`}
                  >
                    2. English
                  </button>
                  <span className="text-stone-600">›</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('media')}
                    className={`px-2.5 py-1 rounded text-[11px] ${activeTab === 'media' ? 'bg-[#3b76b3]/20 text-[#3b76b3]' : 'text-stone-500'}`}
                  >
                    3. الوسائط
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#1b1f27] hover:bg-[#252b36] text-stone-300 text-xs font-medium active:scale-95"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#3b76b3] hover:bg-[#2a5b8c] text-white font-bold text-xs shadow-lg transition-all disabled:opacity-50 active:scale-95"
                  >
                    {saving ? 'جاري الحفظ...' : editingSlide ? 'تحديث الشريحة' : 'إضافة الشريحة'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
