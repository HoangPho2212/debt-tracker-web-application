import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, UtensilsCrossed, ShieldAlert } from 'lucide-react';
import { AuthEngine } from '../services/auth';

interface LockScreenProps {
  restaurantName: string;
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  restaurantName,
  onUnlock,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu để mở khóa.');
      return;
    }

    setIsSubmitting(true);
    const success = AuthEngine.login(password.trim());
    setIsSubmitting(false);

    if (success) {
      setErrorMsg('');
      onUnlock();
    } else {
      setErrorMsg('Mật khẩu không chính xác. Vui lòng thử lại.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-scale-up">
        {/* Brand Icon & Heading */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 mx-auto">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              {restaurantName || 'Sổ Ghi Nợ Quán Cơm'}
            </h1>
            <p className="text-xs font-medium text-slate-500 flex items-center justify-center gap-1 mt-0.5">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Yêu cầu mật mã bảo vệ</span>
            </p>
          </div>
        </div>

        {/* Lock Form */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Mật khẩu mở khóa máy
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                autoFocus
                placeholder="Nhập mật khẩu..."
                className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-base font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[48px] shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 mt-2 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl animate-fade-in">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[48px] py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>MỞ KHÓA SỔ NỢ</span>
          </button>
        </form>

        {/* Security Note */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">
            Mỗi thiết bị chỉ cần mở khóa 1 lần. Mật khẩu được bảo mật trên máy.
          </p>
        </div>
      </div>
    </div>
  );
};
