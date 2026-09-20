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
  Globe2,
  Clock,
  Sun
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

const DAYS_PRESETS = [
  { id: 'sun-thu', labelAr: 'الأحد - الخميس', labelEn: 'Sun - Thu' },
  { id: 'sat-thu', labelAr: 'السبت - الخميس', labelEn: 'Sat - Thu' },
  { id: 'all-week', labelAr: 'طوال أيام الأسبوع', labelEn: 'Daily (7 Days)' },
];

function formatTimeTo12h(time24: string, lang: 'ar' | 'en') {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return time24;
  const ampmAr = h >= 12 ? 'م' : 'ص';
  const ampmEn = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return lang === 'ar' ? `${h}:${m} ${ampmAr}` : `${h}:${m} ${ampmEn}`;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Unified Time Picker State
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [selectedDays, setSelectedDays] = useState('sun-thu');
  const [manualOverride, setManualOverride] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        const item = data.data;
        setSettings(item);
        if (item.workStart) setStartTime(item.workStart);
        if (item.workEnd) setEndTime(item.workEnd);
        if (item.workDays) setSelectedDays(item.workDays);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (newStart: string, newEnd: string, newDays: string) => {
    setStartTime(newStart);
    setEndTime(newEnd);
    setSelectedDays(newDays);

    const preset = DAYS_PRESETS.find(p => p.id === newDays) || DAYS_PRESETS[0];
    const generatedAr = `${preset.labelAr}: ${formatTimeTo12h(newStart, 'ar')} - ${formatTimeTo12h(newEnd, 'ar')}`;
    const generatedEn = `${preset.labelEn}: ${formatTimeTo12h(newStart, 'en')} - ${formatTimeTo12h(newEnd, 'en')}`;

    setSettings((prev: any) => ({
      ...prev,
      workStart: newStart,
      workEnd: newEnd,
      workDays: newDays,
      workingHoursAr: generatedAr,
      workingHoursEn: generatedEn,
    }));
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
    return <LoadingSpinner label="جاري تحميل الإعدادات والبيانات..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-[#3b76b3]" />
            <span>إعدادات الهوية المؤسسية والأرقام الحية بالموقع</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            التحكم المباشر في أرقام العدادات في قسم الهيرو، أرقام التواصل والواتساب، ساعات العمل، والعناوين الرسمية.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium animate-pop-scale">
            <CheckCircle2 className="w-4 h-4" />
            <span>تم حفظ التعديلات بنجاح!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Theme Color Selector */}
        <div className="bg-[#15181e] border border-[#222630] rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#222630] text-stone-100 font-bold text-sm">
            <div className="w-3.5 h-3.5 rounded-full bg-[#3b76b3]" />
            <span>اللون الرئيسي للموقع (Theme Color)</span>
            <span className="text-[11px] text-stone-400 font-normal mr-auto">الافتراضي: الأزرق</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSettings({ ...settings, themeColor: 'blue' })}
              className={`p-4 rounded-xl border text-right transition-all flex items-center justify-between ${
                (settings?.themeColor || 'blue') === 'blue'
                  ? 'bg-[#3b76b3]/15 border-[#3b76b3] text-white shadow-lg shadow-[#3b76b3]/10 ring-1 ring-[#3b76b3]'
                  : 'bg-[#101217] border-[#222630] text-stone-400 hover:text-stone-200 hover:border-stone-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#3b76b3] flex items-center justify-center text-white shadow-md font-bold text-xs">
                  CGL
                </div>
                <div>
                  <div className="text-xs font-bold text-white">اللون الأزرق الهندسي (الافتراضي)</div>
                  <div className="text-[11px] text-stone-400 font-mono mt-0.5">Primary: #3b76b3</div>
                </div>
              </div>
              {(settings?.themeColor || 'blue') === 'blue' && (
                <CheckCircle2 className="w-5 h-5 text-[#3b76b3]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setSettings({ ...settings, themeColor: 'green' })}
              className={`p-4 rounded-xl border text-right transition-all flex items-center justify-between ${
                settings?.themeColor === 'green'
                  ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
                  : 'bg-[#101217] border-[#222630] text-stone-400 hover:text-stone-200 hover:border-stone-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#16a34a] flex items-center justify-center text-white shadow-md font-bold text-xs">
                  CGL
                </div>
                <div>
                  <div className="text-xs font-bold text-white">اللون الأخضر المعتمد</div>
                  <div className="text-[11px] text-stone-400 font-mono mt-0.5">Primary: #16a34a</div>
                </div>
              </div>
              {settings?.themeColor === 'green' && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
            </button>
          </div>
        </div>

        {/* Light Mode Availability Switch */}
        <div className="bg-[#15181e] border border-[#222630] rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#222630]">
            <div className="flex items-center gap-2 text-stone-100 font-bold text-sm">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>إتاحة الوضع الفاتح في واجهة الموقع (Light Mode Availability)</span>
            </div>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
              settings?.allowLightMode 
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' 
                : 'bg-stone-800 text-stone-400 border border-stone-700'
            }`}>
              {settings?.allowLightMode ? 'مُفعّل' : 'مُعطّل (الداكن فقط)'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#101217] border border-[#222630]">
            <div>
              <div className="text-xs font-bold text-stone-200">
                {settings?.allowLightMode
                  ? 'الوضع الفاتح متاح حالياً للزوار'
                  : 'الوضع الداكن الفخم هو الحصري والافتراضي'}
              </div>
              <p className="text-[11px] text-stone-400 mt-1 max-w-xl leading-relaxed">
                {settings?.allowLightMode
                  ? 'يظهر زر التبديل (الشمس / القمر) في شريط التنقل بالموقع، ويمكن للزوار التبديل بحرية بين الثيم الفاتح والثيم الداكن.'
                  : 'يتم إخفاء زر التبديل تماماً من الموقع، وفرض الثيم الداكن الفخم فقط على جميع المستخدمين حتى لو كان الزائر قد اختار الوضع الفاتح سابقاً.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSettings({ ...settings, allowLightMode: !settings?.allowLightMode })}
              className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings?.allowLightMode ? 'bg-[#3b76b3]' : 'bg-stone-700'
              }`}
              role="switch"
              aria-checked={Boolean(settings?.allowLightMode)}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings?.allowLightMode ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Statistics Counters in Hero */}
        <div className="bg-[#15181e] border border-[#222630] rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#222630] text-stone-100 font-bold text-sm">
            <Hash className="w-4 h-4 text-[#3b76b3]" />
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
                  stats: { ...settings.stats, globalPartners: parseInt(e.target.value) || 0 }
                })}
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#3b76b3]"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1 font-mono">الحلول الهندسية المبتكرة</label>
              <input
                type="number"
                value={settings?.stats?.innovativeSolutions || 300}
                onChange={(e) => setSettings({
                  ...settings,
                  stats: { ...settings.stats, innovativeSolutions: parseInt(e.target.value) || 0 }
                })}
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#3b76b3]"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1 font-mono">سنوات الخبرة والنمو</label>
              <input
                type="number"
                value={settings?.stats?.yearsOfGrowth || 20}
                onChange={(e) => setSettings({
                  ...settings,
                  stats: { ...settings.stats, yearsOfGrowth: parseInt(e.target.value) || 0 }
                })}
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#3b76b3]"
              />
            </div>
          </div>
        </div>

        {/* Contact Info & Telephones */}
        <div className="bg-[#15181e] border border-[#222630] rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#222630] text-stone-100 font-bold text-sm">
            <Phone className="w-4 h-4 text-[#508ecb]" />
            <span>بيانات الاتصال وأرقام الواتساب المباشرة</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-stone-300 mb-1">الهاتف والواتساب الرئيسي 1</label>
              <input
                type="text"
                value={settings?.phone1 || ''}
                onChange={(e) => setSettings({ ...settings, phone1: e.target.value, phone: e.target.value, whatsapp1: e.target.value })}
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono text-left focus:outline-none focus:border-[#3b76b3]"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1">الهاتف والواتساب الإضافي 2</label>
              <input
                type="text"
                value={settings?.phone2 || ''}
                onChange={(e) => setSettings({ ...settings, phone2: e.target.value, whatsapp2: e.target.value })}
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono text-left focus:outline-none focus:border-[#3b76b3]"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1 font-mono">رقم الواتساب الأول (Raw digits بدون مسافات)</label>
              <input
                type="text"
                value={settings?.whatsapp1Raw || ''}
                onChange={(e) => setSettings({ ...settings, whatsapp1Raw: e.target.value, phone1Raw: e.target.value })}
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono text-left focus:outline-none focus:border-[#3b76b3]"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1 font-mono">رقم الواتساب الثاني (Raw digits بدون مسافات)</label>
              <input
                type="text"
                value={settings?.whatsapp2Raw || ''}
                onChange={(e) => setSettings({ ...settings, whatsapp2Raw: e.target.value, phone2Raw: e.target.value })}
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono text-left focus:outline-none focus:border-[#3b76b3]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs text-stone-300 mb-1">البريد الإلكتروني المعتمد للمراسلات</label>
              <input
                type="email"
                value={settings?.email || ''}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono text-left focus:outline-none focus:border-[#3b76b3]"
              />
            </div>
          </div>
        </div>

        {/* Working Hours Time Picker */}
        <div className="bg-[#15181e] border border-[#222630] rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#222630]">
            <div className="flex items-center gap-2 text-stone-100 font-bold text-sm">
              <Clock className="w-4 h-4 text-[#3b76b3]" />
              <span>مواعيد وساعات العمل المعتمدة (Time Picker موحد)</span>
            </div>
            <button
              type="button"
              onClick={() => setManualOverride(!manualOverride)}
              className="text-[11px] text-stone-400 hover:text-stone-200 underline"
            >
              {manualOverride ? 'العودة للمنظّم الآلي' : 'تعديل النص يدوياً'}
            </button>
          </div>

          {!manualOverride ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Start Time Picker */}
                <div>
                  <label className="block text-xs text-stone-300 mb-1 font-medium">
                    وقت البدء (Start Time)
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => handleTimeChange(e.target.value, endTime, selectedDays)}
                    className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3.5 py-2.5 text-xs text-stone-100 focus:outline-none focus:border-[#3b76b3]"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    {formatTimeTo12h(startTime, 'ar')}
                  </span>
                </div>

                {/* End Time Picker */}
                <div>
                  <label className="block text-xs text-stone-300 mb-1 font-medium">
                    وقت الانتهاء (End Time)
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => handleTimeChange(startTime, e.target.value, selectedDays)}
                    className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3.5 py-2.5 text-xs text-stone-100 focus:outline-none focus:border-[#3b76b3]"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    {formatTimeTo12h(endTime, 'ar')}
                  </span>
                </div>

                {/* Working Days Preset */}
                <div>
                  <label className="block text-xs text-stone-300 mb-1 font-medium">
                    أيام العمل (Working Days)
                  </label>
                  <select
                    value={selectedDays}
                    onChange={(e) => handleTimeChange(startTime, endTime, e.target.value)}
                    className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-stone-100 focus:outline-none focus:border-[#3b76b3]"
                  >
                    {DAYS_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.labelAr} ({p.labelEn})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Automatic Output Preview */}
              <div className="p-3.5 rounded-xl bg-[#0f1115] border border-[#222630] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-stone-500 block mb-0.5">الصياغة بالعربية:</span>
                  <span className="font-semibold text-white">
                    {settings?.workingHoursAr || 'غير محدد'}
                  </span>
                </div>
                <div dir="ltr" className="text-left">
                  <span className="text-[10px] text-stone-500 block mb-0.5">English Preview:</span>
                  <span className="font-semibold text-white font-sans">
                    {settings?.workingHoursEn || 'Not set'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-stone-300 mb-1">ساعات العمل المعتمدة (عربي)</label>
                <input
                  type="text"
                  value={settings?.workingHoursAr || ''}
                  onChange={(e) => setSettings({ ...settings, workingHoursAr: e.target.value })}
                  className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-[#3b76b3]"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1">ساعات العمل المعتمدة (English)</label>
                <input
                  type="text"
                  value={settings?.workingHoursEn || ''}
                  onChange={(e) => setSettings({ ...settings, workingHoursEn: e.target.value })}
                  dir="ltr"
                  className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-sans focus:outline-none focus:border-[#3b76b3]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Headquarter & Address */}
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
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-[#3b76b3]"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1">عنوان المقر الرئيسي (English)</label>
              <input
                type="text"
                value={settings?.addressEn || ''}
                onChange={(e) => setSettings({ ...settings, addressEn: e.target.value })}
                dir="ltr"
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-sans focus:outline-none focus:border-[#3b76b3]"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1 font-mono">خط العرض (Latitude)</label>
              <input
                type="number"
                step="any"
                value={settings?.coordinates?.lat || 21.5231047}
                onChange={(e) => setSettings({
                  ...settings,
                  coordinates: { ...settings.coordinates, lat: parseFloat(e.target.value) || 0 }
                })}
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#3b76b3]"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1 font-mono">خط الطول (Longitude)</label>
              <input
                type="number"
                step="any"
                value={settings?.coordinates?.lng || 39.177774}
                onChange={(e) => setSettings({
                  ...settings,
                  coordinates: { ...settings.coordinates, lng: parseFloat(e.target.value) || 0 }
                })}
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#3b76b3]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs text-stone-300 mb-1 font-mono">رابط خرائط جوجل المباشر (Google Maps Link)</label>
              <input
                type="text"
                value={settings?.googleMapsUrl || ''}
                onChange={(e) => setSettings({ ...settings, googleMapsUrl: e.target.value })}
                dir="ltr"
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#3b76b3]"
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
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#3b76b3]"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1 font-mono">الرقم الضريبي (VAT)</label>
              <input
                type="text"
                value={settings?.vatNumber || ''}
                onChange={(e) => setSettings({ ...settings, vatNumber: e.target.value })}
                dir="ltr"
                className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#3b76b3]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#3b76b3] hover:bg-[#2a5b8c] text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
