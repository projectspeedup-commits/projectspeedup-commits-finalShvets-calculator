import { Calculator, Lock, User } from "lucide-react";
import React, { useState } from "react";

interface LoginScreenProps {
  onManagerLogin: () => void;
  onAdminLogin: () => void;
  isCloudActive: boolean;
}

export function LoginScreen({ onManagerLogin, onAdminLogin, isCloudActive }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "trushin" && password === "rfhectkm") {
      setError(false);
      onAdminLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#F4F5F4]">
      <div className="flex flex-col gap-6 w-full max-w-md">
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center shadow-md mb-4 text-white">
            <Calculator className="w-8 h-8" />
          </div>
          <h1 className="text-3xl tracking-tight text-[#1A1C19] mb-1 font-normal">Система расчетов</h1>
          <p className="text-[#43483F] font-medium tracking-wide uppercase text-xs">ООО "ЗМК Арсенал"</p>
        </div>

        {/* Manager Card */}
        <div className="bg-white p-6 sm:p-8 rounded-[24px] shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <User className="w-6 h-6 text-slate-700" strokeWidth={1.5} />
            <h2 className="text-xl font-normal text-[#1A1C19]">Вход для менеджеров</h2>
          </div>
          <p className="text-sm text-[#43483F] mb-6 leading-relaxed">
            Свободный доступ к калькулятору для расчета заказов.
            {isCloudActive
              ? " Цены на сырье автоматически загружаются из облака."
              : " Цены синхронизированы локально."}
          </p>
          <button
            onClick={onManagerLogin}
            className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 text-white rounded-full h-12 px-6 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Войти в калькулятор
          </button>
        </div>

        {/* Admin Card */}
        <div className="bg-white p-6 sm:p-8 rounded-[24px] shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-5">
            <Lock className="w-6 h-6 text-slate-700" strokeWidth={1.5} />
            <h2 className="text-xl font-normal text-[#1A1C19]">Вход для администратора</h2>
          </div>

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div className="space-y-3">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Логин"
                className="w-full bg-[#F0F4F4] border-b border-slate-400 rounded-t-lg px-4 h-14 text-base focus:border-slate-800 focus:outline-none focus:ring-0 transition-colors placeholder:text-slate-500"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                className="w-full bg-[#F0F4F4] border-b border-slate-400 rounded-t-lg px-4 h-14 text-base focus:border-slate-800 focus:outline-none focus:ring-0 transition-colors placeholder:text-slate-500"
              />
            </div>

            {error && (
              <div className="text-[#BA1A1A] text-sm font-medium pt-2">
                Неверный логин или пароль
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 border border-slate-400 hover:bg-slate-100 text-slate-800 rounded-full h-12 px-6 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 mt-2"
            >
              Управление ценами
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
