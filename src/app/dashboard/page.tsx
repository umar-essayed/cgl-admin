'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FolderGit2, 
  Truck, 
  Newspaper, 
  Users, 
  MailCheck, 
  ArrowUpRight, 
  RefreshCw, 
  Plus, 
  Phone,
  MessageSquare,
  Wrench
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleUpdateRfqStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/rfqs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <LoadingSpinner label="جاري استرجاع بيانات النظام..." />;
  }

  const statCards = [
    {
      title: 'الخدمات الهندسية',
      count: stats?.totalServices ?? 7,
      href: '/dashboard/services',
      icon: Wrench,
      subtitle: 'خدمة واستشارة معتمدة'
    },
    {
      title: 'المشاريع الهندسية',
      count: stats?.totalProjects ?? 0,
      href: '/dashboard/projects',
      icon: FolderGit2,
      subtitle: 'مشروع موثق بالموقع'
    },
    {
      title: 'أسطول المعدات',
      count: stats?.totalEquipment ?? 0,
      href: '/dashboard/equipment',
      icon: Truck,
      subtitle: 'معدة وآلية معتمدة'
    },
    {
      title: 'الأخبار والمقالات',
      count: stats?.totalNews ?? 0,
      href: '/dashboard/news',
      icon: Newspaper,
      subtitle: 'مقال منشور'
    },
    {
      title: 'الشركاء والعملاء',
      count: stats?.totalPartners ?? 0,
      href: '/dashboard/partners',
      icon: Users,
      subtitle: 'جهة وشركة استراتيجية'
    },
    {
      title: 'طلبات عروض الأسعار',
      count: stats?.totalRfqs ?? 0,
      badge: stats?.newRfqsCount ? `${stats.newRfqsCount} جديد` : null,
      href: '/dashboard/rfqs',
      icon: MailCheck,
      subtitle: 'طلب تسعير وارد'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">نظرة عامة على المنظومة</h1>
          <p className="text-xs text-stone-400 mt-1">
            إحصائيات مباشرة عن محتوى الموقع الإلكتروني والاستفسارات الهندسية الواردة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#16181e] hover:bg-[#1f222b] text-stone-300 text-xs border border-[#222630] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#3b76b3]' : ''}`} />
            <span>تحديث</span>
          </button>

          <Link
            href="/dashboard/projects"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3b76b3] hover:bg-[#2a5b8c] text-white text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مشروع</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid - 2 columns on mobile, 5 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={i}
              href={card.href}
              className="bg-[#15181e] hover:bg-[#1a1e26] border border-[#222630] hover:border-[#323846] rounded-2xl p-3.5 sm:p-5 transition-all flex flex-col justify-between group active:scale-[0.98]"
            >
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-[11px] sm:text-xs font-medium text-stone-400 truncate">{card.title}</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#111317] border border-[#222630] flex items-center justify-center text-stone-300 group-hover:text-white flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>

                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {card.count}
                  </span>
                  {card.badge && (
                    <span className="px-1.5 py-0.5 rounded-md bg-[#3b76b3]/15 text-[#508ecb] text-[9px] sm:text-[10px] font-bold border border-[#3b76b3]/30">
                      {card.badge}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-[#222630] flex items-center justify-between text-[10px] sm:text-[11px] text-stone-400">
                <span className="truncate">{card.subtitle}</span>
                <ArrowUpRight className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-stone-500 group-hover:text-stone-300 transition-colors flex-shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent RFQs Section */}
      <div className="bg-[#15181e] border border-[#222630] rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-[#222630]">
          <div>
            <h2 className="text-sm font-bold text-white">أحدث طلبات عروض الأسعار (RFQ)</h2>
            <p className="text-[11px] sm:text-xs text-stone-400 mt-0.5">الطلبات الواردة مباشرة من استمارة تسعير الخدمات</p>
          </div>

          <Link
            href="/dashboard/rfqs"
            className="text-xs text-[#3b76b3] hover:underline flex items-center gap-1 font-medium"
          >
            <span>عرض الكل</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {(!stats?.recentRfqs || stats.recentRfqs.length === 0) ? (
          <div className="text-center py-12 text-stone-500 text-xs">
            لا توجد طلبات عروض أسعار واردة حالياً
          </div>
        ) : (
          <>
            {/* Mobile View: Clean Touch Cards */}
            <div className="block md:hidden space-y-3">
              {stats.recentRfqs.map((rfq: any) => {
                const cleanPhone = (rfq.phone || '').replace(/[^0-9]/g, '');
                return (
                  <div key={rfq.id} className="p-3.5 bg-[#101217] border border-[#222630] rounded-xl space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-xs text-white">{rfq.fullName}</h4>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          {rfq.companyName || 'فردي / خاص'} • {rfq.projectType || 'عام'}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${
                        rfq.status === 'new'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : rfq.status === 'contacted'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-stone-500/10 text-stone-400 border border-stone-500/20'
                      }`}>
                        {rfq.status === 'new' ? 'جديد' : rfq.status === 'contacted' ? 'تم التواصل' : 'مكتمل'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#1e222b] text-[11px]">
                      <span className="text-stone-400 font-mono text-[11px]" dir="ltr">{rfq.phone}</span>
                      <div className="flex items-center gap-1.5">
                        {cleanPhone && (
                          <>
                            <a
                              href={`tel:${cleanPhone}`}
                              className="p-1.5 rounded-lg bg-[#1a1e26] text-stone-300 border border-[#262b37] active:scale-95"
                              title="اتصال"
                            >
                              <Phone className="w-3.5 h-3.5 text-[#3b76b3]" />
                            </a>
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 active:scale-95"
                              title="واتساب"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          </>
                        )}
                        <select
                          value={rfq.status || 'new'}
                          onChange={(e) => handleUpdateRfqStatus(rfq.id, e.target.value)}
                          className="bg-[#15181e] border border-[#222630] rounded-lg px-2 py-1 text-[10px] text-stone-200"
                        >
                          <option value="new">جديد</option>
                          <option value="reviewed">تمت المراجعة</option>
                          <option value="contacted">تم التواصل</option>
                          <option value="closed">مؤرشف</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Full Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[#222630] text-stone-400 text-[11px]">
                    <th className="pb-3 font-medium">مقدم الطلب</th>
                    <th className="pb-3 font-medium">الشركة / الجهة</th>
                    <th className="pb-3 font-medium">نوع المشروع</th>
                    <th className="pb-3 font-medium">رقم الهاتف</th>
                    <th className="pb-3 font-medium">التاريخ</th>
                    <th className="pb-3 font-medium">الحالة</th>
                    <th className="pb-3 font-medium text-left">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222630]/60">
                  {stats.recentRfqs.map((rfq: any) => {
                    const cleanPhone = (rfq.phone || '').replace(/[^0-9]/g, '');
                    return (
                      <tr key={rfq.id} className="hover:bg-[#1a1e26] transition-colors">
                        <td className="py-3 font-semibold text-white">
                          {rfq.fullName}
                        </td>
                        <td className="py-3 text-stone-300">
                          {rfq.companyName || 'فردي / خاص'}
                        </td>
                        <td className="py-3 text-stone-300">
                          {rfq.projectType || 'عام'}
                        </td>
                        <td className="py-3 font-mono text-stone-300" dir="ltr">
                          {rfq.phone}
                        </td>
                        <td className="py-3 text-stone-400 font-mono text-[11px]">
                          {rfq.createdAt ? new Date(rfq.createdAt).toLocaleDateString('ar-SA') : '—'}
                        </td>
                        <td className="py-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium ${
                            rfq.status === 'new'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : rfq.status === 'contacted'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-stone-500/10 text-stone-400 border border-stone-500/20'
                          }`}>
                            {rfq.status === 'new' ? 'جديد' : rfq.status === 'contacted' ? 'تم التواصل' : 'مكتمل'}
                          </span>
                        </td>
                        <td className="py-3 text-left">
                          <div className="flex items-center justify-end gap-1.5">
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${cleanPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                                title="محادثة واتساب"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <select
                              value={rfq.status || 'new'}
                              onChange={(e) => handleUpdateRfqStatus(rfq.id, e.target.value)}
                              className="bg-[#101217] border border-[#222630] rounded-lg px-2 py-1 text-[11px] text-stone-300 focus:outline-none focus:border-[#3b76b3]"
                            >
                              <option value="new">جديد</option>
                              <option value="reviewed">تمت المراجعة</option>
                              <option value="contacted">تم التواصل</option>
                              <option value="closed">مؤرشف</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
