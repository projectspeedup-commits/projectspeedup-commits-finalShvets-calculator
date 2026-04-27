import { Calculator, Lock, Moon, Sun, User } from "lucide-react";
import React, { useState } from "react";

interface LoginScreenProps {
  onManagerLogin: () => void;
  onAdminLogin: () => void;
  isCloudActive: boolean;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export function LoginScreen({ onManagerLogin, onAdminLogin, isCloudActive, isDarkMode, toggleTheme }: LoginScreenProps) {
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
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#F4F5F4] dark:bg-[#121411] transition-colors duration-300 relative">
      <button 
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-3 rounded-full bg-white dark:bg-[#1A1C19] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-90 transition-all z-50"
      >
        {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
      </button>
      <div className="flex flex-col gap-6 w-full max-w-md">
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-slate-700 dark:bg-slate-600 rounded-2xl flex items-center justify-center shadow-md mb-4 text-white">
            <Calculator className="w-8 h-8" />
          </div>
          <h1 className="text-3xl tracking-tight text-[#1A1C19] dark:text-white mb-1 font-normal">Система расчетов</h1>
          <p className="text-[#43483F] dark:text-slate-400 font-medium tracking-wide uppercase text-xs">ООО "ЗМК Арсенал"</p>
        </div>

        {/* Manager Card */}
        <div className="bg-white dark:bg-[#1A1C19] p-6 sm:p-8 rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <User className="w-6 h-6 text-slate-700 dark:text-slate-400" strokeWidth={1.5} />
            <h2 className="text-xl font-normal text-[#1A1C19] dark:text-white">Вход для менеджеров</h2>
          </div>
          <p className="text-sm text-[#43483F] dark:text-slate-400 mb-6 leading-relaxed">
            Свободный доступ к калькулятору для расчета заказов.
            {isCloudActive
              ? " Цены на сырье автоматически загружаются из облака."
              : " Цены синхронизированы локально."}
          </p>
          <button
            onClick={onManagerLogin}
            className="w-full flex items-center justify-center gap-2 bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-500 text-white rounded-full h-12 px-6 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Войти в калькулятор
          </button>
        </div>

        {/* Admin Card */}
        <div className="bg-white dark:bg-[#1A1C19] p-6 sm:p-8 rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-5">
            <Lock className="w-6 h-6 text-slate-700 dark:text-slate-400" strokeWidth={1.5} />
            <h2 className="text-xl font-normal text-[#1A1C19] dark:text-white">Вход для администратора</h2>
          </div>

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div className="space-y-3">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Логин"
                className="w-full bg-[#F0F4F4] dark:bg-slate-800 dark:text-white border-b border-slate-400 dark:border-slate-600 rounded-t-lg px-4 h-14 text-base focus:border-slate-800 dark:focus:border-white focus:outline-none focus:ring-0 transition-colors placeholder:text-slate-500"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                className="w-full bg-[#F0F4F4] dark:bg-slate-800 dark:text-white border-b border-slate-400 dark:border-slate-600 rounded-t-lg px-4 h-14 text-base focus:border-slate-800 dark:focus:border-white focus:outline-none focus:ring-0 transition-colors placeholder:text-slate-500"
              />
            </div>

            {error && (
              <div className="text-red-500 dark:text-red-400 text-sm font-medium pt-2">
                Неверный логин или пароль
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 border border-slate-400 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-full h-12 px-6 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 mt-2"
            >
              Управление ценами
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
