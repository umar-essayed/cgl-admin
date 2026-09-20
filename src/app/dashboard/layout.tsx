'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderGit2, 
  Truck, 
  Newspaper, 
  Users, 
  MailCheck, 
  Settings, 
  LogOut, 
  ExternalLink,
  Menu,
  X,
  Languages,
  ChevronDown,
  Sliders,
  ShieldCheck,
  Wrench
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/hero', labelAr: 'سلايدر الهيرو الرئيسي', labelEn: 'Hero Slider', icon: Sliders },
  { href: '/dashboard/services', labelAr: 'الخدمات الهندسية', labelEn: 'Services', icon: Wrench },
  { href: '/dashboard/projects', labelAr: 'المشاريع الهندسية', labelEn: 'Projects', icon: FolderGit2 },
  { href: '/dashboard/equipment', labelAr: 'أسطول المعدات', labelEn: 'Equipment', icon: Truck },
  { href: '/dashboard/news', labelAr: 'الأخبار والمقالات', labelEn: 'News & Articles', icon: Newspaper },
  { href: '/dashboard/partners', labelAr: 'الشركاء والعملاء', labelEn: 'Partners', icon: Users },
  { href: '/dashboard/rfqs', labelAr: 'طلبات عروض الأسعار', labelEn: 'RFQ Inquiries', icon: MailCheck },
  { href: '/dashboard/users', labelAr: 'المشرفين والحسابات', labelEn: 'Admin Accounts', icon: ShieldCheck },
  { href: '/dashboard/settings', labelAr: 'الإعدادات والأرقام', labelEn: 'Settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  const isRtl = lang === 'ar';

  // Real-time Session Heartbeat (Every 60s and on tab focus)
  useEffect(() => {
    let isCancelled = false;

    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        if (res.status === 401 || !res.ok) {
          if (!isCancelled) {
            router.push('/login?expired=1');
          }
        }
      } catch {
        // Network hiccup, do nothing
      }
    };

    // Run check on mount
    checkSession();

    // Check periodically every 60 seconds
    const interval = setInterval(checkSession, 60 * 1000);

    // Check when user switches back to this tab
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSession();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      isCancelled = true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  const activeNavItem = NAV_ITEMS.find(i => i.href === pathname);

  return (
    <div className={`min-h-screen bg-[#0d0f12] text-stone-200 flex flex-col md:flex-row ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-3.5 py-2.5 bg-[#13151a] border-b border-[#222630] sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard" className="relative h-8 w-24 block">
            <Image
              src="/assets/cgl-logo1.png"
              alt="CGL"
              fill
              className="object-contain object-right"
              priority
            />
          </Link>
          <span className="px-2 py-0.5 rounded-md bg-[#1a1e26] border border-[#222630] text-[11px] font-bold text-[#3b76b3]">
            {isRtl ? (activeNavItem?.labelAr || 'لوحة التحكم') : (activeNavItem?.labelEn || 'Dashboard')}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setLang(isRtl ? 'en' : 'ar')}
            className="px-2.5 py-1 rounded-lg bg-[#1a1e26] hover:bg-[#222632] border border-[#222630] text-[11px] text-stone-300 font-medium active:scale-95 transition-transform"
          >
            {isRtl ? 'English' : 'عربي'}
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-[#1a1e26] hover:bg-[#222632] border border-[#222630] text-stone-200 active:scale-95 transition-transform"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-rose-400" /> : <Menu className="w-5 h-5 text-[#3b76b3]" />}
          </button>
        </div>
      </header>

      {/* Sidebar Drawer */}
      <aside className={`
        fixed inset-y-0 ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} z-50 w-72 sm:w-64 bg-[#13151a] border-[#222630] flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        md:relative md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : isRtl ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand Top */}
        <div className="p-4 sm:p-5 border-b border-[#222630]">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block relative h-9 w-28">
              <Image
                src="/assets/cgl-logo1.png"
                alt="CGL Logo"
                fill
                priority
                className="object-contain object-right"
              />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-lg bg-[#1a1e26] text-stone-400 hover:text-white border border-[#222630]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 text-[11px] text-stone-400 font-medium flex items-center justify-between">
            <span>{isRtl ? 'لوحة التحكم الإدارية CGL' : 'CGL Admin Portal'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overscroll-contain">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-medium transition-all active:scale-[0.98]
                  ${isActive 
                    ? 'bg-[#3b76b3] text-white font-bold shadow-md shadow-[#3b76b3]/25' 
                    : 'text-stone-300 hover:text-stone-100 hover:bg-[#1a1e26]'}
                `}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{isRtl ? item.labelAr : item.labelEn}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Bar: Logout */}
        <div className="p-4 border-t border-[#222630] bg-[#0f1115]">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-stone-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs transition-colors border border-transparent hover:border-rose-500/20 disabled:opacity-50 active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isRtl ? 'تسجيل الخروج' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen bg-[#0d0f12]">
        {/* Top Header Bar for Desktop */}
        <header className="hidden md:flex items-center justify-between px-6 lg:px-8 py-3.5 border-b border-[#222630] bg-[#111317] sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400 font-medium">CGL</span>
            <span className="text-stone-600">/</span>
            <span className="font-semibold text-white">
              {isRtl 
                ? (activeNavItem?.labelAr || 'لوحة التحكم')
                : (activeNavItem?.labelEn || 'Dashboard')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <button
              onClick={() => setLang(isRtl ? 'en' : 'ar')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181a21] hover:bg-[#20242e] border border-[#222630] text-xs text-stone-300 transition-colors font-medium active:scale-95"
            >
              <Languages className="w-3.5 h-3.5 text-stone-400" />
              <span>{isRtl ? 'English' : 'العربية'}</span>
            </button>

            {/* System status */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#181a21] border border-[#222630] text-[11px] text-stone-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
              <span>{isRtl ? 'النظام متصل' : 'System Online'}</span>
            </div>

            {/* User Profile */}
            <div className={`flex items-center gap-2.5 ${isRtl ? 'border-r pr-4' : 'border-l pl-4'} border-[#222630]`}>
              <div className="w-7 h-7 rounded-full bg-[#3b76b3] text-white flex items-center justify-center text-xs font-bold">
                C
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-white leading-tight">Admin CGL</div>
                <div className="text-[10px] text-stone-400">admin@cgl.sa</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content with safe padding for mobile bottom bar */}
        <div className="flex-1 px-3.5 py-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </div>

        {/* Mobile Floating Bottom Quick Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#121419]/95 backdrop-blur-lg border-t border-[#222630] px-2 py-1.5 flex items-center justify-around shadow-2xl">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
              pathname === '/dashboard' ? 'text-[#3b76b3] font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">الرئيسية</span>
          </Link>

          <Link
            href="/dashboard/hero"
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
              pathname === '/dashboard/hero' ? 'text-[#3b76b3] font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">الهيرو</span>
          </Link>

          <Link
            href="/dashboard/services"
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
              pathname === '/dashboard/services' ? 'text-[#3b76b3] font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">الخدمات</span>
          </Link>

          <Link
            href="/dashboard/projects"
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
              pathname === '/dashboard/projects' ? 'text-[#3b76b3] font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">المشاريع</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center py-1 px-2 rounded-xl text-stone-400 hover:text-stone-200 transition-colors"
          >
            <Menu className="w-4 h-4 text-[#3b76b3]" />
            <span className="text-[10px] mt-0.5">المزيد</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
