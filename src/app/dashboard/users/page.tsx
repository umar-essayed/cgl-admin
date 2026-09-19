'use client';
import LoadingSpinner from '@/components/LoadingSpinner';

import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  Trash2, 
  X, 
  Save, 
  Lock, 
  Mail, 
  User, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'editor';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLoginAt: string | null;
  isRoot?: boolean;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' as 'superadmin' | 'admin' | 'editor'
  });
  const [showPassword, setShowPassword] = useState(false);

  // Edit / Password Reset Modal
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [editRole, setEditRole] = useState<'superadmin' | 'admin' | 'editor'>('admin');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin-users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch('/api/admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'فشل إضافة المشرف');
        setSaving(false);
        return;
      }

      setSuccess('تم إضافة حساب المشرف بنجاح!');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'admin' });
      fetchUsers();
    } catch (err: any) {
      setError('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    if (user.isRoot) return;
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/admin-users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      }
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/admin-users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.filter(u => u.id !== id));
        setDeleteConfirmId(null);
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    setError('');

    try {
      const payload: any = { role: editRole };
      if (resetPassword.trim()) {
        payload.password = resetPassword.trim();
      }

      const res = await fetch(`/api/admin-users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'فشل تحديث البيانات');
        setSaving(false);
        return;
      }

      setEditingUser(null);
      setResetPassword('');
      fetchUsers();
    } catch (err) {
      setError('حدث خطأ أثناء التحديث');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>مدير عام (Super Admin)</span>
          </span>
        );
      case 'admin':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-[#3b76b3]/10 text-[#3b76b3] border border-[#3b76b3]/20 text-xs font-bold inline-flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            <span>مشرف نظام (Admin)</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold inline-flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span>محرر محتوى (Editor)</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#13151a] p-4 sm:p-6 rounded-2xl border border-[#222630] shadow-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#3b76b3] mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>فريق الإدارة والتحكم</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">إدارة حسابات الأدمن والمشرفين</h1>
          <p className="text-xs text-stone-400 mt-1">
            إضافة وإدارة حسابات المشرفين المصرح لهم بالدخول إلى لوحة تحكم CGL
          </p>
        </div>

        <button
          onClick={() => {
            setError('');
            setFormData({ name: '', email: '', password: '', role: 'admin' });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3b76b3] hover:bg-[#2a5b8c] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة مشرف جديد</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-[#13151a] p-3 sm:p-4 rounded-xl border border-[#222630] flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو البريد الإلكتروني..."
            className="w-full bg-[#101217] border border-[#222630] rounded-xl pl-3.5 pr-10 py-2 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#3b76b3] transition-colors"
          />
          <Search className="w-4 h-4 text-stone-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <div className="text-xs font-mono text-stone-400 whitespace-nowrap hidden sm:block">
          إجمالي الحسابات: <span className="text-white font-bold">{users.length}</span>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="p-12 text-center bg-[#13151a] rounded-2xl border border-[#222630]">
          <div className="w-8 h-8 border-2 border-[#3b76b3] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-stone-400">جاري تحميل حسابات المشرفين...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center bg-[#13151a] rounded-2xl border border-[#222630]">
          <User className="w-12 h-12 text-stone-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-white">لا توجد نتائج مطابقة</p>
          <p className="text-xs text-stone-400 mt-1">جرّب تغيير كلمات البحث أو أضف مشرفاً جديداً</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards (Phones: block md:hidden) */}
          <div className="block md:hidden space-y-3">
            {filteredUsers.map((user) => (
              <div 
                key={user.id} 
                className={`bg-[#13151a] border rounded-2xl p-4 shadow-sm transition-all ${
                  user.isRoot ? 'border-[#3b76b3]/30 bg-gradient-to-b from-[#13151a] to-[#151a14]' : 'border-[#222630]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-white truncate">{user.name}</span>
                      {user.isRoot && (
                        <span className="px-2 py-0.5 rounded-md bg-[#3b76b3]/20 text-[#3b76b3] text-[10px] font-mono font-bold">
                          رئيسي
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-stone-400 mt-0.5 truncate" dir="ltr">
                      {user.email}
                    </div>
                  </div>
                  
                  <div>
                    {user.status === 'active' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>نشط</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-stone-500/10 text-stone-400 border border-stone-500/20 text-[11px] font-bold inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                        <span>معطل</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-[#222630]/60 text-xs">
                  <div>{getRoleBadge(user.role)}</div>

                  {!user.isRoot && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setEditRole(user.role);
                          setResetPassword('');
                          setError('');
                        }}
                        className="p-2 rounded-lg bg-[#1a1e26] hover:bg-[#222632] text-stone-300 transition-colors"
                        title="تعديل أو إعادة ضبط كلمة المرور"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.status === 'active'
                            ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                        title={user.status === 'active' ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                      >
                        {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(user.id)}
                        className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                        title="حذف الحساب"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (Laptops/Desktops: hidden md:block) */}
          <div className="hidden md:block bg-[#13151a] rounded-2xl border border-[#222630] overflow-hidden shadow-sm">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#101217] text-stone-400 border-b border-[#222630] font-mono">
                <tr>
                  <th className="py-3.5 px-4">المشرف</th>
                  <th className="py-3.5 px-4">البريد الإلكتروني</th>
                  <th className="py-3.5 px-4">مستوى الصلاحية</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4">تاريخ الإنشاء</th>
                  <th className="py-3.5 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222630]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          user.isRoot ? 'bg-[#3b76b3] text-white font-bold' : 'bg-[#1a1e26] text-stone-300'
                        }`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {user.isRoot && (
                              <span className="px-1.5 py-0.5 rounded bg-[#3b76b3]/20 text-[#3b76b3] text-[10px] font-mono">
                                رئيسي
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-stone-300" dir="ltr">
                      {user.email}
                    </td>

                    <td className="py-3.5 px-4">
                      {getRoleBadge(user.role)}
                    </td>

                    <td className="py-3.5 px-4">
                      {user.status === 'active' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>نشط</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-stone-500/10 text-stone-400 border border-stone-500/20 text-[11px] font-bold inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                          <span>معطل</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-stone-400 font-mono">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-SA') : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {user.isRoot ? (
                        <span className="text-[11px] text-stone-500 font-mono">حساب محمي</span>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setEditRole(user.role);
                              setResetPassword('');
                              setError('');
                            }}
                            className="p-1.5 rounded-lg bg-[#1a1e26] hover:bg-[#222632] text-stone-300 transition-colors"
                            title="تعديل الحساب أو تغيير كلمة المرور"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.status === 'active'
                                ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                            title={user.status === 'active' ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                          >
                            {user.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(user.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                            title="حذف الحساب"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add New Admin Modal (Bottom sheet on mobile) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm transition-all">
          <div className="w-full max-w-lg bg-[#15181e] border border-[#222630] rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#222630] mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#3b76b3]/10 text-[#3b76b3]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">إضافة مشرف إداري جديد</h3>
                  <p className="text-xs text-stone-400">سيتم منح هذا الحساب صلاحيات الدخول للوحة التحكم</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  اسم المشرف الكامل *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="م. محمد الغامدي"
                    className="w-full bg-[#101217] border border-[#222630] rounded-xl pr-10 pl-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#3b76b3]"
                  />
                  <User className="w-4 h-4 text-stone-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  البريد الإلكتروني المهني *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    dir="ltr"
                    placeholder="name@cgl.sa"
                    className="w-full bg-[#101217] border border-[#222630] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#3b76b3]"
                  />
                  <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  كلمة المرور * (6 خانات على الأقل)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    dir="ltr"
                    placeholder="••••••••••••"
                    className="w-full bg-[#101217] border border-[#222630] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#3b76b3]"
                  />
                  <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  مستوى الصلاحية *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'superadmin', label: 'مدير عام', desc: 'كامل الصلاحيات' },
                    { id: 'admin', label: 'مشرف نظام', desc: 'إدارة المحتوى والطلبات' },
                    { id: 'editor', label: 'محرر محتوى', desc: 'نشر الأخبار والمشاريع' }
                  ].map((roleOpt) => (
                    <button
                      key={roleOpt.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: roleOpt.id as any })}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        formData.role === roleOpt.id
                          ? 'bg-[#3b76b3]/15 border-[#3b76b3] text-white'
                          : 'bg-[#101217] border-[#222630] text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <div className="font-bold text-xs">{roleOpt.label}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{roleOpt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-2 border-t border-[#222630]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#222630] text-stone-300 hover:bg-white/5 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#3b76b3] hover:bg-[#2a5b8c] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>حفظ وإنشاء الحساب</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role / Reset Password Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm transition-all">
          <div className="w-full max-w-md bg-[#15181e] border border-[#222630] rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#222630] mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#3b76b3]" />
                <h3 className="text-base font-bold text-white">تعديل بيانات الحساب</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <span className="text-xs text-stone-400">اسم المشرف:</span>
                <p className="text-sm font-bold text-white">{editingUser.name}</p>
                <p className="text-xs font-mono text-stone-400" dir="ltr">{editingUser.email}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  مستوى الصلاحية
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3b76b3]"
                >
                  <option value="superadmin">مدير عام (Super Admin)</option>
                  <option value="admin">مشرف نظام (Admin)</option>
                  <option value="editor">محرر محتوى (Editor)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  تعيين كلمة مرور جديدة (اتركه فارغاً للإبقاء على الحالية)
                </label>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  dir="ltr"
                  placeholder="كلمة مرور جديدة (6 خانات على الأقل)"
                  className="w-full bg-[#101217] border border-[#222630] rounded-xl px-3 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#3b76b3]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#222630]">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-[#222630] text-stone-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#3b76b3] hover:bg-[#2a5b8c] text-white text-xs font-bold shadow transition-all disabled:opacity-50"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#15181e] border border-[#222630] rounded-2xl p-5 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">تأكيد حذف الحساب</h3>
            <p className="text-xs text-stone-400 mb-4">
              هل أنت متأكد من رغبتك في إزالة حساب هذا المشرف؟ لن يتمكن من تسجيل الدخول إلى لوحة التحكم بعد الحذف.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-[#222630] text-stone-300 text-xs font-bold"
              >
                تراجع
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirmId)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow"
              >
                نعم، احذف الحساب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
