import { DEFAULT_STEEL_GRADES, formatInputValue, handleNumericInput } from "../lib/constants";
import { Cloud, LogOut, Plus, Trash2, Settings } from "lucide-react";
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
    <div className="min-h-screen bg-[#F4F5F4] flex flex-col md:flex-row">
      {/* Mobile App Bar */}
      <div className="md:hidden fixed bottom-0 w-full bg-[#F0F4F4]/90 backdrop-blur-md border-t border-slate-200 flex justify-around items-center h-16 z-50">
         <div className="flex flex-col items-center justify-center w-full h-full text-slate-800">
           <div className="bg-slate-200 px-4 py-1 rounded-full mb-1">
             <Settings className="w-5 h-5" />
           </div>
           <span className="text-[10px] font-medium tracking-wide">Настройки</span>
         </div>
         <button onClick={onLogout} className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-slate-800">
           <div className="px-4 py-1 mb-1">
             <LogOut className="w-5 h-5" />
           </div>
           <span className="text-[10px] font-medium tracking-wide">Выйти</span>
         </button>
      </div>

      {/* Desktop Navigation Rail */}
      <div className="hidden md:flex flex-col w-[88px] bg-[#F0F4F4] border-r border-slate-200 items-center py-6 fixed h-full z-50">
        <div className="flex flex-col items-center mb-8">
           <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-white mb-2 shadow-sm">
             <Cloud className="w-6 h-6" />
           </div>
        </div>
        <div className="flex-1 flex flex-col gap-4 w-full px-3">
           <div className="w-full flex flex-col items-center justify-center py-4 text-slate-900">
             <div className="bg-slate-200 px-5 py-1.5 rounded-full mb-1.5">
               <Settings className="w-6 h-6" strokeWidth={2} />
             </div>
             <span className="text-[11px] font-medium tracking-wide">Настройки</span>
           </div>
        </div>
        <div className="w-full px-3">
           <button onClick={onLogout} className="w-full flex flex-col items-center justify-center py-4 text-slate-500 hover:text-slate-900 transition-colors">
             <div className="px-5 py-1.5 mb-1.5">
               <LogOut className="w-6 h-6" strokeWidth={2} />
             </div>
             <span className="text-[11px] font-medium tracking-wide">Выйти</span>
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[88px] pb-24 md:pb-8 pt-8 px-4 sm:px-8 max-w-[1200px] mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-normal tracking-tight text-[#1A1C19]">
            {isCloudActive ? "Облачные настройки" : "Локальные настройки"}
          </h2>
          <p className="text-sm text-[#43483F] mt-2">
            {isCloudActive
              ? "Цены автоматически синхронизируются со всеми менеджерами компании."
              : "Внимание: Облако недоступно. Сохраняется локально."}
          </p>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-12 gap-6 w-full">
          {/* Main settings column */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            
            {/* Pricing table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-base font-medium text-[#1A1C19]">
                  Цены и политика продажи
                </h3>
              </div>
              <div className="overflow-x-auto p-0 m-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="text-[#43483F] border-b border-slate-200 bg-white">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Марка стали</th>
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-right">Цена (руб/тн)</th>
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-center">Круг</th>
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-center">Шестигранник</th>
                        <th className="px-4 py-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allGrades.map((grade) => {
                        const isCustom = customGrades.includes(grade);
                        const pricing = remnantPricing[grade] || { round: "remnant", hex: "remnant" };

                        return (
                          <tr key={grade} className="bg-white hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-[#1A1C19] text-sm">
                              {grade}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <input
                                type="text"
                                inputMode="decimal"
                                placeholder="Цена..."
                                value={formatInputValue(rawPrices[grade] || "")}
                                onChange={(e) => handlePriceChange(grade, e.target.value)}
                                className="w-[120px] ml-auto block bg-transparent border-b border-slate-300 focus:border-slate-800 focus:outline-none text-right text-sm font-medium h-9 placeholder:text-slate-400"
                              />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <select
                                value={pricing.round}
                                onChange={(e) => handlePricingChange(grade, "round", e.target.value)}
                                className={`bg-[#F0F4F4] text-xs font-medium rounded-lg px-3 py-2 outline-none appearance-none cursor-pointer w-[150px] mx-auto border-transparent focus:ring-2 focus:ring-slate-300 ${
                                  pricing.round === "scrap" ? "text-[#BA1A1A] bg-red-50" : "text-[#1A1C19]"
                                }`}
                              >
                                <option value="remnant" className="text-[#1A1C19]">Деловой остаток</option>
                                <option value="scrap" className="text-[#BA1A1A]">По цене лома</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <select
                                value={pricing.hex}
                                onChange={(e) => handlePricingChange(grade, "hex", e.target.value)}
                                className={`bg-[#F0F4F4] text-xs font-medium rounded-lg px-3 py-2 outline-none appearance-none cursor-pointer w-[150px] mx-auto border-transparent focus:ring-2 focus:ring-slate-300 ${
                                  pricing.hex === "scrap" ? "text-[#BA1A1A] bg-red-50" : "text-[#1A1C19]"
                                }`}
                              >
                                <option value="remnant" className="text-[#1A1C19]">Деловой остаток</option>
                                <option value="scrap" className="text-[#BA1A1A]">По цене лома</option>
                              </select>
                            </td>
                            <td className="px-4 py-4 text-center align-middle">
                              {isCustom ? (
                                <button
                                  onClick={() => handleRemoveGrade(grade)}
                                  className="text-slate-400 hover:text-[#BA1A1A] transition-colors p-2 rounded-full hover:bg-red-50"
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
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
              <h3 className="text-base font-medium text-[#1A1C19]">Сохранение изменений</h3>
              
              {saveError && (
                <div className="text-[#BA1A1A] text-sm font-medium bg-red-50 p-3 rounded-xl">
                  {saveError}
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`w-full flex justify-center items-center gap-2 text-white rounded-full h-12 px-6 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  saved ? "bg-green-700 hover:bg-green-800 focus:ring-green-700" : "bg-slate-800 hover:bg-slate-900 focus:ring-slate-800"
                } ${isSaving ? "opacity-70 pointer-events-none" : ""}`}
              >
                {isSaving ? "Сохранение..." : saved ? "✓ Сохранено" : "Сохранить настройки"}
              </button>
            </div>

            {/* Scrap and Remnant */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
              <h3 className="text-base font-medium text-[#1A1C19]">Базовые цены</h3>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#43483F]">Цена лома (руб/тн)</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="20 000"
                      value={formatInputValue(scrap)}
                      onChange={(e) => handleNumericInput(e, setScrap)}
                      className="w-full bg-[#F0F4F4] border-b border-slate-400 rounded-t-lg pl-3 pr-12 h-12 text-sm focus:border-slate-800 focus:outline-none focus:ring-0 transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">руб</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#43483F]">Цена делового остатка (руб/тн)</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="35 000"
                      value={formatInputValue(remnant)}
                      onChange={(e) => handleNumericInput(e, setRemnant)}
                      className="w-full bg-[#F0F4F4] border-b border-slate-400 rounded-t-lg pl-3 pr-12 h-12 text-sm focus:border-slate-800 focus:outline-none focus:ring-0 transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">руб</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Add grade */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
              <h3 className="text-base font-medium text-[#1A1C19]">Новая марка стали</h3>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Например: ст.50"
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  className="w-full bg-[#F0F4F4] border-b border-slate-400 rounded-t-lg px-4 h-12 text-sm focus:border-slate-800 focus:outline-none focus:ring-0 transition-colors"
                />
                <button
                  onClick={handleAddGrade}
                  disabled={!newGrade.trim()}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-50 disabled:bg-slate-100 flex items-center justify-center gap-2 rounded-full h-11 px-6 text-sm font-medium transition-colors"
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
