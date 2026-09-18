'use client';

import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  Save, 
  CheckCircle2, 
  Phone, 
  Mail, 
  MapPin, 
  Hash, 
  ShieldCheck, 
  Building2,
  Globe2
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-stone-400 font-mono">
        جاري تحميل الإعدادات والبيانات من Firestore...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-[#8bc34a]" />
            <span>إعدادات الهوية المؤسسية والأرقام الحية بالموقع</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            التحكم المباشر في أرقام العدادات في قسم الهيرو، أرقام التواصل والواتساب، والعناوين الرسمية.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>تم حفظ التعديلات وتحديثها في Firestore بنجاح!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Statistics Counters in Hero */}
        <div className="bg-[#15181e] border border-[#222630] rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#222630] text-stone-100 font-bold text-sm">
            <Hash className="w-4 h-4 text-[#8bc34a]" />
            <span>العدادات الرقمية في واجهة الموقع الرئيسية (Hero Section Counters)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-stone-300 mb-1 font-mono">عدد الشركاء الاستراتيجيين</label>
              <input
                type="number"
                value={settings?.stats?.globalPartners || 650}
                onChange={(e) => setSettings({
                  ...settings,
                  stats: { ...settings?.stats, globalPartners: parseInt(e.target.value) || 0 }
                })}
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#8bc34a]"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">يظهر بالموقع: +{settings?.stats?.globalPartners || 650} شريك استراتيجي</span>
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1 font-mono">الحلول الهندسية المنجزة</label>
              <input
                type="number"
                value={settings?.stats?.innovativeSolutions || 300}
                onChange={(e) => setSettings({
                  ...settings,
                  stats: { ...settings?.stats, innovativeSolutions: parseInt(e.target.value) || 0 }
                })}
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#8bc34a]"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">يظهر بالموقع: +{settings?.stats?.innovativeSolutions || 300} حل هندسي</span>
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1 font-mono">سنوات الخبرة المتراكمة</label>
              <input
                type="number"
                value={settings?.stats?.yearsOfGrowth || 20}
                onChange={(e) => setSettings({
                  ...settings,
                  stats: { ...settings?.stats, yearsOfGrowth: parseInt(e.target.value) || 0 }
                })}
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#8bc34a]"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">يظهر بالموقع: +{settings?.stats?.yearsOfGrowth || 20} عاماً من التطور</span>
            </div>
          </div>
        </div>

        {/* Contact Numbers & Channels */}
        <div className="bg-[#15181e] border border-[#222630] rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#222630] text-stone-100 font-bold text-sm">
            <Phone className="w-4 h-4 text-sky-400" />
            <span>بيانات الاتصال، أرقام الهواتف، والواتساب</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-stone-300 mb-1">رقم الهاتف الرئيسي</label>
              <input
                type="text"
                value={settings?.phone1 || ''}
                onChange={(e) => setSettings({ ...settings, phone1: e.target.value })}
                dir="ltr"
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono text-left focus:outline-none focus:border-[#8bc34a]"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1">رقم الهاتف الثانوي</label>
              <input
                type="text"
                value={settings?.phone2 || ''}
                onChange={(e) => setSettings({ ...settings, phone2: e.target.value })}
                dir="ltr"
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono text-left focus:outline-none focus:border-[#8bc34a]"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1">رقم الواتساب الأول (لطلبات التسعير)</label>
              <input
                type="text"
                value={settings?.whatsapp1 || ''}
                onChange={(e) => setSettings({ ...settings, whatsapp1: e.target.value })}
                dir="ltr"
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono text-left focus:outline-none focus:border-[#8bc34a]"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1">رقم الواتساب الثاني (للدعم الفني)</label>
              <input
                type="text"
                value={settings?.whatsapp2 || ''}
                onChange={(e) => setSettings({ ...settings, whatsapp2: e.target.value })}
                dir="ltr"
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono text-left focus:outline-none focus:border-[#8bc34a]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs text-stone-300 mb-1">البريد الإلكتروني المعتمد للمراسلات</label>
              <input
                type="email"
                value={settings?.email || ''}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                dir="ltr"
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono text-left focus:outline-none focus:border-[#8bc34a]"
              />
            </div>
          </div>
        </div>

        {/* Addresses & Branch Locations */}
        <div className="bg-[#15181e] border border-[#222630] rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#222630] text-stone-100 font-bold text-sm">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>المقر الرئيسي والفروع الجغرافية بالمملكة</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-stone-300 mb-1">عنوان المقر الرئيسي (عربي)</label>
              <input
                type="text"
                value={settings?.addressAr || ''}
                onChange={(e) => setSettings({ ...settings, addressAr: e.target.value })}
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-[#8bc34a]"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1">عنوان المقر الرئيسي (English)</label>
              <input
                type="text"
                value={settings?.addressEn || ''}
                onChange={(e) => setSettings({ ...settings, addressEn: e.target.value })}
                dir="ltr"
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-sans focus:outline-none focus:border-[#8bc34a]"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1">ساعات العمل المعتمدة (عربي)</label>
              <input
                type="text"
                value={settings?.workingHoursAr || ''}
                onChange={(e) => setSettings({ ...settings, workingHoursAr: e.target.value })}
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-[#8bc34a]"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1">ساعات العمل المعتمدة (English)</label>
              <input
                type="text"
                value={settings?.workingHoursEn || ''}
                onChange={(e) => setSettings({ ...settings, workingHoursEn: e.target.value })}
                dir="ltr"
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-sans focus:outline-none focus:border-[#8bc34a]"
              />
            </div>
          </div>
        </div>

        {/* Corporate Licenses */}
        <div className="bg-[#15181e] border border-[#222630] rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#222630] text-stone-100 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>بيانات الاعتماد والتراخيص الهندسية</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-stone-300 mb-1 font-mono">رقم السجل التجاري (CR)</label>
              <input
                type="text"
                value={settings?.commercialRegister || ''}
                onChange={(e) => setSettings({ ...settings, commercialRegister: e.target.value })}
                dir="ltr"
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#8bc34a]"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1 font-mono">الرقم الضريبي (VAT)</label>
              <input
                type="text"
                value={settings?.vatNumber || ''}
                onChange={(e) => setSettings({ ...settings, vatNumber: e.target.value })}
                dir="ltr"
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#8bc34a]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#8bc34a] hover:bg-[#7cb342] text-black text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات في Firestore</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
