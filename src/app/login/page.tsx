'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExpired = searchParams.get('expired') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'بيانات الدخول غير صحيحة');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        const redirectUrl = searchParams.get('redirect') || '/dashboard';
        router.push(redirectUrl);
        router.refresh();
      }, 500);
    } catch {
      setError('حدث خطأ في الاتصال بالخادم، يرجى المحاولة لاحقاً');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-stone-100 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Real Brand Logo */}
        <div className="text-center mb-8">
          <div className="inline-block relative h-14 w-44 mb-3">
            <Image
              src="/assets/cgl-logo1.png"
              alt="CGL Logo"
              fill
              priority
              className="object-contain"
            />
          </div>
          <h1 className="text-lg font-bold text-white">لوحة الإدارة والتحكم المركزية</h1>
          <p className="text-xs text-stone-400 mt-1">Creative Geotechnical Laboratories (CGL)</p>
        </div>

        {/* Clean Login Card */}
        <div className="bg-[#15181e] border border-[#222630] rounded-2xl p-7 shadow-xl shadow-black/40">
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-white">تسجيل الدخول</h2>
            <p className="text-xs text-stone-400 mt-0.5">أدخل بيانات الاعتماد للمتابعة</p>
          </div>

          {isExpired && !error && !success && (
            <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>انتهت مدة الجلسة (ساعتان). يرجى إدخال اسم المستخدم وكلمة المرور لتسجيل الدخول مجدداً.</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>تم التحقق بنجاح! جاري تحويلك إلى لوحة التحكم...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                  placeholder="admin@cgl.sa"
                  className="w-full bg-[#101217] border border-[#222630] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#3b76b3] transition-colors"
                />
                <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                  placeholder="••••••••••••"
                  className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#3b76b3] transition-colors pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-2 bg-[#3b76b3] hover:bg-[#2a5b8c] text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>دخول لوحة التحكم</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-stone-500 mt-6">
          © {new Date().getFullYear()} Creative Geotechnical Laboratories (CGL)
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0f12]" />}>
      <LoginForm />
    </Suspense>
  );
}
