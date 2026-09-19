'use client';
import LoadingSpinner from '@/components/LoadingSpinner';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { 
  FolderGit2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  X, 
  Save, 
  AlertTriangle,
  Eye,
  MapPin,
  Tag,
  Building,
  Check
} from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';

export default function ProjectsManagementPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    setVisibleCount(10);
  }, [searchQuery, sectorFilter]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ar' | 'en' | 'tech'>('ar');
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<any>({
    id: '',
    nameAr: '',
    nameEn: '',
    sectorAr: 'الأساسات العميقة والمنشآت الكبرى',
    sectorEn: 'Deep Foundations & Heavy Infrastructure',
    locationAr: 'المملكة العربية السعودية',
    locationEn: 'Kingdom of Saudi Arabia',
    client: '',
    clientAr: '',
    clientEn: '',
    scopeOfWorkAr: '',
    scopeOfWorkEn: '',
    technicalChallengesAr: '',
    technicalChallengesEn: '',
    engineeringApproachAr: '',
    engineeringApproachEn: '',
    coverImage: '/api/media/projects/pile_load_testing_reaction.jpg',
    relevantStandardsText: 'SBC 303, ASTM D1143',
    relatedServiceId: 'geotechnical-investigation'
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const generateUniqueProjectId = () => {
    return `cgl-proj-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  };

  const openNewModal = () => {
    setFormData({
      id: generateUniqueProjectId(),
      nameAr: '',
      nameEn: '',
      sectorAr: 'الأساسات العميقة والمنشآت الكبرى',
      sectorEn: 'Deep Foundations & Heavy Infrastructure',
      locationAr: 'المملكة العربية السعودية',
      locationEn: 'Kingdom of Saudi Arabia',
      client: '',
      clientAr: '',
      clientEn: '',
      scopeOfWorkAr: '',
      scopeOfWorkEn: '',
      technicalChallengesAr: '',
      technicalChallengesEn: '',
      engineeringApproachAr: '',
      engineeringApproachEn: '',
      coverImage: '/api/media/projects/pile_load_testing_reaction.jpg',
      relevantStandardsText: 'SBC 303, ASTM D1143',
      relatedServiceId: 'geotechnical-investigation'
    });
    setIsEditing(false);
    setActiveTab('ar');
    setIsModalOpen(true);
  };

  const openEditModal = (project: any) => {
    setFormData({
      ...project,
      clientAr: project.clientAr || project.client || '',
      clientEn: project.clientEn || '',
      scopeOfWorkEn: project.scopeOfWorkEn || '',
      technicalChallengesEn: project.technicalChallengesEn || '',
      engineeringApproachEn: project.engineeringApproachEn || '',
      relevantStandardsText: Array.isArray(project.relevantStandards)
        ? project.relevantStandards.join(', ')
        : (project.relevantStandards || 'SBC 303, ASTM D1143')
    });
    setIsEditing(true);
    setActiveTab('ar');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const standardsArray = (formData.relevantStandardsText || '')
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        client: formData.clientAr || formData.client || '',
        relevantStandards: standardsArray.length > 0 ? standardsArray : ['SBC 303']
      };

      if (isEditing) {
        await fetch(`/api/projects/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      setDeleteConfirmId(null);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = 
      (p.nameAr || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nameEn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.locationAr || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = sectorFilter === 'all' || p.sectorAr === sectorFilter;
    return matchesSearch && matchesSector;
  });

  const sectors = Array.from(new Set(projects.map(p => p.sectorAr).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FolderGit2 className="w-5 h-5 text-[#3b76b3]" />
            <span>المشاريع الهندسية المعتمدة</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            إدارة كافة المشاريع المعروضة بالموقع مع الترجمة المزدوجة بالعربية والإنجليزية والمواصفات الفنية.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3b76b3] hover:bg-[#2a5b8c] text-white text-xs font-bold transition-all active:scale-[0.99] shadow-lg shadow-[#3b76b3]/10"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مشروع جديد</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#15181e] p-3 rounded-2xl border border-[#222630]">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="البحث باسم المشروع أو الموقع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#101217] border border-[#222630] rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#3b76b3]"
          />
        </div>

        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-[#3b76b3] w-full sm:w-auto"
        >
          <option value="all">كافة القطاعات</option>
          {sectors.map((sec: any) => (
            <option key={sec} value={sec}>{sec}</option>
          ))}
        </select>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <LoadingSpinner label="جاري استرجاع المشاريع الهندسية..." />
      ) : filteredProjects.length === 0 ? (
        <div className="py-20 text-center text-stone-400 text-xs bg-[#15181e] rounded-2xl border border-[#222630]">
          لم يتم العثور على أي مشاريع مطابقة للبحث
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.slice(0, visibleCount).map((project) => (
              <div
                key={project.id}
                className="bg-[#15181e] border border-[#222630] rounded-2xl overflow-hidden flex flex-col justify-between hover:border-stone-600 transition-colors"
              >
                <div>
                  <div className="relative h-44 w-full bg-[#101217] overflow-hidden border-b border-[#222630]">
                    <img
                      src={project.coverImage || '/assets/sliders/slider1.jpg'}
                      alt={project.nameAr}
                      className="w-full h-full object-cover opacity-85"
                      onError={(e: any) => {
                        e.target.src = '/assets/sliders/slider1.jpg';
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-lg bg-[#101217]/90 border border-[#2e3442] text-[10px] font-mono text-stone-300 font-semibold">
                        {project.id}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="text-[10px] text-stone-200 font-medium bg-black/75 px-2.5 py-1 rounded-lg border border-white/10">
                        {project.sectorAr}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-400">
                      <MapPin className="w-3.5 h-3.5 text-[#3b76b3]" />
                      <span>{project.locationAr || project.locationEn}</span>
                    </div>

                    <h3 className="font-bold text-sm text-stone-100 line-clamp-1">
                      {project.nameAr}
                    </h3>

                    <p className="text-[11px] text-stone-400 font-sans line-clamp-1" dir="ltr">
                      {project.nameEn}
                    </p>

                    <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                      {project.scopeOfWorkAr || project.scopeOfWorkEn}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-3 border-t border-[#222630] flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-stone-500">
                    {project.relatedServiceId || 'General'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(project)}
                      className="p-1.5 rounded-lg bg-[#1a1e26] hover:bg-[#252b37] text-stone-300 hover:text-white transition-colors border border-[#262b37]"
                      title="تعديل المشروع"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(project.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors border border-rose-500/20"
                      title="حذف المشروع"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {filteredProjects.length > 10 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#15181e] rounded-2xl border border-[#222630]">
              <div className="text-xs text-stone-300">
                عرض <span className="text-white font-bold">{Math.min(visibleCount, filteredProjects.length)}</span> من أصل <span className="text-white font-bold">{filteredProjects.length}</span> مشروع
              </div>
              <div className="flex items-center gap-2">
                {visibleCount < filteredProjects.length ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => Math.min(prev + 10, filteredProjects.length))}
                      className="px-4 py-2 rounded-xl bg-[#3b76b3] hover:bg-[#2a5b8c] text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
                    >
                      تحميل باقي المشاريع (متبقي {filteredProjects.length - visibleCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibleCount(filteredProjects.length)}
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
            <h3 className="font-bold text-sm text-stone-100 mb-1">تأكيد حذف المشروع</h3>
            <p className="text-xs text-stone-400 mb-5">
              هل أنت متأكد من رغبتك في حذف هذا المشروع نهائياً من قاعدة البيانات؟
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

      {/* Add / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-[#15181e] border border-[#222630] rounded-t-3xl sm:rounded-2xl max-w-3xl w-full my-0 sm:my-8 max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#222630] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#3b76b3]" />
                  <span>{isEditing ? 'تعديل بيانات المشروع' : 'إضافة مشروع هندسي جديد'}</span>
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
                <span>📐 الصورة والمواصفات</span>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              
              {/* TAB 1: Arabic Content */}
              {activeTab === 'ar' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      اسم المشروع بالعربية *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nameAr}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                      placeholder="مثال: أعمال فحص التحميل الاستاتيكي للخوازيق الهندسية"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1.5">
                        القطاع بالعربية *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.sectorAr}
                        onChange={(e) => setFormData({ ...formData, sectorAr: e.target.value })}
                        placeholder="مثال: الأساسات العميقة والمنشآت الكبرى"
                        className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1.5">
                        الموقع الجغرافي بالعربية *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.locationAr}
                        onChange={(e) => setFormData({ ...formData, locationAr: e.target.value })}
                        placeholder="مثال: جدة، المملكة العربية السعودية"
                        className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      العميل أو الشريك المشرف (عربي)
                    </label>
                    <input
                      type="text"
                      value={formData.clientAr || formData.client || ''}
                      onChange={(e) => setFormData({ ...formData, clientAr: e.target.value, client: e.target.value })}
                      placeholder="مثال: شركة ليفلز للمقاولات - مشروع برج سيسيان القابضة"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      نطاق العمل الهندسي (عربي) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={formData.scopeOfWorkAr}
                      onChange={(e) => setFormData({ ...formData, scopeOfWorkAr: e.target.value })}
                      placeholder="تنفيذ وتوثيق فحص التحميل المحوري الاستاتيكي على الخوازيق الخرسانية..."
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      التحديات الفنية (عربي)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.technicalChallengesAr}
                      onChange={(e) => setFormData({ ...formData, technicalChallengesAr: e.target.value })}
                      placeholder="تطبيق أحمال ضخمة بأمان تام ورصد الهبوط المتناهي في الصغر..."
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      المنهجية الهندسية والحلول (عربي)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.engineeringApproachAr}
                      onChange={(e) => setFormData({ ...formData, engineeringApproachAr: e.target.value })}
                      placeholder="استخدام منظومة روافع معايرة مرتبطة بخلايا قياس ضغط معتمدة..."
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
                      Project Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      placeholder="e.g. Static Axial Compressive Pile Load Testing Project"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1.5">
                        Sector (English) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.sectorEn}
                        onChange={(e) => setFormData({ ...formData, sectorEn: e.target.value })}
                        placeholder="e.g. Deep Foundations & Heavy Infrastructure"
                        className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1.5">
                        Location (English) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.locationEn}
                        onChange={(e) => setFormData({ ...formData, locationEn: e.target.value })}
                        placeholder="e.g. Jeddah, Kingdom of Saudi Arabia"
                        className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      Client / Project Owner (English)
                    </label>
                    <input
                      type="text"
                      value={formData.clientEn || ''}
                      onChange={(e) => setFormData({ ...formData, clientEn: e.target.value })}
                      placeholder="e.g. Levels Contracting - Sisban Holding Tower"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      Scope of Work (English) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={formData.scopeOfWorkEn}
                      onChange={(e) => setFormData({ ...formData, scopeOfWorkEn: e.target.value })}
                      placeholder="Executing and monitoring full-scale static compressive pile load test..."
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      Technical Challenges (English)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.technicalChallengesEn}
                      onChange={(e) => setFormData({ ...formData, technicalChallengesEn: e.target.value })}
                      placeholder="Applying massive compressive tonnage safely while logging sub-millimeter settlement..."
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      Engineering Approach (English)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.engineeringApproachEn}
                      onChange={(e) => setFormData({ ...formData, engineeringApproachEn: e.target.value })}
                      placeholder="Calibrated hydraulic jacking assemblies coupled with certified pressure cells..."
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
                          معرف المشروع التلقائي (Unique ID)
                        </label>
                        {!isEditing && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, id: generateUniqueProjectId() })}
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
                        الخدمة الهندسية المرتبطة
                      </label>
                      <select
                        value={formData.relatedServiceId}
                        onChange={(e) => setFormData({ ...formData, relatedServiceId: e.target.value })}
                        className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-[#3b76b3]"
                      >
                        <option value="geotechnical-investigation">فحص واستكشاف التربة (Geotechnical)</option>
                        <option value="engineering-surveying">المسح الهندسي والجيوديسي (Surveying)</option>
                        <option value="mining-testing">التعدين والمحاجر (Mining Testing)</option>
                        <option value="shoring-dewatering">سند الحفر ونزح المياه (Shoring & Dewatering)</option>
                        <option value="building-integrity">تقييم سلامة المباني (Building Integrity)</option>
                        <option value="materials-testing">فحص المواد الإنشائية (Materials Testing)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      المعايير الهندسية المطبقة (مفصولة بفواصل)
                    </label>
                    <input
                      type="text"
                      value={formData.relevantStandardsText}
                      onChange={(e) => setFormData({ ...formData, relevantStandardsText: e.target.value })}
                      placeholder="مثال: ASTM D1143, SBC 303, ACI 228"
                      className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#3b76b3]"
                    />
                  </div>

                  <div>
                    <ImageUploader
                      value={formData.coverImage}
                      onChange={(url) => setFormData({ ...formData, coverImage: url })}
                      folder="projects"
                      label="صورة غلاف المشروع الرئيسية"
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
                        <span>{isEditing ? 'حفظ التعديلات' : 'نشر المشروع'}</span>
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
