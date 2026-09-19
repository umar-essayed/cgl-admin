'use client';
import LoadingSpinner from '@/components/LoadingSpinner';

import React, { useEffect, useState } from 'react';
import { 
  Truck, 
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

export default function EquipmentManagementPage() {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ar' | 'en' | 'tech'>('ar');
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<any>({
    id: '',
    code: '',
    nameAr: '',
    nameEn: '',
    category: 'drilling',
    categoryNameAr: 'حفر الجسات واستكشاف التربة',
    categoryNameEn: 'Drilling & Geotechnical Exploration',
    descriptionAr: '',
    descriptionEn: '',
    specsArText: '',
    specsEnText: '',
    standardsText: 'ASTM D1586, SBC 303',
    image: '/api/media/projects/mining_rotary_core_drilling_rig.jpg'
  });

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/equipment');
      const data = await res.json();
      if (data.success) {
        setEquipment(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const generateUniqueEquipId = () => {
    return `cgl-eq-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  };

  const openNewModal = () => {
    setFormData({
      id: generateUniqueEquipId(),
      code: `CGL-EQ-${100 + equipment.length + 1}`,
      nameAr: '',
      nameEn: '',
      category: 'drilling',
      categoryNameAr: 'حفر الجسات واستكشاف التربة',
      categoryNameEn: 'Drilling & Geotechnical Exploration',
      descriptionAr: '',
      descriptionEn: '',
      specsArText: '',
      specsEnText: '',
      standardsText: 'ASTM D1586, SBC 303',
      image: '/api/media/projects/mining_rotary_core_drilling_rig.jpg'
    });
    setIsEditing(false);
    setActiveTab('ar');
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    const specsAr = Array.isArray(item.specsAr) ? item.specsAr.join('\n') : (item.specsAr || '');
    const specsEn = Array.isArray(item.specsEn) ? item.specsEn.join('\n') : (item.specsEn || '');
    const standards = Array.isArray(item.standards) ? item.standards.join(', ') : (item.standards || '');

    setFormData({
      ...item,
      specsArText: specsAr,
      specsEnText: specsEn,
      standardsText: standards,
      descriptionAr: item.descriptionAr || '',
      descriptionEn: item.descriptionEn || '',
    });
    setIsEditing(true);
    setActiveTab('ar');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const specsArList = (formData.specsArText || '').split('\n').map((s: string) => s.trim()).filter(Boolean);
      const specsEnList = (formData.specsEnText || '').split('\n').map((s: string) => s.trim()).filter(Boolean);
      const standardsList = (formData.standardsText || '').split(',').map((s: string) => s.trim()).filter(Boolean);

      const payload = {
        ...formData,
        specsAr: specsArList,
        specsEn: specsEnList,
        standards: standardsList.length > 0 ? standardsList : ['SBC 303']
      };

      if (isEditing) {
        await fetch(`/api/equipment/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/equipment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      fetchEquipment();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/equipment/${id}`, { method: 'DELETE' });
      setDeleteConfirmId(null);
      fetchEquipment();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEquipment = equipment.filter((eq) => {
    const matchesSearch = 
      (eq.nameAr || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (eq.nameEn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (eq.code || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || eq.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-[#3b76b3]" />
            <span>أسطول المعدات والآليات الهندسية</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            إدارة وتوثيق آليات حفر الجسات، معامل الفحص الميداني، وأجهزة الاختبارات اللاإتلافية والمسح.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3b76b3] hover:bg-[#2a5b8c] text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة معدة للأسطول</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#15181e] p-3 rounded-2xl border border-[#222630]">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="البحث باسم الآلية أو الرمز الكودي (مثال: CGL-EQ-100)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#101217] border border-[#222630] rounded-xl pr-9 pl-4 py-2 text-xs text-stone-200 placeholder-stone-400 focus:outline-none focus:border-[#3b76b3]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'كافة المعدات' },
            { id: 'drilling', label: 'حفر واستكشاف' },
            { id: 'materials', label: 'فحص المواد' },
            { id: 'ndt', label: 'الفحص اللاإتلافي' },
            { id: 'surveying', label: 'المسح الطبوغرافي' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-stone-200 text-black font-bold'
                  : 'bg-[#101217] text-stone-400 hover:text-stone-200 border border-[#222630]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Cards */}
      {loading ? (
        <LoadingSpinner label="جاري استرجاع أسطول المعدات..." />
      ) : filteredEquipment.length === 0 ? (
        <div className="py-20 text-center text-stone-400 text-xs bg-[#15181e] rounded-2xl border border-[#222630]">
          لم يتم العثور على أي معدات مطابقة للبحث
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredEquipment.map((eq) => (
            <div
              key={eq.id}
              className="bg-[#15181e] border border-[#222630] rounded-2xl overflow-hidden flex flex-col justify-between hover:border-stone-600 transition-colors"
            >
              {/* Media Header */}
              <div className="relative h-44 w-full bg-[#101217] overflow-hidden border-b border-[#222630]">
                <img
                  src={eq.image || '/assets/sliders/slider1.jpg'}
                  alt={eq.nameAr}
                  className="w-full h-full object-cover opacity-85"
                  onError={(e: any) => {
                    e.target.src = '/assets/sliders/slider1.jpg';
                  }}
                />
                
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-lg bg-[#101217]/90 border border-[#2e3442] text-[10px] font-mono text-stone-300 font-semibold">
                    {eq.code || eq.id}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3">
                  <span className="text-[10px] text-stone-200 font-medium bg-black/75 px-2.5 py-1 rounded-lg border border-white/10">
                    {eq.categoryNameAr || eq.category}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2.5">
                <h3 className="font-bold text-sm text-stone-100 line-clamp-1">
                  {eq.nameAr}
                </h3>
                <p className="text-[11px] text-stone-400 font-sans line-clamp-1" dir="ltr">
                  {eq.nameEn}
                </p>

                {eq.specsAr && eq.specsAr.length > 0 && (
                  <ul className="space-y-1 pt-1">
                    {eq.specsAr.slice(0, 2).map((spec: string, idx: number) => (
                      <li key={idx} className="text-[11px] text-stone-400 flex items-start gap-1.5 leading-tight">
                        <span className="text-[#3b76b3] font-bold">•</span>
                        <span className="truncate">{spec}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-4 pt-3 border-t border-[#222630] flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-stone-500">
                  {Array.isArray(eq.standards) ? eq.standards[0] : 'SBC 303'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(eq)}
                    className="p-1.5 rounded-lg bg-[#1a1e26] hover:bg-[#252b37] text-stone-300 hover:text-white transition-colors border border-[#262b37]"
                    title="تعديل الآلية"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(eq.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors border border-rose-500/20"
                    title="حذف الآلية"
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
            <h3 className="font-bold text-sm text-stone-100 mb-1">تأكيد حذف الآلية</h3>
            <p className="text-xs text-stone-400 mb-5">
              هل أنت متأكد من حذف هذه الآلية من قاعدة بيانات الأسطول؟
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

      {/* Add / Edit Equipment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-[#15181e] border border-[#222630] rounded-t-3xl sm:rounded-2xl max-w-3xl w-full my-0 sm:my-8 max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#222630] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-[#3b76b3]" />
                  <span>{isEditing ? 'تعديل بيانات الآلية الهندسية' : 'إضافة معدة للأسطول'}</span>
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
                onClick={() => setActiveTab('tech')}
                className={`flex items-center gap-1.5 py-2.5 sm:py-3 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'tech'
                    ? 'border-[#3b76b3] text-[#3b76b3] bg-[#15181e]'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>⚙️ الصورة والكود</span>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              
              {/* TAB 1: Arabic Content */}
              {activeTab === 'ar' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      اسم الآلية الهندسية (عربي) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nameAr}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                      placeholder="مثال: حفارة الجسات الهيدروليكية الدوارة المجنزرة"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      اسم التصنيف (عربي)
                    </label>
                    <input
                      type="text"
                      value={formData.categoryNameAr}
                      onChange={(e) => setFormData({ ...formData, categoryNameAr: e.target.value })}
                      placeholder="مثال: حفر الجسات واستكشاف التربة"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      الوصف العام للآلية (عربي)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.descriptionAr}
                      onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                      placeholder="وحدة حفر دوارة متقدمة لأخذ العينات اللبية وأعماق استكشاف حتى 80 متراً..."
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center justify-between">
                      <span>المواصفات الفنية (عربي)</span>
                      <span className="text-[10px] text-stone-500 font-mono">اكتب كل مواصفة في سطر منفصل</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formData.specsArText}
                      onChange={(e) => setFormData({ ...formData, specsArText: e.target.value })}
                      placeholder="أعماق حفر تصل إلى 60 متراً&#10;أخذ عينات أسطوانية مقلقلة وغير مقلقلة&#10;نظام قياس عزم هيدروليكي"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: English Content */}
              {activeTab === 'en' && (
                <div className="space-y-4" dir="ltr">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      Equipment Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      placeholder="e.g. Hydraulic Rotary Crawler Core Drilling Rig"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      Category Name (English)
                    </label>
                    <input
                      type="text"
                      value={formData.categoryNameEn}
                      onChange={(e) => setFormData({ ...formData, categoryNameEn: e.target.value })}
                      placeholder="e.g. Drilling & Subsurface Exploration"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      Equipment Description (English)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.descriptionEn}
                      onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                      placeholder="Heavy rotary core drilling rig capable of deep rock exploration up to 80m..."
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center justify-between">
                      <span>Technical Specifications (English)</span>
                      <span className="text-[10px] text-stone-500 font-mono">One spec per line</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formData.specsEnText}
                      onChange={(e) => setFormData({ ...formData, specsEnText: e.target.value })}
                      placeholder="Drilling depths up to 60m&#10;Continuous rock coring and SPT sampling&#10;Hydraulic torque control system"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: Technical & Media */}
              {activeTab === 'tech' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-stone-300">
                          معرف الآلية التلقائي (Unique ID)
                        </label>
                        {!isEditing && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, id: generateUniqueEquipId() })}
                            className="text-[10px] text-[#3b76b3] hover:underline"
                          >
                            توليد جديد 🔄
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs font-mono text-stone-300">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#3b76b3]/20 text-[#508ecb]">Auto-Generated</span>
                        <span className="font-bold">{formData.id}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1.5">
                        الرمز الكودي للآلية (Code) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="مثال: CGL-EQ-101"
                        className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#3b76b3]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      التصنيف الهندسي الرئيسي
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const val = e.target.value;
                        const catNames: Record<string, { ar: string; en: string }> = {
                          drilling: { ar: 'معدات حفر واستكشاف', en: 'Drilling Equipment' },
                          materials: { ar: 'فحص المواد الإنشائية', en: 'Materials Testing' },
                          ndt: { ar: 'الفحص اللاإتلافي والرادار', en: 'NDT & Geophysical' },
                          surveying: { ar: 'المسح الطبوغرافي والجيوديسي', en: 'Topographic Surveying' }
                        };
                        setFormData({ 
                          ...formData, 
                          category: val,
                          categoryNameAr: catNames[val]?.ar || val,
                          categoryNameEn: catNames[val]?.en || val
                        });
                      }}
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-[#3b76b3]"
                    >
                      <option value="drilling">حفر الجسات واستكشاف التربة (Drilling)</option>
                      <option value="materials">فحص الخرسانة والمواد الإنشائية (Materials)</option>
                      <option value="ndt">الفحص اللاإتلافي والرادار الأرضي (NDT & GPR)</option>
                      <option value="surveying">المسح الطبوغرافي والجيوديسي (Surveying)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      المعايير المعتمدة (مفصولة بفواصل)
                    </label>
                    <input
                      type="text"
                      value={formData.standardsText}
                      onChange={(e) => setFormData({ ...formData, standardsText: e.target.value })}
                      placeholder="مثال: ASTM D1586, SBC 303, AASHTO T206"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <ImageUploader
                      value={formData.image}
                      onChange={(url) => setFormData({ ...formData, image: url })}
                      folder="equipment"
                      label="صورة الآلية الهندسية"
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
                    onClick={() => setActiveTab('tech')}
                    className={`px-2.5 py-1 rounded text-[11px] ${activeTab === 'tech' ? 'bg-[#3b76b3]/20 text-[#3b76b3]' : 'text-stone-500'}`}
                  >
                    3. المواصفات
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
                        <span>{isEditing ? 'حفظ التعديلات' : 'إضافة الآلية'}</span>
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
