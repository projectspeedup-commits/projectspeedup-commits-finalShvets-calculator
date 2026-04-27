import { formatInputValue } from "../lib/constants";

interface PrintTemplateProps {
  printText: string;
  steelGrade: string;
  selectedTarget: string;
  selectedRaw: string;
  orderWeight: string;
  currentAdminRawPrice: string;
  adminScrapPrice: string;
  adminRemnantPrice: string;
  gost: string;
}

export function PrintTemplate({ 
  printText, 
  steelGrade,
  selectedTarget,
  selectedRaw,
  orderWeight,
  currentAdminRawPrice,
  adminScrapPrice,
  adminRemnantPrice,
  gost
}: PrintTemplateProps) {
  let formattedGrade = steelGrade;
  if (steelGrade && !steelGrade.toLowerCase().startsWith('ст') && !steelGrade.toLowerCase().includes('а12')) {
    formattedGrade = `ст.${steelGrade}`;
  }

  return (
    <div className="hidden print:!block bg-[#F4F5F4] w-[210mm] mx-auto min-h-[297mm] p-8 font-sans" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      <div className="mx-auto w-full max-w-[170mm]">
        {/* TEXT CONTENT */}
        <div className="text-[13px] text-[#1A1C19] leading-[1.6] whitespace-pre-wrap font-medium">
          {printText.trim()}
        </div>

        {/* CARDS SECTION */}
        <div className="mt-8 bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-1.5">
               <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                 Марка стали <span className="lowercase font-normal opacity-70">({gost || "—"})</span>
               </label>
               <div className="bg-[#F0F4F4] text-slate-900 rounded-lg px-4 h-12 flex items-center font-semibold text-[15px]">
                 {formattedGrade || "—"}
               </div>
            </div>
            <div className="space-y-1.5">
               <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                 Готовый пруток
               </label>
               <div className="bg-[#F0F4F4] text-slate-900 rounded-lg px-4 h-12 flex items-center font-semibold text-[15px]">
                 {selectedTarget || "—"}
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-1.5">
               <label className="block text-[10px] font-bold text-[#4A6572] uppercase tracking-widest pl-1">
                 Заготовка
               </label>
               <div className="bg-[#F0F4F4] text-slate-900 rounded-lg px-4 h-12 flex items-center font-semibold text-[15px]">
                 {selectedRaw || "—"}
               </div>
            </div>
            <div className="space-y-1.5">
               <label className="block text-[10px] font-bold text-[#4A6572] uppercase tracking-widest pl-1">
                 Объем заказа
               </label>
               <div className="bg-[#F0F4F4] text-slate-900 rounded-lg px-4 h-12 flex items-center justify-between font-semibold text-[15px]">
                 <span>{orderWeight || "—"}</span>
                 {orderWeight && <span className="text-slate-500 text-[11px] font-bold">ТН</span>}
               </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col justify-between h-[64px]">
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Цена заготовки</span>
                 <div className="flex items-baseline justify-between">
                   <span className="font-bold text-slate-900 text-[13px]">{currentAdminRawPrice ? formatInputValue(currentAdminRawPrice) : '—'}</span>
                   <span className="text-[#4A6572] font-semibold text-[9px] ml-1">руб/т</span>
                 </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col justify-between h-[64px]">
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Цена лома</span>
                 <div className="flex items-baseline justify-between">
                   <span className="font-bold text-slate-900 text-[13px]">{adminScrapPrice ? formatInputValue(adminScrapPrice) : '—'}</span>
                   <span className="text-[#4A6572] font-semibold text-[9px] ml-1">руб/т</span>
                 </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col justify-between h-[64px]">
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Цена остатков</span>
                 <div className="flex items-baseline justify-between">
                   <span className="font-bold text-slate-900 text-[13px]">{adminRemnantPrice ? formatInputValue(adminRemnantPrice) : '—'}</span>
                   <span className="text-[#4A6572] font-semibold text-[9px] ml-1">руб/т</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
