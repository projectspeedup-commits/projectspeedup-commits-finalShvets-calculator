import { formatCurrency, formatInputValue } from "../lib/constants";

interface PrintTemplateProps {
  printText: string;
  reportData: any;
  orderWeight: string;
  selectedTarget: string;
}

export function PrintTemplate({ printText, reportData, orderWeight, selectedTarget }: PrintTemplateProps) {
  const {
    dateStr,
    formattedGrade,
    gost,
    profileTypeStr,
    profileGost,
    lengthLabel,
    rawPriceNum,
    sellPriceNum,
    sellTotal,
    displayedRawLength,
    selectedRaw,
    displayedTargetLength,
    currentDrawCoef,
    techEndsMm,
    lengthAfterTechEnds,
    techTons,
    remTons,
    requiredWeight,
    commercialStats,
    advancedRemnantStats,
    scrapPriceNum,
    remnantPriceNum,
  } = reportData;

  const totalTechKg = (techTons * 1000).toFixed(1);
  const totalRemKg = (remTons * 1000).toFixed(1);

  return (
    <div className="hidden print:flex flex-col bg-white w-[210mm] h-[297mm] mx-auto font-sans text-slate-800 box-border overflow-hidden" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      
      <div className="flex-1 py-10 px-12 pb-0 flex flex-col">
        {/* HEADER */}
        <div className="border-b-2 border-slate-900 pb-4 mb-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#111827]">ЗМК АРСЕНАЛ</h1>
              <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-[0.1em]">Коммерческое предложение</p>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-semibold text-slate-900">{dateStr}</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Детали расчета / Внутренний</p>
            </div>
          </div>
        </div>

        {/* 1. COMMERCE SECTION */}
        <section className="mb-8">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#7D8A9E] mb-4 border-b border-gray-100 pb-2">1. Коммерческий блок</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-[#7D8A9E] font-bold mb-1">Марка стали</p>
              <p className="font-semibold text-[13px]">{formattedGrade || "Не выбрана"} <span className="text-[#A0AABF] font-normal">{gost ? `(${gost})` : ""}</span></p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-[#7D8A9E] font-bold mb-1">Готовый профиль</p>
              <p className="font-semibold text-[13px]">{profileTypeStr} {selectedTarget || "?"} мм <span className="text-[#A0AABF] font-normal">({profileGost})</span></p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-[#7D8A9E] font-bold mb-1">Длина прутка</p>
              <p className="font-semibold text-[13px]">{lengthLabel}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-[#7D8A9E] font-bold mb-1">Объем заказа</p>
              <p className="font-semibold text-[13px]">{orderWeight || "?"} <span className="text-[#A0AABF] font-normal">тн</span></p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-8 mt-5 pt-4">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-[#7D8A9E] font-bold mb-1">Стоимость 1 тн (без НДС)</p>
              <p className="font-bold text-lg text-slate-800">{formatCurrency(sellPriceNum)} <span className="text-xs text-[#A0AABF] font-normal">руб.</span></p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-[#111827] font-bold mb-1">Итого за заказ (без НДС)</p>
              <p className="font-bold text-2xl text-slate-900">{formatCurrency(sellTotal)} <span className="text-sm text-[#A0AABF] font-normal">руб.</span></p>
            </div>
          </div>
        </section>

        {/* 2 & 3. PRODUCTION & SUPPLY SECTION */}
        <section className="mb-8">
          <div className="grid grid-cols-2 gap-8">
            {/* PRODUCTION */}
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#7D8A9E] mb-4 border-b border-gray-100 pb-2">2. Производственный блок</h2>
              <div className="space-y-[10px] text-[12px] font-medium text-slate-600">
                <div className="flex justify-between">
                  <span>Заготовка длина:</span>
                  <span className="font-bold text-slate-900">{displayedRawLength || "?"} мм</span>
                </div>
                <div className="flex justify-between">
                  <span>Диаметр заготовки:</span>
                  <span className="font-bold text-slate-900">{selectedRaw || "?"} мм</span>
                </div>
                <div className="flex justify-between">
                  <span>Вытяжка (коэф. &times;{currentDrawCoef ? currentDrawCoef.toFixed(3) : "?"}):</span>
                  <span className="font-bold text-slate-900">{displayedTargetLength || "?"} мм</span>
                </div>
                <div className="flex justify-between">
                  <span>Тех. концы:</span>
                  <span className="font-bold text-slate-900">{techEndsMm || "0"} мм</span>
                </div>
                <div className="flex justify-between">
                  <span>Полезная длина:</span>
                  <span className="font-bold text-slate-900">{lengthAfterTechEnds || "0"} мм</span>
                </div>
                <div className="flex gap-2 pt-3">
                  <div className="flex-1 bg-[#F5F7FA] px-3 py-2 rounded-t-lg">
                    <p className="text-[8px] uppercase font-bold text-[#7D8A9E] mb-1">Лом</p>
                    <p className="font-bold text-[13px] text-slate-900">{totalTechKg} <span className="text-[9px] font-normal text-[#A0AABF]">кг</span></p>
                  </div>
                  <div className="flex-1 bg-[#F5F7FA] px-3 py-2 rounded-t-lg">
                    <p className="text-[8px] uppercase font-bold text-[#7D8A9E] mb-1">Деловые остатки</p>
                    <p className="font-bold text-[13px] text-slate-900">{totalRemKg} <span className="text-[9px] font-normal text-[#A0AABF]">кг</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* SUPPLY */}
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#7D8A9E] mb-4 border-b border-gray-100 pb-2">3. Блок снабжения</h2>
              <div className="bg-[#181D27] text-white p-5 rounded-[12px] shadow-sm">
                <p className="text-[9px] uppercase font-bold text-[#A0AABF] tracking-widest mb-1">Сырье к закупке</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-[28px] font-bold leading-none">{requiredWeight || "?"}</span>
                  <span className="text-[11px] text-[#A0AABF] font-medium">тонн</span>
                </div>
                <div className="bg-white/5 rounded-md px-3 py-2.5 text-[12px] font-medium">
                  Круг г/к ф<span className="font-bold">{selectedRaw || "?"}</span> мм {formattedGrade} <span className="text-white/60">({gost})</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. ECONOMY SECTION */}
        <section className="flex-1">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#7D8A9E] mb-4 border-b border-gray-100 pb-2">4. Экономика (на 1 тонну)</h2>
          
          <div className="space-y-[12px] text-[12px]">
            <div className="flex justify-between items-baseline border-b border-gray-50 pb-[6px]">
               <span className="text-[#64748B] font-medium">Продажная цена (за 1 т)</span>
               <span className="font-bold text-[14px]">{formatCurrency(sellPriceNum)} <span className="text-[10px] font-normal text-slate-400">руб.</span></span>
            </div>
            <div className="flex justify-between items-baseline border-b border-gray-50 pb-[6px]">
               <span className="text-[#EF4444] font-medium">- Стоимость заготовки</span>
               <span className="font-bold text-[14px]">{formatCurrency(rawPriceNum)} <span className="text-[10px] font-normal text-slate-400">руб.</span></span>
            </div>

            {commercialStats && advancedRemnantStats && rawPriceNum > 0 && (
              <>
                <div className="flex flex-col gap-1.5 border-b border-gray-50 pb-[6px]">
                   <div className="flex justify-between items-baseline">
                     <span className="text-[#EF4444] font-medium">- Затраты на отходы (1 т)</span>
                     <span className="font-bold text-[14px]">{formatCurrency(commercialStats.lossesPerTon)} <span className="text-[10px] font-normal text-slate-400">руб.</span></span>
                   </div>
                   <div className="flex justify-start gap-6 text-[10px] text-[#94A3B8]">
                      <div>Лом ({(advancedRemnantStats.techTonsPerTon * 1000).toFixed(1)} кг): <span className="font-medium text-[#475569]">{formatCurrency(advancedRemnantStats.techValuePerTon)}</span> руб.</div>
                      <div>Остаток ({(advancedRemnantStats.remTonsPerTon * 1000).toFixed(1)} кг): <span className="font-medium text-[#475569]">{formatCurrency(advancedRemnantStats.remValuePerTon)}</span> руб.</div>
                   </div>
                </div>

                <div className="flex flex-col gap-1.5 pb-[6px]">
                   <div className="flex justify-between items-baseline">
                     <span className="text-[#10B981] font-medium">+ Возврат лома и остатков</span>
                     <span className="font-bold text-[14px]">{formatCurrency(commercialStats.scrapRevenuePerTon)} <span className="text-[10px] font-normal text-slate-400">руб.</span></span>
                   </div>
                   <div className="flex justify-start gap-6 text-[10px] text-[#94A3B8]">
                      <div>Лом (продажа): <span className="font-medium text-[#475569]">{formatCurrency(advancedRemnantStats.techScrapRevenuePerTon)}</span> руб.</div>
                      <div>Остаток (продажа): <span className="font-medium text-[#475569]">{formatCurrency(advancedRemnantStats.remnantRevenuePerTon)}</span> руб.</div>
                   </div>
                </div>

                <div className="mt-4 bg-[#F8FAFC] rounded-[12px] px-5 py-4 flex justify-between items-center border border-gray-100">
                   <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-[#64748B]">Маржа (1 тн, без НДС)</p>
                   </div>
                   <div className="text-right">
                      <p className="font-bold text-[20px] text-[#0F172A]">
                        {commercialStats.isPositive ? "+" : ""}{formatCurrency(commercialStats.profitPerTon)}
                        <span className="text-[13px] font-semibold text-[#64748B] ml-2">({commercialStats.isPositive ? "+" : ""}{commercialStats.marginPercent.toFixed(1)}%)</span>
                      </p>
                   </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* FOOTER */}
        <div className="mt-auto pb-10 flex justify-between items-end border-t border-gray-100 pt-6">
           <div className="space-y-1">
             <p className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-widest">Ответственный менеджер</p>
             <div className="w-[200px] border-b border-[#CBD5E1] pt-8"></div>
           </div>
           
           <div className="text-right flex flex-col items-end">
             <p className="text-[9px] text-[#94A3B8] mb-3">Сгенерировано в системе расчета (AI Studio)</p>
             <div className="w-40 h-16 border border-dashed border-[#CBD5E1] rounded-lg flex items-center justify-center text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest bg-white">Место печати</div>
           </div>
        </div>
      </div>
    </div>
  );
}
