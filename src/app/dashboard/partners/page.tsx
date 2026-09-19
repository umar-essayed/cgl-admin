'use client';
import LoadingSpinner from '@/components/LoadingSpinner';

import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Save, 
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';

export default function PartnersManagementPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ar' | 'en' | 'logo'>('ar');
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<any>({
    id: '',
    nameAr: '',
    nameEn: '',
    sectorAr: 'الإنشاءات الكبرى والمقاولات',
    sectorEn: 'Mega Construction & Contracting',
    collaborationScopeAr: 'الفحوصات الجيوتقنية وضبط جودة المواد',
    collaborationScopeEn: 'Geotechnical testing and materials quality control',
    badge: 'شريك معتمد',
    badgeAr: 'شريك معتمد',
    badgeEn: 'Verified Partner',
    category: 'contractor',
    logo: '/api/media/partners/binladin.png'
  });

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/partners');
      const data = await res.json();
      if (data.success) {
        setPartners(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const openNewModal = () => {
    const nextId = `cgl-partner-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    setFormData({
      id: nextId,
      nameAr: '',
      nameEn: '',
      sectorAr: 'الإنشاءات الكبرى والمقاولات',
      sectorEn: 'Mega Construction & Contracting',
      collaborationScopeAr: 'الفحوصات الجيوتقنية وضبط جودة المواد',
      collaborationScopeEn: 'Geotechnical testing and materials quality control',
      badge: 'شريك معتمد',
      badgeAr: 'شريك معتمد',
      badgeEn: 'Verified Partner',
      category: 'contractor',
      logo: ''
    });
    setIsEditing(false);
    setActiveTab('ar');
    setIsModalOpen(true);
  };

  const openEditModal = (partner: any) => {
    setFormData({
      ...partner,
      sectorEn: partner.sectorEn || '',
      collaborationScopeEn: partner.collaborationScopeEn || '',
      badgeAr: partner.badgeAr || partner.badge || 'شريك معتمد',
      badgeEn: partner.badgeEn || 'Verified Partner'
    });
    setIsEditing(true);
    setActiveTab('ar');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        badge: formData.badgeAr || formData.badge || 'شريك معتمد'
      };

      if (isEditing) {
        await fetch(`/api/partners/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/partners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      fetchPartners();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/partners/${id}`, { method: 'DELETE' });
      setDeleteConfirmId(null);
      fetchPartners();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPartners = partners.filter((p) => {
    return (
      (p.nameAr || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nameEn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sectorAr || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-[#3b76b3]" />
            <span>شركاء النجاح والعملاء المعتمدون</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            إدارة شعارات الشركاء المعروضة في شريط الهيرو المتحرك وفي صفحة من نحن بالعربية والإنجليزية.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3b76b3] hover:bg-[#2a5b8c] text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة شريك جديد</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#15181e] p-3 rounded-2xl border border-[#222630]">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="البحث باسم الشريك، القطاع، أو نطاق التعاون..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#101217] border border-[#222630] rounded-xl pr-9 pl-4 py-2 text-xs text-stone-200 placeholder-stone-400 focus:outline-none focus:border-[#3b76b3]"
          />
        </div>
      </div>

      {/* Partners Grid */}
      {loading ? (
        <LoadingSpinner label="جاري استرجاع قائمة الشركاء والعملاء..." />
      ) : filteredPartners.length === 0 ? (
        <div className="py-20 text-center text-stone-400 text-xs bg-[#15181e] rounded-2xl border border-[#222630]">
          لا يوجد شركاء يطابقون معايير البحث
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPartners.map((p) => (
            <div
              key={p.id}
              className="bg-[#15181e] border border-[#222630] rounded-2xl p-4 flex flex-col justify-between hover:border-stone-600 transition-colors"
            >
              <div>
                {/* Logo Container */}
                <div className="h-24 w-full rounded-xl bg-[#0a0a0a] border border-[#222630] flex items-center justify-center p-3 mb-3 relative overflow-hidden">
                  <img
                    src={p.logo || '/assets/cgl-logo1.png'}
                    alt={p.nameAr}
                    className="max-h-full max-w-full object-contain filter drop-shadow-md"
                    onError={(e: any) => {
                      e.target.src = '/assets/cgl-logo1.png';
                    }}
                  />
                  {(p.badgeAr || p.badge) && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-mono bg-[#1a1e26] text-stone-300 border border-[#2e3442]">
                      {p.badgeAr || p.badge}
                    </span>
                  )}
                </div>

                {/* Name & Sector */}
                <h3 className="font-bold text-sm text-stone-100 line-clamp-1 mb-0.5">{p.nameAr}</h3>
                <p className="text-[11px] text-stone-400 font-sans line-clamp-1 mb-2" dir="ltr">{p.nameEn}</p>
                <div className="text-[10px] text-stone-400 bg-[#101217] px-2.5 py-1.5 rounded-lg border border-[#222630] line-clamp-1">
                  {p.sectorAr || 'القطاع الإنشائي والهندسي'}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-[#222630] flex items-center justify-between text-xs">
                <span className="text-[10px] text-stone-400 font-mono">
                  {p.category === 'government' ? 'جهة حكومية' : p.category === 'consultant' ? 'استشاري' : 'مقاولات'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1.5 rounded-lg bg-[#1a1e26] hover:bg-[#252b37] text-stone-300 hover:text-white transition-colors border border-[#262b37]"
                    title="تعديل الشريك"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(p.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors border border-rose-500/20"
                    title="حذف الشريك"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#15181e] border border-[#222630] rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-stone-100 mb-1">تأكيد إزالة الشريك</h3>
            <p className="text-xs text-stone-400 mb-5">
              هل أنت متأكد من حذف هذا الشريك من قاعدة بيانات الشركاء؟
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

      {/* Add / Edit Partner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-[#15181e] border border-[#222630] rounded-t-3xl sm:rounded-2xl max-w-2xl w-full my-0 sm:my-8 max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#222630] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#3b76b3]" />
                  <span>{isEditing ? 'تعديل بيانات الشريك' : 'إضافة شريك نجاح جديد'}</span>
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
                onClick={() => setActiveTab('logo')}
                className={`flex items-center gap-1.5 py-2.5 sm:py-3 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'logo'
                    ? 'border-[#3b76b3] text-[#3b76b3] bg-[#15181e]'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>🏢 الشعار والتصنيف</span>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              
              {/* TAB 1: Arabic Content */}
              {activeTab === 'ar' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      اسم الشريك أو الجهة (عربي) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nameAr}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                      placeholder="مثال: مجموعة بن لادن السعودية"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      قطاع النشاط (عربي) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sectorAr}
                      onChange={(e) => setFormData({ ...formData, sectorAr: e.target.value })}
                      placeholder="مثال: الإنشاءات الكبرى والمطارات والبنية التحتية"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      نطاق التعاون والفحوصات (عربي)
                    </label>
                    <input
                      type="text"
                      value={formData.collaborationScopeAr}
                      onChange={(e) => setFormData({ ...formData, collaborationScopeAr: e.target.value })}
                      placeholder="مثال: فحوصات استكشاف التربة واختبارات الخوازيق الاستاتيكية"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      الشارة التميزية (عربي)
                    </label>
                    <input
                      type="text"
                      value={formData.badgeAr}
                      onChange={(e) => setFormData({ ...formData, badgeAr: e.target.value })}
                      placeholder="مثال: مقاول معتمد Tier-1 أو عميل استراتيجي"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: English Content */}
              {activeTab === 'en' && (
                <div className="space-y-4" dir="ltr">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      Partner / Client Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      placeholder="e.g. Saudi Binladin Group"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      Activity Sector (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sectorEn}
                      onChange={(e) => setFormData({ ...formData, sectorEn: e.target.value })}
                      placeholder="e.g. Heavy Infrastructure & Airports"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      Scope of Collaboration (English)
                    </label>
                    <input
                      type="text"
                      value={formData.collaborationScopeEn}
                      onChange={(e) => setFormData({ ...formData, collaborationScopeEn: e.target.value })}
                      placeholder="e.g. Geotechnical investigation & pile load testing"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      Partner Badge (English)
                    </label>
                    <input
                      type="text"
                      value={formData.badgeEn}
                      onChange={(e) => setFormData({ ...formData, badgeEn: e.target.value })}
                      placeholder="e.g. Tier-1 Contractor or Strategic Client"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: Logo & Category */}
              {activeTab === 'logo' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      تصنيف الشريك الهندسي
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-[#3b76b3]"
                    >
                      <option value="contractor">شركات مقاولات وإنشاءات كبرى (Contractor)</option>
                      <option value="government">جهات وهيئات حكومية (Government)</option>
                      <option value="consultant">مكاتب استشارات هندسية (Consultant)</option>
                      <option value="developer">شركات تطوير عقاري واستثماري (Developer)</option>
                    </select>
                  </div>

                  <div>
                    <ImageUploader
                      value={formData.logo}
                      onChange={(url) => setFormData({ ...formData, logo: url })}
                      folder="partners"
                      label="شعار الشريك (يفضل بصيغة PNG بخلفية شفافة)"
                    />
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
                    onClick={() => setActiveTab('logo')}
                    className={`px-2.5 py-1 rounded text-[11px] ${activeTab === 'logo' ? 'bg-[#3b76b3]/20 text-[#3b76b3]' : 'text-stone-500'}`}
                  >
                    3. الشعار
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
                        <span>{isEditing ? 'حفظ التعديلات' : 'إضافة الشريك'}</span>
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
