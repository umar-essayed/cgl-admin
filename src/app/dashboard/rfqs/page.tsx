'use client';
import LoadingSpinner from '@/components/LoadingSpinner';

import React, { useEffect, useState } from 'react';
import { 
  MailCheck, 
  Search, 
  Trash2, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  MapPin, 
  Building, 
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  ExternalLink,
  X,
  ChevronDown
} from 'lucide-react';

export default function RfqsInboxPage() {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRfq, setSelectedRfq] = useState<any | null>(null);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchRfqs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/rfqs');
      const data = await res.json();
      if (data.success) {
        setRfqs(data.data);
        if (typeof window !== 'undefined' && window.innerWidth >= 1024 && data.data.length > 0 && !selectedRfq) {
          setSelectedRfq(data.data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfqs();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/rfqs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchRfqs();
      if (selectedRfq && selectedRfq.id === id) {
        setSelectedRfq({ ...selectedRfq, status: newStatus });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/rfqs/${id}`, { method: 'DELETE' });
      setDeleteConfirmId(null);
      if (selectedRfq && selectedRfq.id === id) {
        setSelectedRfq(null);
        setIsMobileModalOpen(false);
      }
      fetchRfqs();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRfqs = rfqs.filter((r) => {
    const matchesSearch = 
      (r.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2.5">
          <MailCheck className="w-5 h-5 text-[#3b76b3]" />
          <span>طلبات عروض الأسعار والاستفسارات الهندسية (RFQ)</span>
        </h2>
        <p className="text-xs text-stone-400 mt-1">
          إدارة واستعراض ومتابعة كافة الطلبات الواردة مباشرة من نموذج طلب التسعير بموقع CGL.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#15181e] p-3 rounded-2xl border border-[#222630]">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="البحث باسم العميل، الشركة، رقم الهاتف، أو البريد..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#101217] border border-[#222630] rounded-xl pr-9 pl-4 py-2 text-xs text-stone-200 placeholder-stone-400 focus:outline-none focus:border-[#3b76b3]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'كافة الطلبات' },
            { id: 'new', label: 'طلبات جديدة' },
            { id: 'reviewed', label: 'تمت المراجعة' },
            { id: 'contacted', label: 'تم التواصل' },
            { id: 'closed', label: 'مؤرشفة' },
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-colors ${
                statusFilter === st.id
                  ? 'bg-stone-200 text-black font-bold'
                  : 'bg-[#101217] text-stone-400 hover:text-stone-200 border border-[#222630]'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <LoadingSpinner label="جاري استرجاع طلبات عروض الأسعار..." />
      ) : filteredRfqs.length === 0 ? (
        <div className="py-20 text-center text-stone-400 text-xs bg-[#15181e] rounded-2xl border border-[#222630]">
          لا توجد طلبات تطابق معايير الفلترة الحالية
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List column */}
          <div className="lg:col-span-2 space-y-3">
            {filteredRfqs.map((rfq) => {
              const cleanPhone = (rfq.phone || '').replace(/[^0-9]/g, '');
              const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : null;
              const isSelected = selectedRfq?.id === rfq.id;

              return (
                <div
                  key={rfq.id}
                  onClick={() => {
                    setSelectedRfq(rfq);
                    setIsMobileModalOpen(true);
                  }}
                  className={`bg-[#15181e] border rounded-2xl p-4 transition-colors cursor-pointer ${
                    isSelected ? 'border-[#3b76b3] bg-[#1a1e26]' : 'border-[#222630] hover:border-stone-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-stone-100">{rfq.fullName}</h4>
                        {rfq.refNumber && (
                          <span className="px-2 py-0.5 rounded-md bg-[#3b76b3]/15 text-[#3b76b3] border border-[#3b76b3]/25 text-[10px] font-mono font-bold" dir="ltr">
                            {rfq.refNumber}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                          rfq.status === 'new' 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : rfq.status === 'contacted'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : rfq.status === 'reviewed'
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                            : 'bg-stone-500/10 text-stone-400 border border-stone-500/20'
                        }`}>
                          {rfq.status === 'new' ? 'جديد' : rfq.status === 'contacted' ? 'تم التواصل' : rfq.status === 'reviewed' ? 'تمت المراجعة' : 'مؤرشف'}
                        </span>
                      </div>

                      <div className="text-xs text-stone-400 flex items-center gap-2 mt-1">
                        <Building className="w-3.5 h-3.5 text-stone-500" />
                        <span>{rfq.companyName || 'طلب فردي / خاص'}</span>
                        <span className="text-stone-600">•</span>
                        <span className="text-stone-300">{rfq.projectType || 'مشروع عام'}</span>
                      </div>
                    </div>

                    <span className="text-[10px] text-stone-500 font-mono">
                      {rfq.createdAt ? new Date(rfq.createdAt).toLocaleDateString('ar-SA') : ''}
                    </span>
                  </div>

                  {rfq.notes && (
                    <p className="text-xs text-stone-300 line-clamp-2 bg-[#101217] p-2.5 rounded-xl border border-[#222630] my-2">
                      {rfq.notes}
                    </p>
                  )}

                  <div className="pt-2 mt-2 border-t border-[#222630] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 font-mono text-[11px] text-stone-400" dir="ltr">
                      <span>{rfq.phone}</span>
                      {rfq.email && <span>• {rfq.email}</span>}
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {waLink && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] border border-emerald-500/20 flex items-center gap-1 font-medium"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>واتساب</span>
                        </a>
                      )}

                      <div className="relative inline-flex items-center" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={rfq.status || 'new'}
                          onChange={(e) => handleUpdateStatus(rfq.id, e.target.value)}
                          className="appearance-none bg-[#101217] border border-[#222630] hover:border-[#3b76b3] rounded-lg pr-2.5 pl-6 py-1 text-[10px] text-stone-200 focus:outline-none focus:border-[#3b76b3] cursor-pointer transition-colors"
                        >
                          <option value="new">جديد ⏳</option>
                          <option value="reviewed">تمت المراجعة 📋</option>
                          <option value="contacted">تم التواصل 📞</option>
                          <option value="closed">مؤرشف 📁</option>
                        </select>
                        <ChevronDown className="w-3 h-3 text-stone-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      <button
                        onClick={() => setDeleteConfirmId(rfq.id)}
                        className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors border border-rose-500/20"
                        title="حذف الطلب"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Details Column */}
          <div className="hidden lg:block bg-[#15181e] border border-[#222630] rounded-2xl p-5 sticky top-20 h-fit">
            {selectedRfq ? (
              <div className="space-y-4">
                <div className="pb-3 border-b border-[#222630] flex items-center justify-between">
                  <h3 className="font-bold text-sm text-stone-100">تفاصيل الطلب الفني</h3>
                  {selectedRfq.refNumber ? (
                    <span className="text-[11px] text-[#3b76b3] font-mono font-bold px-2 py-0.5 rounded bg-[#3b76b3]/10 border border-[#3b76b3]/20" dir="ltr">
                      {selectedRfq.refNumber}
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-500 font-mono">ID: {selectedRfq.id?.slice(0, 8)}</span>
                  )}
                </div>

                <div>
                  <label className="text-[10px] text-stone-400 block">اسم مقدم الطلب</label>
                  <div className="text-sm font-bold text-stone-100 mt-0.5">{selectedRfq.fullName}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-stone-400 block">الجهة / المؤسسة</label>
                    <div className="text-xs font-semibold text-stone-200 mt-0.5">{selectedRfq.companyName || '—'}</div>
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 block">تصنيف المشروع</label>
                    <div className="text-xs font-semibold text-stone-200 mt-0.5">{selectedRfq.projectType || 'عام'}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#222630]">
                  <div>
                    <label className="text-[10px] text-stone-400 block">رقم الاتصال المباشر</label>
                    <div className="text-xs font-mono text-stone-200 mt-0.5 flex items-center justify-between" dir="ltr">
                      <span>{selectedRfq.phone}</span>
                      {selectedRfq.phone && (
                        <a
                          href={`tel:${selectedRfq.phone}`}
                          className="text-[10px] text-sky-400 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>اتصال</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {selectedRfq.email && (
                    <div>
                      <label className="text-[10px] text-stone-400 block">البريد الإلكتروني</label>
                      <div className="text-xs font-mono text-stone-200 mt-0.5" dir="ltr">
                        {selectedRfq.email}
                      </div>
                    </div>
                  )}

                  {selectedRfq.location && (
                    <div>
                      <label className="text-[10px] text-stone-400 block">موقع المشروع المقترح</label>
                      <div className="text-xs text-stone-200 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-500" />
                        <span>{selectedRfq.location}</span>
                      </div>
                    </div>
                  )}
                </div>

                {selectedRfq.notes && (
                  <div className="pt-2 border-t border-[#222630]">
                    <label className="text-[10px] text-stone-400 block mb-1">تفاصيل وملاحظات الطلب</label>
                    <div className="text-xs text-stone-200 bg-[#101217] p-3 rounded-xl border border-[#222630] leading-relaxed whitespace-pre-wrap">
                      {selectedRfq.notes}
                    </div>
                  </div>
                )}

                {/* Direct Action Buttons */}
                <div className="pt-3 border-t border-[#222630] space-y-2">
                  {selectedRfq.phone && (
                    <a
                      href={`https://wa.me/${selectedRfq.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>فتح محادثة واتساب فورية</span>
                    </a>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedRfq.id, 'reviewed')}
                      className="flex-1 py-2 rounded-xl bg-[#1a1e26] hover:bg-[#222733] text-stone-300 text-xs font-medium border border-[#262b37] transition-colors"
                    >
                      تحديد كمراجع
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedRfq.id, 'contacted')}
                      className="flex-1 py-2 rounded-xl bg-[#1a1e26] hover:bg-[#222733] text-stone-300 text-xs font-medium border border-[#262b37] transition-colors"
                    >
                      تحديد كمتواصل
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-stone-500 text-xs">
                اختر طلباً من القائمة لعرض تفاصيله
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Details Modal / Bottom Sheet */}
      {isMobileModalOpen && selectedRfq && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 lg:hidden animate-in fade-in duration-200">
          <div className="bg-[#15181e] border border-[#222630] rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#222630]">
              <div>
                <h3 className="font-bold text-sm text-stone-100">تفاصيل الطلب الفني</h3>
                {selectedRfq.refNumber ? (
                  <span className="text-[11px] text-[#3b76b3] font-mono font-bold block mt-0.5" dir="ltr">
                    {selectedRfq.refNumber}
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-500 font-mono">ID: {selectedRfq.id?.slice(0, 8)}</span>
                )}
              </div>
              <button
                onClick={() => setIsMobileModalOpen(false)}
                className="p-1.5 rounded-lg bg-[#101217] text-stone-400 hover:text-white border border-[#222630]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[10px] text-stone-400 block">اسم مقدم الطلب</label>
              <div className="text-sm font-bold text-stone-100 mt-0.5">{selectedRfq.fullName}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-stone-400 block">الجهة / المؤسسة</label>
                <div className="text-xs font-semibold text-stone-200 mt-0.5">{selectedRfq.companyName || '—'}</div>
              </div>
              <div>
                <label className="text-[10px] text-stone-400 block">تصنيف المشروع</label>
                <div className="text-xs font-semibold text-stone-200 mt-0.5">{selectedRfq.projectType || 'عام'}</div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#222630]">
              <div>
                <label className="text-[10px] text-stone-400 block">رقم الاتصال المباشر</label>
                <div className="text-xs font-mono text-stone-200 mt-0.5 flex items-center justify-between" dir="ltr">
                  <span>{selectedRfq.phone}</span>
                  {selectedRfq.phone && (
                    <a
                      href={`tel:${selectedRfq.phone}`}
                      className="px-2 py-1 rounded bg-[#1a1e26] text-xs text-sky-400 border border-[#222630] flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>اتصال هاتفي</span>
                    </a>
                  )}
                </div>
              </div>

              {selectedRfq.email && (
                <div>
                  <label className="text-[10px] text-stone-400 block">البريد الإلكتروني</label>
                  <div className="text-xs font-mono text-stone-200 mt-0.5" dir="ltr">
                    {selectedRfq.email}
                  </div>
                </div>
              )}

              {selectedRfq.location && (
                <div>
                  <label className="text-[10px] text-stone-400 block">موقع المشروع المقترح</label>
                  <div className="text-xs text-stone-200 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-500" />
                    <span>{selectedRfq.location}</span>
                  </div>
                </div>
              )}
            </div>

            {selectedRfq.notes && (
              <div className="pt-2 border-t border-[#222630]">
                <label className="text-[10px] text-stone-400 block mb-1">تفاصيل وملاحظات الطلب</label>
                <div className="text-xs text-stone-200 bg-[#101217] p-3 rounded-xl border border-[#222630] leading-relaxed whitespace-pre-wrap">
                  {selectedRfq.notes}
                </div>
              </div>
            )}

            {/* Direct Action Buttons */}
            <div className="pt-3 border-t border-[#222630] space-y-2">
              {selectedRfq.phone && (
                <a
                  href={`https://wa.me/${selectedRfq.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>فتح محادثة واتساب فورية</span>
                </a>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedRfq.id, 'reviewed')}
                  className="flex-1 py-2 rounded-xl bg-[#1a1e26] hover:bg-[#222733] text-stone-300 text-xs font-medium border border-[#262b37] transition-colors"
                >
                  تحديد كمراجع
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedRfq.id, 'contacted')}
                  className="flex-1 py-2 rounded-xl bg-[#1a1e26] hover:bg-[#222733] text-stone-300 text-xs font-medium border border-[#262b37] transition-colors"
                >
                  تحديد كمتواصل
                </button>
              </div>

              <button
                onClick={() => setSelectedRfq(null)}
                className="w-full py-2 rounded-xl bg-[#101217] text-stone-400 text-xs font-medium border border-[#222630]"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#15181e] border border-[#222630] rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-stone-100 mb-1">تأكيد حذف طلب التسعير</h3>
            <p className="text-xs text-stone-400 mb-5">
              هل أنت متأكد من حذف هذا الاستفسار وسجله نهائياً؟
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
                className="px-4 py-2 rounded-xl bg-[#1a1e26] hover:bg-[#222733] text-stone-300 text-xs font-medium border border-[#262b37]"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
