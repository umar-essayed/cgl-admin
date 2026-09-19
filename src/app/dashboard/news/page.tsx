'use client';
import LoadingSpinner from '@/components/LoadingSpinner';

import React, { useEffect, useState } from 'react';
import { 
  Newspaper, 
  Plus, 
  Minus,
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Save, 
  AlertTriangle,
  Star,
  Calendar,
  Clock,
  BookOpen,
  Globe,
  Settings2,
  FileText
} from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';

function formatReadingTime(minutes: number) {
  const m = Math.max(1, Math.min(120, Number(minutes) || 3));
  let ar = `${m} دقيقة قراءة`;
  if (m === 1) ar = 'دقيقة قراءة';
  else if (m === 2) ar = 'دقيقتان قراءة';
  else if (m >= 3 && m <= 10) ar = `${m} دقائق قراءة`;
  return {
    readMinutes: m,
    readTimeAr: ar,
    readTimeEn: `${m} min read`
  };
}

export default function NewsManagementPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    setVisibleCount(10);
  }, [searchQuery]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ar' | 'en' | 'media'>('ar');
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<any>({
    id: '',
    titleAr: '',
    titleEn: '',
    excerptAr: '',
    excerptEn: '',
    contentAr: '',
    contentEn: '',
    categoryAr: 'كود البناء والاشتراطات',
    categoryEn: 'Building Codes & Standards',
    authorAr: 'المكتب الفني لمختبرات CGL',
    authorEn: 'CGL Technical Advisory Team',
    date: new Date().toISOString().split('T')[0],
    readMinutes: 3,
    readTimeAr: '3 دقائق قراءة',
    readTimeEn: '3 min read',
    image: '',
    featured: false
  });

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.success) {
        setArticles(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const generateUniqueNewsId = () => {
    return `news-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  };

  const openNewModal = () => {
    setFormData({
      id: generateUniqueNewsId(),
      titleAr: '',
      titleEn: '',
      excerptAr: '',
      excerptEn: '',
      contentAr: '',
      contentEn: '',
      categoryAr: 'كود البناء والاشتراطات',
      categoryEn: 'Building Codes & Standards',
      authorAr: 'المكتب الفني لمختبرات CGL',
      authorEn: 'CGL Technical Advisory Team',
      date: new Date().toISOString().split('T')[0],
      readMinutes: 3,
      readTimeAr: '3 دقائق قراءة',
      readTimeEn: '3 min read',
      image: '/api/media/news/news_saudi_building_code_lab.jpg',
      featured: false
    });
    setIsEditing(false);
    setActiveTab('ar');
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    // Determine readMinutes if not set
    const parsedMinutes = item.readMinutes || parseInt(item.readTimeAr || item.readTimeEn) || 3;
    const timeFormatted = formatReadingTime(parsedMinutes);

    setFormData({
      ...item,
      readMinutes: timeFormatted.readMinutes,
      readTimeAr: item.readTimeAr || timeFormatted.readTimeAr,
      readTimeEn: item.readTimeEn || timeFormatted.readTimeEn,
      contentAr: item.contentAr || '',
      contentEn: item.contentEn || '',
      authorAr: item.authorAr || 'المكتب الفني لمختبرات CGL',
      authorEn: item.authorEn || 'CGL Technical Advisory Team',
    });
    setIsEditing(true);
    setActiveTab('ar');
    setIsModalOpen(true);
  };

  const handleMinutesChange = (mins: number) => {
    const formatted = formatReadingTime(mins);
    setFormData((prev: any) => ({
      ...prev,
      readMinutes: formatted.readMinutes,
      readTimeAr: formatted.readTimeAr,
      readTimeEn: formatted.readTimeEn
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        coverImage: formData.image, // ensure both image and coverImage are set
      };

      if (isEditing) {
        await fetch(`/api/news/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      fetchNews();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/news/${id}`, { method: 'DELETE' });
      setDeleteConfirmId(null);
      fetchNews();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFeatured = async (article: any) => {
    try {
      await fetch(`/api/news/${article.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...article, featured: !article.featured })
      });
      fetchNews();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredArticles = articles.filter((art) => {
    return (
      (art.titleAr || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.titleEn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.categoryAr || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2.5">
            <Newspaper className="w-5 h-5 text-[#3b76b3]" />
            <span>الأخبار والمقالات والبيانات الهندسية</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            نشر المقالات التقنية، اشتراطات كود البناء السعودي، وتحديثات مشاريع CGL بالعربية والإنجليزية.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3b76b3] hover:bg-[#2a5b8c] text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مقال جديد</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#15181e] p-3 rounded-2xl border border-[#222630]">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="البحث بعنوان الخبر، التصنيف، أو الكلمات الدلالية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#101217] border border-[#222630] rounded-xl pr-9 pl-4 py-2 text-xs text-stone-200 placeholder-stone-400 focus:outline-none focus:border-[#3b76b3]"
          />
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <LoadingSpinner label="جاري استرجاع الأخبار والمقالات..." />
      ) : filteredArticles.length === 0 ? (
        <div className="py-20 text-center text-stone-400 text-xs bg-[#15181e] rounded-2xl border border-[#222630]">
          لا توجد مقالات أو أخبار مطابقة لمعايير البحث
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredArticles.slice(0, visibleCount).map((article) => (
              <div
                key={article.id}
                className="bg-[#15181e] border border-[#222630] rounded-2xl overflow-hidden flex flex-col justify-between hover:border-stone-600 transition-colors"
              >
                <div>
                  {/* Image Header */}
                  <div className="relative h-44 w-full bg-[#101217] overflow-hidden border-b border-[#222630]">
                    <img
                      src={article.image || article.coverImage || '/assets/sliders/slider1.jpg'}
                      alt={article.titleAr}
                      className="w-full h-full object-cover opacity-85"
                      onError={(e: any) => {
                        e.target.src = '/assets/sliders/slider1.jpg';
                      }}
                    />

                    {/* Category Pill */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-lg bg-[#101217]/90 border border-[#2e3442] text-[10px] font-mono text-stone-300 font-semibold">
                        {article.categoryAr}
                      </span>
                    </div>

                    {/* Featured Badge Button */}
                    <button
                      onClick={() => toggleFeatured(article)}
                      className={`absolute top-3 left-3 p-1.5 rounded-lg backdrop-blur-md border transition-colors ${
                        article.featured
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-black/50 text-stone-400 border-white/10 hover:text-white'
                      }`}
                      title={article.featured ? 'خبر مميز' : 'تمييز كخبر رئيسي'}
                    >
                      <Star className={`w-3.5 h-3.5 ${article.featured ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  {/* Article Info */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center gap-3 text-[10px] font-mono text-stone-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#3b76b3]" />
                        <span>{article.dateAr || article.date}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#3b76b3]" />
                        <span>{article.readTimeAr || `${article.readMinutes || 3} دقائق قراءة`}</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-stone-100 line-clamp-2 leading-snug">
                      {article.titleAr}
                    </h3>

                    <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                      {article.excerptAr}
                    </p>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 pt-3 border-t border-[#222630] flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-[#3b76b3] bg-[#3b76b3]/10 px-2 py-0.5 rounded">
                    ⏱️ {article.readMinutes || parseInt(article.readTimeAr) || 3} دقيقة قراءة
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(article)}
                      className="p-1.5 rounded-lg bg-[#1a1e26] hover:bg-[#252b37] text-stone-300 hover:text-white transition-colors border border-[#262b37]"
                      title="تعديل المقال"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(article.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors border border-rose-500/20"
                      title="حذف المقال"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {filteredArticles.length > 10 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#15181e] rounded-2xl border border-[#222630]">
              <div className="text-xs text-stone-300">
                عرض <span className="text-white font-bold">{Math.min(visibleCount, filteredArticles.length)}</span> من أصل <span className="text-white font-bold">{filteredArticles.length}</span> مقال
              </div>
              <div className="flex items-center gap-2">
                {visibleCount < filteredArticles.length ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => Math.min(prev + 10, filteredArticles.length))}
                      className="px-4 py-2 rounded-xl bg-[#3b76b3] hover:bg-[#2a5b8c] text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
                    >
                      تحميل باقي المقالات (متبقي {filteredArticles.length - visibleCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibleCount(filteredArticles.length)}
                      className="px-3 py-2 rounded-xl bg-[#1a1e26] hover:bg-[#252b37] text-stone-300 hover:text-white text-xs font-medium border border-[#262b37] transition-colors"
                    >
                      عرض الكل
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setVisibleCount(10)}
                    className="px-3 py-2 rounded-xl bg-[#1a1e26] hover:bg-[#252b37] text-stone-400 hover:text-white text-xs font-medium border border-[#262b37] transition-colors"
                  >
                    طي القائمة (عرض 10 فقط)
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#15181e] border border-[#222630] rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-stone-100 mb-1">تأكيد حذف المقال</h3>
            <p className="text-xs text-stone-400 mb-5">
              هل أنت متأكد من رغبتك في حذف هذا المقال نهائياً من الموقع؟
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
              >
                تأكيد الحذف
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-[#1a1e26] hover:bg-[#252b37] text-stone-300 text-xs font-medium border border-[#262b37]"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Article Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-[#15181e] border border-[#222630] rounded-t-3xl sm:rounded-2xl max-w-3xl w-full my-0 sm:my-8 max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#222630] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                  <Newspaper className="w-4 h-4 sm:w-5 sm:h-5 text-[#3b76b3]" />
                  <span>{isEditing ? 'تعديل بيانات المقال' : 'إضافة مقال وخبر جديد'}</span>
                </h3>
                <p className="text-[11px] text-stone-400 font-mono mt-0.5">{formData.id}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white bg-[#101217] border border-[#222630]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Language & Settings Tabs */}
            <div className="flex border-b border-[#222630] bg-[#101217] px-2 sm:px-4 gap-1 sm:gap-2 overflow-x-auto no-scrollbar scrollbar-none flex-nowrap">
              <button
                type="button"
                onClick={() => setActiveTab('ar')}
                className={`flex items-center gap-1.5 py-2.5 sm:py-3 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'ar'
                    ? 'border-[#3b76b3] text-[#3b76b3] bg-[#15181e]'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>🇸🇦 المحتوى بالعربية</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('en')}
                className={`flex items-center gap-1.5 py-2.5 sm:py-3 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'en'
                    ? 'border-[#3b76b3] text-[#3b76b3] bg-[#15181e]'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>🇬🇧 English Content</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('media')}
                className={`flex items-center gap-1.5 py-2.5 sm:py-3 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'media'
                    ? 'border-[#3b76b3] text-[#3b76b3] bg-[#15181e]'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>⚙️ الصورة والإعدادات</span>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              
              {/* TAB 1: Arabic Content */}
              {activeTab === 'ar' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      عنوان المقال بالعربية *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.titleAr}
                      onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                      placeholder="مثال: مختبرات CGL تطبق الاشتراطات المحدثة لكود البناء السعودي"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1.5">
                        التصنيف بالعربية *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.categoryAr}
                        onChange={(e) => setFormData({ ...formData, categoryAr: e.target.value })}
                        placeholder="مثال: كود البناء واللوائح"
                        className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1.5">
                        الجهة أو الكاتب (عربي)
                      </label>
                      <input
                        type="text"
                        value={formData.authorAr}
                        onChange={(e) => setFormData({ ...formData, authorAr: e.target.value })}
                        placeholder="مثال: المكتب الفني لمختبرات CGL"
                        className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      الموجز الصحفي (المعروض في البطاقة الخارجية) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={formData.excerptAr}
                      onChange={(e) => setFormData({ ...formData, excerptAr: e.target.value })}
                      placeholder="ملخص قصير من سطرين يوضح فكرة المقال..."
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  {/* Reading Time Stepper - Arabic View */}
                  <div className="p-3.5 bg-[#101217] border border-[#222630] rounded-xl flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-semibold text-stone-200 mb-0.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#3b76b3]" />
                        <span>وقت القراءة التقديري:</span>
                      </label>
                      <p className="text-[11px] text-[#3b76b3] font-mono">
                        {formData.readTimeAr}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMinutesChange(Math.max(1, (formData.readMinutes || 3) - 1))}
                        className="w-8 h-8 rounded-lg bg-[#1a1e26] hover:bg-[#252b37] border border-[#2e3543] text-stone-200 flex items-center justify-center font-bold text-base transition-colors"
                        title="تقليل الدقائق"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={formData.readMinutes || 3}
                        onChange={(e) => handleMinutesChange(parseInt(e.target.value) || 1)}
                        className="w-14 bg-[#15181e] border border-[#222630] rounded-lg py-1.5 text-center font-mono font-bold text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                      />
                      <button
                        type="button"
                        onClick={() => handleMinutesChange(Math.min(120, (formData.readMinutes || 3) + 1))}
                        className="w-8 h-8 rounded-lg bg-[#1a1e26] hover:bg-[#252b37] border border-[#2e3543] text-stone-200 flex items-center justify-center font-bold text-base transition-colors"
                        title="زيادة الدقائق"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs text-stone-400 font-mono pr-1">دقائق قراءة</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center justify-between">
                      <span>نص المقال الكامل (صفحة التفاصيل)</span>
                      <span className="text-[10px] text-stone-500 font-mono">افصل بين الفقرات بسطر فارغ</span>
                    </label>
                    <textarea
                      rows={5}
                      value={formData.contentAr}
                      onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })}
                      placeholder="اكتب هنا المقال التفصيلي الكامل الذي سيظهر للزائر عند الضغط على قراءة الخبر..."
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white leading-relaxed focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: English Content */}
              {activeTab === 'en' && (
                <div className="space-y-4" dir="ltr">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      Article Title (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.titleEn}
                      onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                      placeholder="e.g. CGL Laboratories Upgrades Geotechnical Standards Aligned with SBC"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1.5">
                        Category (English) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.categoryEn}
                        onChange={(e) => setFormData({ ...formData, categoryEn: e.target.value })}
                        placeholder="e.g. Building Code & Standards"
                        className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1.5">
                        Author / Team (English)
                      </label>
                      <input
                        type="text"
                        value={formData.authorEn}
                        onChange={(e) => setFormData({ ...formData, authorEn: e.target.value })}
                        placeholder="e.g. CGL Technical Advisory Team"
                        className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      Article Summary / Excerpt *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={formData.excerptEn}
                      onChange={(e) => setFormData({ ...formData, excerptEn: e.target.value })}
                      placeholder="Two-line summary displayed on the outer article card..."
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  {/* Reading Time Stepper - Pure English View */}
                  <div className="p-3.5 bg-[#101217] border border-[#222630] rounded-xl flex items-center justify-between" dir="ltr">
                    <div>
                      <label className="block text-xs font-semibold text-stone-200 mb-0.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#3b76b3]" />
                        <span>Estimated Reading Time:</span>
                      </label>
                      <p className="text-[11px] text-[#3b76b3] font-mono">
                        {formData.readTimeEn}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMinutesChange(Math.max(1, (formData.readMinutes || 3) - 1))}
                        className="w-8 h-8 rounded-lg bg-[#1a1e26] hover:bg-[#252b37] border border-[#2e3543] text-stone-200 flex items-center justify-center font-bold text-base transition-colors"
                        title="Decrease minutes"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={formData.readMinutes || 3}
                        onChange={(e) => handleMinutesChange(parseInt(e.target.value) || 1)}
                        className="w-14 bg-[#15181e] border border-[#222630] rounded-lg py-1.5 text-center font-mono font-bold text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                      />
                      <button
                        type="button"
                        onClick={() => handleMinutesChange(Math.min(120, (formData.readMinutes || 3) + 1))}
                        className="w-8 h-8 rounded-lg bg-[#1a1e26] hover:bg-[#252b37] border border-[#2e3543] text-stone-200 flex items-center justify-center font-bold text-base transition-colors"
                        title="Increase minutes"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs text-stone-400 font-mono pl-1">min read</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center justify-between">
                      <span>Full Article Body (Details Page)</span>
                      <span className="text-[10px] text-stone-500 font-mono">Separate paragraphs with double enter</span>
                    </label>
                    <textarea
                      rows={5}
                      value={formData.contentEn}
                      onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                      placeholder="Write the full detailed article content shown when user clicks Read Article..."
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white leading-relaxed focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: Media & Settings */}
              {activeTab === 'media' && (
                <div className="space-y-5">
                  <div>
                    <ImageUploader
                      value={formData.image}
                      onChange={(url) => setFormData({ ...formData, image: url, coverImage: url })}
                      folder="news"
                      label="صورة المقال الرئيسية"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Read Time with stepper */}
                    <div className="p-3.5 rounded-xl bg-[#101217] border border-[#222630]">
                      <label className="block text-xs font-bold text-stone-200 mb-2 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#3b76b3]" />
                        <span>وقت القراءة المقدر:</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleMinutesChange(Math.max(1, (formData.readMinutes || 3) - 1))}
                          className="w-8 h-8 rounded-lg bg-[#1a1e26] hover:bg-[#252b37] border border-[#2e3543] text-stone-200 flex items-center justify-center font-bold text-base transition-colors"
                          title="تقليل الدقائق"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={120}
                          value={formData.readMinutes || 3}
                          onChange={(e) => handleMinutesChange(parseInt(e.target.value) || 1)}
                          className="w-14 bg-[#15181e] border border-[#222630] rounded-lg py-1.5 text-center font-mono font-bold text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                        />
                        <button
                          type="button"
                          onClick={() => handleMinutesChange(Math.min(120, (formData.readMinutes || 3) + 1))}
                          className="w-8 h-8 rounded-lg bg-[#1a1e26] hover:bg-[#252b37] border border-[#2e3543] text-stone-200 flex items-center justify-center font-bold text-base transition-colors"
                          title="زيادة الدقائق"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs text-stone-400 font-mono pr-1">دقائق / min</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px] font-mono">
                        <span className="text-[#3b76b3] bg-[#3b76b3]/10 px-2 py-0.5 rounded border border-[#3b76b3]/20">🇸🇦 {formData.readTimeAr}</span>
                        <span className="text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded border border-sky-400/20">🇬🇧 {formData.readTimeEn}</span>
                      </div>
                    </div>

                    {/* Publication Date */}
                    <div className="p-3.5 rounded-xl bg-[#101217] border border-[#222630]">
                      <label className="block text-xs font-bold text-stone-200 mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#3b76b3]" />
                        <span>تاريخ النشر:</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-[#15181e] border border-[#222630] rounded-lg px-3 py-2 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#3b76b3]"
                      />
                    </div>
                  </div>

                  {/* Featured Toggle */}
                  <div className="p-3.5 rounded-xl bg-[#101217] border border-[#222630]">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4 rounded bg-[#15181e] border-[#222630] text-[#3b76b3] focus:ring-0"
                      />
                      <div>
                        <span className="text-xs text-stone-100 font-semibold block">
                          تمييز كخبر رئيسي في صدارة المركز الإعلامي
                        </span>
                        <span className="text-[10px] text-stone-400 block mt-0.5">
                          سيتم وضع شارة نجمة ذهبية على الخبر وإبرازه في الواجهة
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 sm:pt-4 border-t border-[#222630] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#1a1e26] hover:bg-[#222632] text-stone-300 text-xs font-medium border border-[#262a36] active:scale-95"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#3b76b3] hover:bg-[#2a5b8c] text-white text-xs font-bold disabled:opacity-50 active:scale-95"
                  >
                    {saving ? (
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>{isEditing ? 'حفظ التعديلات' : 'نشر المقال'}</span>
                      </>
                    )}
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
