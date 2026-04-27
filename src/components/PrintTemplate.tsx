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

  return (
    <div className="hidden print:!block bg-white w-[210mm] mx-auto min-h-[297mm] font-sans text-slate-900" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      
      {/* HEADER */}
      <div className="pt-12 px-12 pb-6 border-b-2 border-slate-900">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">ЗМК Арсенал</h1>
            <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">Коммерческое предложение</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">{dateStr}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Детали расчета / Внутренний</p>
          </div>
        </div>
      </div>

      <div className="px-12 py-8 space-y-10">
        
        {/* COMMERCE SECTION */}
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-200 pb-2">1. Коммерческий блок</h2>
          <div className="grid grid-cols-2 gap-x-12 gap-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#4A6572] font-semibold mb-1">Марка стали</p>
              <p className="font-bold text-[15px]">{formattedGrade || "Не выбрана"} <span className="text-slate-400 font-normal">{gost ? `(${gost})` : ""}</span></p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#4A6572] font-semibold mb-1">Готовый профиль</p>
              <p className="font-bold text-[15px]">{profileTypeStr} {selectedTarget || "?"} мм <span className="text-slate-400 font-normal">({profileGost})</span></p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#4A6572] font-semibold mb-1">Длина прутка</p>
              <p className="font-bold text-[15px]">{lengthLabel}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#4A6572] font-semibold mb-1">Объем заказа</p>
              <p className="font-bold text-[15px]">{orderWeight || "?"} <span className="text-slate-400 font-normal">тн</span></p>
            </div>
            <div className="col-span-2 pt-4 flex gap-8 border-t border-slate-100">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Стоимость 1 тн (без НДС)</p>
                <p className="font-bold text-xl">{formatCurrency(sellPriceNum)} <span className="text-sm text-slate-400 font-normal">руб.</span></p>
              </div>
              <div className="pl-8 border-l border-slate-100">
                <p className="text-[10px] uppercase tracking-widest text-slate-900 font-bold mb-1">Итого за заказ (без НДС)</p>
                <p className="font-black text-2xl tracking-tight">{formatCurrency(sellTotal)} <span className="text-sm text-slate-400 font-normal">руб.</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCTION & SUPPLY SECTION */}
        <section>
          <div className="grid grid-cols-2 gap-12">
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-200 pb-2">2. Производственный блок</h2>
              <div className="space-y-3 text-[13px]">
                <div className="flex justify-between border-b border-slate-50 pb-1">
                  <span className="text-slate-500">Заготовка длина:</span>
                  <span className="font-bold">{displayedRawLength || "?"} мм</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1">
                  <span className="text-slate-500">Диаметр заготовки:</span>
                  <span className="font-bold">{selectedRaw || "?"} мм</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1">
                  <span className="text-slate-500">Вытяжка (коэф. &times;{currentDrawCoef ? currentDrawCoef.toFixed(3) : "?"}):</span>
                  <span className="font-bold">{displayedTargetLength || "?"} мм</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1">
                  <span className="text-slate-500">Тех. концы:</span>
                  <span className="font-bold">{techEndsMm || "0"} мм</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1">
                  <span className="text-slate-500">Полезная длина:</span>
                  <span className="font-bold">{lengthAfterTechEnds || "0"} мм</span>
                </div>
                <div className="flex gap-4 pt-2">
                  <div className="flex-1 bg-slate-50 p-2 rounded-lg">
                    <p className="text-[9px] uppercase font-bold text-slate-400 mb-1">Лом</p>
                    <p className="font-bold text-sm">{(techTons * 1000).toFixed(1)} <span className="text-[10px] font-normal text-slate-400">кг</span></p>
                  </div>
                  <div className="flex-1 bg-slate-50 p-2 rounded-lg">
                    <p className="text-[9px] uppercase font-bold text-slate-400 mb-1">Деловые остатки</p>
                    <p className="font-bold text-sm">{(remTons * 1000).toFixed(1)} <span className="text-[10px] font-normal text-slate-400">кг</span></p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-200 pb-2">3. Блок снабжения</h2>
              <div className="bg-slate-900 text-white p-5 rounded-2xl">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Сырье к закупке</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-black">{requiredWeight || "?"}</span>
                  <span className="text-sm font-bold text-slate-400">тонн</span>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-[13px] leading-relaxed">
                  Круг г/к ф<span className="font-bold">{selectedRaw || "?"}</span> мм {formattedGrade} ({gost})
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ECONOMY SECTION */}
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-200 pb-2">4. Экономика (на 1 тонну)</h2>
          
          <div className="flex justify-between items-end border-b border-slate-100 pb-3 mb-3">
             <span className="text-slate-500 text-[13px]">Продажная цена (за 1 т)</span>
             <span className="font-bold text-[15px]">{formatCurrency(sellPriceNum)} <span className="text-[11px] font-normal text-slate-400">руб.</span></span>
          </div>
          <div className="flex justify-between items-end border-b border-slate-100 pb-3 mb-3">
             <span className="text-red-500/70 font-medium text-[13px] mb-1">- Стоимость заготовки</span>
             <span className="font-bold text-[15px]">{formatCurrency(rawPriceNum)} <span className="text-[11px] font-normal text-slate-400">руб.</span></span>
          </div>

          {commercialStats && advancedRemnantStats && rawPriceNum > 0 && (
            <>
              <div className="flex flex-col gap-2 border-b border-slate-100 pb-3 mb-3">
                 <div className="flex justify-between items-end">
                   <span className="text-red-500/70 font-medium text-[13px]">- Затраты на отходы (1 т)</span>
                   <span className="font-bold text-[15px]">{formatCurrency(commercialStats.lossesPerTon)} <span className="text-[11px] font-normal text-slate-400">руб.</span></span>
                 </div>
                 <div className="pl-4 text-[11px] text-slate-500 grid grid-cols-2">
                    <div>Лом ({(advancedRemnantStats.techTonsPerTon * 1000).toFixed(1)} кг): <span className="font-semibold text-slate-700">{formatCurrency(advancedRemnantStats.techValuePerTon)}</span> руб.</div>
                    <div>Остаток ({(advancedRemnantStats.remTonsPerTon * 1000).toFixed(1)} кг): <span className="font-semibold text-slate-700">{formatCurrency(advancedRemnantStats.remValuePerTon)}</span> руб.</div>
                 </div>
              </div>

              <div className="flex flex-col gap-2 border-b border-slate-100 pb-3 mb-3">
                 <div className="flex justify-between items-end">
                   <span className="text-emerald-600/80 font-medium text-[13px]">+ Возврат лома и остатков</span>
                   <span className="font-bold text-[15px]">{formatCurrency(commercialStats.scrapRevenuePerTon)} <span className="text-[11px] font-normal text-slate-400">руб.</span></span>
                 </div>
                 <div className="pl-4 text-[11px] text-slate-500 grid grid-cols-2">
                    <div>Лом (продажа): <span className="font-semibold text-slate-700">{formatCurrency(advancedRemnantStats.techScrapRevenuePerTon)}</span> руб.</div>
                    <div>Остаток (продажа): <span className="font-semibold text-slate-700">{formatCurrency(advancedRemnantStats.remnantRevenuePerTon)}</span> руб.</div>
                 </div>
              </div>

              <div className="mt-6 bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-200">
                 <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#4A6572]">Маржа (1 тн, без НДС)</p>
                 </div>
                 <div className="text-right">
                    <p className="font-black text-2xl text-slate-900 tracking-tight">
                      {commercialStats.isPositive ? "+" : ""}{formatCurrency(commercialStats.profitPerTon)}
                      <span className="text-sm font-semibold text-slate-500 ml-2">({commercialStats.isPositive ? "+" : ""}{commercialStats.marginPercent.toFixed(1)}%)</span>
                    </p>
                 </div>
              </div>
            </>
          )}

        </section>

        {/* FOOTER */}
        <div className="pt-24 flex justify-between items-end">
           <div className="space-y-1">
             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Ответственный менеджер</p>
             <div className="w-64 border-b border-slate-400 pt-8"></div>
           </div>
           
           <div className="text-right flex flex-col items-end">
             <p className="text-[9px] text-slate-400 mb-3">Сгенерировано в системе расчета (AI Studio)</p>
             <div className="w-48 h-20 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">Место печати</div>
           </div>
        </div>

      </div>
    </div>
  );
}
