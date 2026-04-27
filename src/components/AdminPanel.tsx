import { DEFAULT_STEEL_GRADES, formatInputValue, handleNumericInput } from "../lib/constants";
import { Cloud, LogOut, Plus, Trash2, Settings, Moon, Sun, Info } from "lucide-react";
import { useEffect, useState } from "react";

interface AdminPanelProps {
  initialRawPrices: Record<string, string>;
  initialScrap: string;
  initialRemnant: string;
  initialCustomGrades: string[];
  initialRemnantPricing: Record<string, { round: string; hex: string }>;
  onSave: (
    rawPrices: Record<string, string>,
    scrap: string,
    remnant: string,
    customGrades: string[],
    remnantPricing: Record<string, { round: string; hex: string }>
  ) => Promise<void>;
  onLogout: () => void;
  isCloudActive: boolean;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export function AdminPanel({
  initialRawPrices,
  initialScrap,
  initialRemnant,
  initialCustomGrades,
  initialRemnantPricing,
  onSave,
  onLogout,
  isCloudActive,
  isDarkMode,
  toggleTheme,
}: AdminPanelProps) {
  const [rawPrices, setRawPrices] = useState(initialRawPrices);
  const [scrap, setScrap] = useState(initialScrap);
  const [remnant, setRemnant] = useState(initialRemnant);
  const [customGrades, setCustomGrades] = useState(initialCustomGrades || []);
  const [remnantPricing, setRemnantPricing] = useState(initialRemnantPricing || {});

  const [newGrade, setNewGrade] = useState("");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    setRawPrices(initialRawPrices);
    setScrap(initialScrap);
    setRemnant(initialRemnant);
    setCustomGrades(initialCustomGrades || []);
    setRemnantPricing(initialRemnantPricing || {});
  }, [initialRawPrices, initialScrap, initialRemnant, initialCustomGrades, initialRemnantPricing]);

  const allGrades = [...DEFAULT_STEEL_GRADES, ...customGrades];

  const RemnantPricingTooltip = () => (
    <div className="group relative inline-block ml-1 align-middle">
      <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 cursor-help" />
      <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-[#1A1C19] dark:bg-slate-700 text-white text-[10px] rounded-xl shadow-2xl w-60 z-[100] transition-all normal-case font-normal text-left border border-slate-700">
        <div className="font-bold mb-1 border-b border-white/10 pb-1 text-[11px]">Типы остатков</div>
        <div className="space-y-2 opacity-95">
          <div>
            <span className="text-sky-300 font-bold uppercase tracking-tighter">Деловой остаток:</span>
            <p className="mt-0.5 leading-relaxed">Длинные куски (обычно &gt;2.5м), которые можно продать как полноценную заготовку по цене делового остатка.</p>
          </div>
          <div>
            <span className="text-red-400 font-bold uppercase tracking-tighter">По цене лома:</span>
            <p className="mt-0.5 leading-relaxed">Мелкие обрезки и технические концы, которые не имеют складской ценности и продаются по весу лома.</p>
          </div>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-[#1A1C19] dark:border-t-slate-700"></div>
      </div>
    </div>
  );

  const handlePriceChange = (grade: string, value: string) => {
    let val = value.replace(/\s/g, "").replace(/,/g, ".");
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setRawPrices((prev) => ({ ...prev, [grade]: val }));
    }
  };

  const handlePricingChange = (grade: string, profile: "round" | "hex", value: string) => {
    setRemnantPricing((prev) => ({
      ...prev,
      [grade]: {
        ...(prev[grade] || { round: "remnant", hex: "remnant" }),
        [profile]: value,
      },
    }));
  };

  const handleAddGrade = () => {
    const grade = newGrade.trim();
    if (grade && !allGrades.includes(grade)) {
      setCustomGrades([...customGrades, grade]);
      setNewGrade("");
    }
  };

  const handleRemoveGrade = (gradeToRemove: string) => {
    setCustomGrades(customGrades.filter((g) => g !== gradeToRemove));
    const newPrices = { ...rawPrices };
    delete newPrices[gradeToRemove];
    setRawPrices(newPrices);

    const newPricing = { ...remnantPricing };
    delete newPricing[gradeToRemove];
    setRemnantPricing(newPricing);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError("");
    try {
      const savePromise = onSave(rawPrices, scrap, remnant, customGrades, remnantPricing);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("CloudTimeout")), 5000)
      );

      await Promise.race([savePromise, timeoutPromise]);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Ошибка сохранения:", e);
      setSaveError("Облако недоступно. Сохранено локально.");
      setTimeout(() => setSaveError(""), 4000);
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F4] dark:bg-[#121411] flex flex-col md:flex-row transition-colors duration-300">
      {/* Mobile App Bar */}
      <div className="md:hidden fixed bottom-0 w-full bg-[#F0F4F4]/90 dark:bg-[#1A1C19]/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-around items-center h-16 z-50">
         <div className="flex flex-col items-center justify-center w-full h-full text-slate-800 dark:text-slate-200">
           <div className="bg-slate-200 dark:bg-slate-700 px-4 py-1 rounded-full mb-1 text-slate-800 dark:text-white">
             <Settings className="w-5 h-5" />
           </div>
           <span className="text-[10px] font-medium tracking-wide">Настройки</span>
         </div>
         <button onClick={toggleTheme} className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-slate-800 dark:hover:text-white active:scale-95 transition-all">
           <div className="px-4 py-1 mb-1 transition-colors">
             {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
           </div>
           <span className="text-[10px] font-medium tracking-wide">{isDarkMode ? 'Светлая' : 'Темная'}</span>
         </button>
         <button onClick={onLogout} className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-slate-800 dark:hover:text-white">
           <div className="px-4 py-1 mb-1">
             <LogOut className="w-5 h-5" />
           </div>
           <span className="text-[10px] font-medium tracking-wide">Выйти</span>
         </button>
      </div>

      {/* Desktop Navigation Rail */}
      <div className="hidden md:flex flex-col w-[88px] bg-[#F0F4F4] dark:bg-[#1A1C19] border-r border-slate-200 dark:border-slate-800 items-center py-6 fixed h-full z-50">
        <div className="flex flex-col items-center mb-8">
           <div className="w-12 h-12 bg-slate-700 dark:bg-slate-600 rounded-xl flex items-center justify-center text-white mb-2 shadow-sm">
             <Cloud className="w-6 h-6" />
           </div>
        </div>
        <div className="flex-1 flex flex-col gap-4 w-full px-3">
           <div className="w-full flex flex-col items-center justify-center py-4 text-slate-900 dark:text-slate-200">
             <div className="bg-slate-200 dark:bg-slate-700 px-5 py-1.5 rounded-full mb-1.5 text-slate-800 dark:text-white">
               <Settings className="w-6 h-6" strokeWidth={2} />
             </div>
             <span className="text-[11px] font-medium tracking-wide">Настройки</span>
           </div>
           <button onClick={toggleTheme} className="w-full flex flex-col items-center justify-center py-4 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 group">
              <div className="px-5 py-1.5 mb-1.5 transition-colors group-hover:bg-slate-100 dark:group-hover:bg-slate-800 rounded-full">
                {isDarkMode ? <Sun className="w-6 h-6 text-amber-500" strokeWidth={2} /> : <Moon className="w-6 h-6" strokeWidth={2} />}
              </div>
              <span className="text-[11px] font-medium tracking-wide">{isDarkMode ? 'Светлая' : 'Темная'}</span>
           </button>
        </div>
        <div className="w-full px-3">
           <button onClick={onLogout} className="w-full flex flex-col items-center justify-center py-4 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
             <div className="px-5 py-1.5 mb-1.5">
               <LogOut className="w-6 h-6" strokeWidth={2} />
             </div>
             <span className="text-[11px] font-medium tracking-wide">Выйти</span>
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[88px] pb-24 md:pb-8 pt-8 px-4 sm:px-8 w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-normal tracking-tight text-[#1A1C19] dark:text-white">
            {isCloudActive ? "Облачные настройки" : "Локальные настройки"}
          </h2>
          <p className="text-sm text-[#43483F] dark:text-slate-400 mt-2">
            {isCloudActive
              ? "Цены автоматически синхронизируются со всеми менеджерами компании."
              : "Внимание: Облако недоступно. Сохраняется локально."}
          </p>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-12 gap-6 w-full">
          {/* Main settings column */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            
            {/* Pricing table */}
            <div className="bg-white dark:bg-[#1A1C19] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="text-base font-medium text-[#1A1C19] dark:text-white">
                  Цены и политика продажи
                </h3>
              </div>
              <div className="overflow-x-auto p-0 m-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="text-[#43483F] dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Марка стали</th>
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-right">Цена (руб/тн) БЕЗ НДС</th>
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-center">
                          Круг
                          <RemnantPricingTooltip />
                        </th>
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-center">
                          Шестигранник
                          <RemnantPricingTooltip />
                        </th>
                        <th className="px-4 py-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {allGrades.map((grade) => {
                        const isCustom = customGrades.includes(grade);
                        const pricing = remnantPricing[grade] || { round: "remnant", hex: "remnant" };

                        return (
                          <tr key={grade} className="bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="px-6 py-4 font-medium text-[#1A1C19] dark:text-slate-100 text-sm">
                              {grade}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <input
                                type="text"
                                inputMode="decimal"
                                placeholder="Цена..."
                                value={formatInputValue(rawPrices[grade] || "")}
                                onChange={(e) => handlePriceChange(grade, e.target.value)}
                                className="w-[120px] ml-auto block bg-transparent border-b border-slate-300 dark:border-slate-700 focus:border-slate-800 dark:focus:border-slate-400 focus:outline-none text-right text-sm font-medium h-9 dark:text-white placeholder:text-slate-400"
                              />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="group relative flex justify-center">
                                <select
                                  value={pricing.round}
                                  onChange={(e) => handlePricingChange(grade, "round", e.target.value)}
                                  className={`bg-[#F0F4F4] dark:bg-slate-800 text-xs font-medium rounded-lg px-3 py-2 outline-none appearance-none cursor-pointer w-[150px] border-transparent focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 ${
                                    pricing.round === "scrap" ? "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20" : "text-[#1A1C19] dark:text-white"
                                  }`}
                                >
                                  <option value="remnant">Деловой остаток</option>
                                  <option value="scrap">По цене лома</option>
                                </select>
                                <div className="invisible group-hover:visible absolute bottom-full mb-2 p-2 bg-slate-800 dark:bg-slate-700 text-white text-[10px] rounded shadow-lg w-48 z-[100] pointer-events-none text-center">
                                  {pricing.round === "remnant" 
                                    ? "Расчет по цене делового остатка (дороже)" 
                                    : "Расчет по цене металлолома (дешевле)"}
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-800 dark:border-t-slate-700"></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="group relative flex justify-center">
                                <select
                                  value={pricing.hex}
                                  onChange={(e) => handlePricingChange(grade, "hex", e.target.value)}
                                  className={`bg-[#F0F4F4] dark:bg-slate-800 text-xs font-medium rounded-lg px-3 py-2 outline-none appearance-none cursor-pointer w-[150px] border-transparent focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 ${
                                    pricing.hex === "scrap" ? "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20" : "text-[#1A1C19] dark:text-white"
                                  }`}
                                >
                                  <option value="remnant">Деловой остаток</option>
                                  <option value="scrap">По цене лома</option>
                                </select>
                                <div className="invisible group-hover:visible absolute bottom-full mb-2 p-2 bg-slate-800 dark:bg-slate-700 text-white text-[10px] rounded shadow-lg w-48 z-[100] pointer-events-none text-center">
                                  {pricing.hex === "remnant" 
                                    ? "Расчет по цене делового остатка (дороже)" 
                                    : "Расчет по цене металлолома (дешевле)"}
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-800 dark:border-t-slate-700"></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center align-middle">
                              {isCustom ? (
                                <button
                                  onClick={() => handleRemoveGrade(grade)}
                                  className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                                  title="Удалить марку"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              ) : (
                                <div className="w-9"></div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>

          {/* Secondary settings column */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            
            {/* Save actions block */}
            <div className="bg-white dark:bg-[#1A1C19] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4">
              <h3 className="text-base font-medium text-[#1A1C19] dark:text-white">Сохранение изменений</h3>
              
              {saveError && (
                <div className="text-red-500 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
                  {saveError}
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`w-full flex justify-center items-center gap-2 text-white rounded-full h-12 px-6 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  saved ? "bg-green-700 dark:bg-green-600 hover:bg-green-800 focus:ring-green-700" : "bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 focus:ring-slate-800"
                } ${isSaving ? "opacity-70 pointer-events-none" : ""}`}
              >
                {isSaving ? "Сохранение..." : saved ? "✓ Сохранено" : "Сохранить настройки"}
              </button>
            </div>

            {/* Scrap and Remnant */}
            <div className="bg-white dark:bg-[#1A1C19] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-6">
              <h3 className="text-base font-medium text-[#1A1C19] dark:text-white">Базовые цены</h3>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#43483F] dark:text-slate-400">Цена лома (руб/тн) БЕЗ НДС</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="20 000"
                      value={formatInputValue(scrap)}
                      onChange={(e) => handleNumericInput(e, setScrap)}
                      className="w-full bg-[#F0F4F4] dark:bg-slate-800/50 border-b border-slate-300 dark:border-slate-700 rounded-lg pl-3 pr-12 h-12 text-sm focus:border-slate-800 dark:focus:border-slate-200 focus:outline-none focus:ring-0 transition-colors dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium text-sm">руб</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#43483F] dark:text-slate-400">Цена делового остатка (руб/тн) БЕЗ НДС</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="35 000"
                      value={formatInputValue(remnant)}
                      onChange={(e) => handleNumericInput(e, setRemnant)}
                      className="w-full bg-[#F0F4F4] dark:bg-slate-800/50 border-b border-slate-300 dark:border-slate-700 rounded-t-lg pl-3 pr-12 h-12 text-sm focus:border-slate-800 dark:focus:border-slate-200 focus:outline-none focus:ring-0 transition-colors dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">руб</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Add grade */}
            <div className="bg-white dark:bg-[#1A1C19] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4">
              <h3 className="text-base font-medium text-[#1A1C19] dark:text-white">Новая марка стали</h3>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Например: ст.50"
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  className="w-full bg-[#F0F4F4] dark:bg-slate-800/50 border-b border-slate-300 dark:border-slate-700 rounded-t-lg px-4 h-12 text-sm focus:border-slate-800 dark:focus:border-slate-200 focus:outline-none focus:ring-0 transition-colors dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <button
                  onClick={handleAddGrade}
                  disabled={!newGrade.trim()}
                  className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800 flex items-center justify-center gap-2 rounded-full h-11 px-6 text-sm font-medium transition-colors border border-slate-200 dark:border-slate-600 shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  <span>Добавить</span>
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
