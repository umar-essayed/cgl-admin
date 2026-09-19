'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { 
  Wrench, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Save, 
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ServicesManagementPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ar' | 'en' | 'tech'>('ar');
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const generateUniqueServiceId = () => {
    return `srv-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  };

  const [formData, setFormData] = useState<any>({
    id: '',
    titleAr: '',
    titleEn: '',
    shortDescAr: '',
    shortDescEn: '',
    fullDescAr: '',
    fullDescEn: '',
    standardsText: '',
    scopeText: '',
    scopeTextEn: '',
    image: '',
    icon: 'Layers'
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/services');
      const data = await res.json();
      if (data.success) {
        setServices(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      id: generateUniqueServiceId(),
      titleAr: '',
      titleEn: '',
      shortDescAr: '',
      shortDescEn: '',
      fullDescAr: '',
      fullDescEn: '',
      standardsText: 'SBC 303, SBC 304, ASTM',
      scopeText: '',
      scopeTextEn: '',
      image: '/uploads/user_provided/geotech_investigation.jpeg',
      icon: 'Layers'
    });
    setActiveTab('ar');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: any) => {
    setIsEditing(true);
    setFormData({
      id: service.id,
      titleAr: service.titleAr || '',
      titleEn: service.titleEn || '',
      shortDescAr: service.shortDescAr || '',
      shortDescEn: service.shortDescEn || '',
      fullDescAr: service.fullDescAr || '',
      fullDescEn: service.fullDescEn || '',
      standardsText: Array.isArray(service.standards) ? service.standards.join(', ') : '',
      scopeText: Array.isArray(service.scopeListAr) ? service.scopeListAr.join('\n') : '',
      scopeTextEn: Array.isArray(service.scopeListEn) ? service.scopeListEn.join('\n') : '',
      image: service.image || '',
      icon: service.icon || 'Layers'
    });
    setActiveTab('ar');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        id: formData.id || generateUniqueServiceId(),
        titleAr: formData.titleAr,
        titleEn: formData.titleEn,
        shortDescAr: formData.shortDescAr,
        shortDescEn: formData.shortDescEn,
        fullDescAr: formData.fullDescAr,
        fullDescEn: formData.fullDescEn || '',
        standards: (formData.standardsText || '')
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean),
        scopeListAr: (formData.scopeText || '')
          .split('\n')
          .map((s: string) => s.trim())
          .filter(Boolean),
        scopeListEn: (formData.scopeTextEn || '')
          .split('\n')
          .map((s: string) => s.trim())
          .filter(Boolean),
        image: formData.image,
        icon: formData.icon
      };

      const url = isEditing ? `/api/services/${formData.id}` : '/api/services';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchServices();
      } else {
        alert(data.message || 'حدث خطأ أثناء حفظ بيانات الخدمة');
      }
    } catch (e) {
      console.error(e);
      alert('خطأ في الاتصال بالسيرفر');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDeleteConfirmId(null);
        fetchServices();
      } else {
        alert(data.message || 'تعذر حذف الخدمة');
      }
    } catch (e) {
      console.error(e);
      alert('خطأ في الاتصال');
    }
  };

  const filteredServices = services.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      (item.titleAr || '').toLowerCase().includes(q) ||
      (item.titleEn || '').toLowerCase().includes(q) ||
      (item.shortDescAr || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2.5">
            <Wrench className="w-5 h-5 text-[#3b76b3]" />
            <span>الخدمات الهندسية والمخبرية المتكاملة</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            إدارة وتحديث جميع الخدمات، التوصيفات الفنية، المعايير المعتمدة، والصور عالية الدقة في الواجهة.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3b76b3] hover:bg-[#2a5b8c] text-white text-xs font-bold transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة خدمة هندسية جديدة</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-[#13151a] p-3 rounded-2xl border border-[#222630]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="البحث في الخدمات بالاسم أو الوصف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#101217] border border-[#222630] rounded-xl pr-9 pl-4 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#3b76b3]"
          />
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <LoadingSpinner label="جاري استرجاع قائمة الخدمات الهندسية..." />
      ) : filteredServices.length === 0 ? (
        <div className="py-16 text-center bg-[#13151a] rounded-2xl border border-[#222630]">
          <Layers className="w-10 h-10 text-stone-600 mx-auto mb-3" />
          <p className="text-xs text-stone-400">لا توجد خدمات مطابقة لخيارات البحث</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service, idx) => (
            <div
              key={service.id}
              className="bg-[#13151a] border border-[#222630] hover:border-[#3b76b3]/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-md group"
            >
              {/* Image banner */}
              <div className="relative h-44 w-full bg-[#0d0f12] overflow-hidden">
                {service.image ? (
                  <Image
                    src={service.image}
                    alt={service.titleAr || 'خدمة CGL'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-600">
                    <Layers className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#13151a] via-[#13151a]/40 to-transparent" />
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-[#508ecb] border border-white/10">
                  #{idx + 1}
                </span>
              </div>

              {/* Card body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 group-hover:text-[#508ecb] transition-colors leading-snug">
                    {service.titleAr}
                  </h3>
                  <p className="text-xs text-stone-400 font-sans line-clamp-1 mb-2 font-mono" dir="ltr">
                    {service.titleEn}
                  </p>
                  <p className="text-xs text-stone-400 line-clamp-2 mb-3 leading-relaxed">
                    {service.shortDescAr}
                  </p>

                  {/* Standards Badges */}
                  {Array.isArray(service.standards) && service.standards.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {service.standards.slice(0, 3).map((std: string, sIdx: number) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-stone-400 font-mono"
                        >
                          {std}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#222630] flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-stone-500 truncate max-w-[140px]">
                    {service.id}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(service)}
                      className="p-1.5 rounded-lg bg-[#1a1e26] hover:bg-[#222632] text-stone-300 hover:text-white border border-[#262a36] text-xs transition-colors"
                      title="تعديل الخدمة"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {deleteConfirmId === service.id ? (
                      <div className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/30 px-2 py-1 rounded-lg">
                        <span className="text-[10px] text-rose-400">تأكيد الحذف؟</span>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="text-rose-400 font-bold text-[10px] hover:underline"
                        >
                          نعم
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-stone-400 text-[10px] hover:underline mr-1"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(service.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-colors"
                        title="حذف الخدمة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#13151a] border border-[#222630] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#222630] flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#3b76b3]" />
                <span>{isEditing ? 'تعديل بيانات الخدمة الهندسية' : 'إضافة خدمة هندسية جديدة'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#1a1e26]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-[#222630] px-4 pt-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('ar')}
                className={`px-3 py-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'ar'
                    ? 'border-[#3b76b3] text-[#508ecb]'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                البيانات بالعربية
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('en')}
                className={`px-3 py-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'en'
                    ? 'border-[#3b76b3] text-[#508ecb]'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                English Data
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tech')}
                className={`px-3 py-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'tech'
                    ? 'border-[#3b76b3] text-[#508ecb]'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                الصورة والمعايير الفنية
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {activeTab === 'ar' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-stone-300">
                        معرف الخدمة التلقائي (Unique ID)
                      </label>
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, id: generateUniqueServiceId() })}
                          className="text-[10px] text-[#3b76b3] hover:underline"
                        >
                          توليد معرف جديد 🔄
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs font-mono text-stone-300">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#3b76b3]/20 text-[#508ecb]">Auto-Generated</span>
                      <span className="font-bold">{formData.id}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1">
                      اسم الخدمة (عربي) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.titleAr}
                      onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                      required
                      placeholder="مثال: الدراسات الجيوتقنية واستكشاف التربة"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1">الوصف المختصر (عربي)</label>
                    <textarea
                      rows={2}
                      value={formData.shortDescAr}
                      onChange={(e) => setFormData({ ...formData, shortDescAr: e.target.value })}
                      placeholder="نبذة موجزة تظهر في بطاقة الخدمة بالواجهة..."
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1">الوصف التفصيلي (عربي)</label>
                    <textarea
                      rows={4}
                      value={formData.fullDescAr}
                      onChange={(e) => setFormData({ ...formData, fullDescAr: e.target.value })}
                      placeholder="توصيف موسع للمنهجية الهندسية..."
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1">
                      نطاق الأعمال ومخرجات الخدمة (كل بند في سطر مستقل)
                    </label>
                    <textarea
                      rows={4}
                      value={formData.scopeText}
                      onChange={(e) => setFormData({ ...formData, scopeText: e.target.value })}
                      placeholder="حفر الجسات الآلية بعمق يصل إلى 50 متراً&#10;تحديد سعة التحمل المسموحة للتربة&#10;إعداد التقرير الجيوتقني المعتمد"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3b76b3] font-sans"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'en' && (
                <div className="space-y-4" dir="ltr">
                  <div>
                    <label className="block text-xs text-stone-300 mb-1 font-sans">
                      Service Title (English) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.titleEn}
                      onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                      placeholder="e.g. Geotechnical & Soil Investigation"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-white font-sans focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1 font-sans">
                      Short Description (English)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.shortDescEn}
                      onChange={(e) => setFormData({ ...formData, shortDescEn: e.target.value })}
                      placeholder="Brief highlight appearing on the service card..."
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-white font-sans focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1 font-sans">
                      Detailed Methodology & Scope (English)
                    </label>
                    <textarea
                      rows={4}
                      value={formData.fullDescEn}
                      onChange={(e) => setFormData({ ...formData, fullDescEn: e.target.value })}
                      placeholder="Comprehensive engineering methodology and technical scope..."
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-white font-sans focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1 font-sans">
                      Scope of Work & Deliverables (One item per line)
                    </label>
                    <textarea
                      rows={4}
                      value={formData.scopeTextEn}
                      onChange={(e) => setFormData({ ...formData, scopeTextEn: e.target.value })}
                      placeholder="Rotary drilling to depths of up to 50 meters&#10;Allowable bearing capacity analysis&#10;Certified geotechnical engineering dossier"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-white font-sans focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'tech' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-stone-300 mb-1 font-mono">
                      المعايير القياسية المعتمدة (مفصولة بفواصل)
                    </label>
                    <input
                      type="text"
                      value={formData.standardsText}
                      onChange={(e) => setFormData({ ...formData, standardsText: e.target.value })}
                      placeholder="SBC 303, SBC 304, ASTM D1586, ACI"
                      dir="ltr"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1">
                      صورة الخدمة الهندسية (Image)
                    </label>
                    <ImageUploader
                      value={formData.image}
                      onChange={(url) => setFormData({ ...formData, image: url })}
                      folder="services"
                    />
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#222630] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1a1e26] hover:bg-[#222632] text-stone-300 text-xs transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#3b76b3] hover:bg-[#2a5b8c] text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{isEditing ? 'حفظ التعديلات' : 'إضافة الخدمة'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
