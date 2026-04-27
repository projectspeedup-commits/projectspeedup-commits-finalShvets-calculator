import { formatCurrency } from "../lib/constants";

interface PrintTemplateProps {
  printText: string;
  reportData: any;
  savedCalculations?: any[];
}

export function PrintTemplate({ reportData, savedCalculations = [] }: PrintTemplateProps) {
  const itemsToPrint = savedCalculations.length > 0 ? savedCalculations : [reportData];

  return (
    <div className="hidden print:block bg-white w-full max-w-[210mm] mx-auto text-black font-sans text-[14px] leading-[1.6]" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      
      <div className="px-8 py-8 space-y-12">
        
        {itemsToPrint.map((data, index) => {
          const {
            dateStr,
            formattedGrade,
            gost,
            profileTypeStr,
            profileGost,
            orderedLength,
            sellPriceNum,
            sellTotal,
            commercialStats,
            orderWeightNum
          } = data;
          
          const orderWeightStr = data.orderWeight || data.requiredWeight || (orderWeightNum ? orderWeightNum.toString() : "?");
          const marginPrefix = commercialStats?.isPositive ? "+" : "";

          return (
            <div key={index} className="border-b border-gray-300 pb-8 mb-8 last:border-0 last:mb-0 last:pb-0">
              <h2 className="font-bold text-[16px] mb-3">Расчет (ООО «ЗМК Арсенал») - {dateStr}</h2>
              <div className="space-y-1.5">
                <div><span className="font-semibold">Марка стали:</span> {formattedGrade || "Не выбрана"} {gost ? `(${gost})` : ""}</div>
                <div><span className="font-semibold">Профиль:</span> {profileTypeStr} {data.selectedTarget || "?"} мм ({profileGost})</div>
                <div><span className="font-semibold">Длина:</span> {orderedLength || "?"} мм</div>
                <div><span className="font-semibold">Объем заказа:</span> {orderWeightStr} тонна</div>
                <div><span className="font-semibold">Цена за 1 тн продукции без НДС:</span> {formatCurrency(sellPriceNum)} руб.</div>
                <div><span className="font-semibold">Цена за весь заказ без НДС:</span> {formatCurrency(sellTotal)} руб.</div>
                <div><span className="font-semibold">Цена за весь заказ с НДС (22%):</span> {formatCurrency(sellTotal * 1.22)} руб.</div>
                {commercialStats && (
                  <div><span className="font-semibold">Маржа (1 тн, без НДС):</span> {marginPrefix}{formatCurrency(commercialStats.profitPerTon)} руб. ({marginPrefix}{commercialStats.marginPercent.toFixed(1)}%)</div>
                )}
              </div>
            </div>
          );
        })}

        {/* FOOTER */}
        <div className="mt-16 flex justify-between items-end pt-4" style={{ pageBreakInside: "avoid" }}>
           <div className="w-[60%]">
             <div className="flex items-end gap-2 mb-4">
                <span className="font-bold text-[13px] whitespace-nowrap">Ответственный менеджер:</span>
                <div className="border-b border-black flex-1 border-dashed"></div>
                <span className="text-[13px] w-24 text-center">/ ФИО /</span>
             </div>
             <div className="flex items-end gap-2">
                <span className="font-bold text-[13px] whitespace-nowrap">Согласовано (Руководитель):</span>
                <div className="border-b border-black flex-1 border-dashed"></div>
                <span className="text-[13px] w-24 text-center">/ ФИО /</span>
             </div>
           </div>
           
           <div className="text-right flex flex-col items-end">
             <div className="w-24 h-24 border-2 border-gray-400 rounded-full flex items-center justify-center text-[12px] text-gray-500 font-bold -mr-4 rotate-12">
               М.П.
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
