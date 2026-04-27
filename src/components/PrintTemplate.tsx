import { formatCurrency } from "../lib/constants";

interface PrintTemplateProps {
  printText: string;
  reportData: any;
  savedCalculations?: any[];
}

export function PrintTemplate({ reportData, savedCalculations = [] }: PrintTemplateProps) {
  const itemsToPrint = savedCalculations.length > 0 ? savedCalculations : [reportData];

  return (
    <div className="hidden print:block bg-white w-full max-w-[210mm] mx-auto text-black font-serif text-[12px] leading-tight" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      
      {/* HEADER */}
      <div className="text-center mb-6 pt-4">
        <h1 className="text-lg font-bold uppercase tracking-tight">ООО «ЗМК АРСЕНАЛ»</h1>
        <p className="text-sm font-bold mt-1">{savedCalculations.length > 0 ? "Сохраненные детали расчета" : "Детали расчета"}</p>
        <p className="text-[11px] mt-1 italic text-gray-700">Внутренний документ</p>
      </div>

      <div className="px-8 pb-8 space-y-8">
        
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

          return (
            <section key={index} className="border-b border-gray-300 pb-6 mb-6 last:border-0">
              <h2 className="text-[13px] font-bold border-b border-black mb-2 uppercase">Коммерческий блок (от {dateStr})</h2>
              <table className="w-full text-[12px] border-collapse border border-black mb-2">
                <tbody>
                  <tr>
                    <td className="border border-black p-1.5 font-bold w-[25%] bg-gray-50">Марка стали:</td>
                    <td className="border border-black p-1.5 w-[25%]">{formattedGrade || "Не выбрана"} {gost ? `(${gost})` : ""}</td>
                    <td className="border border-black p-1.5 font-bold w-[25%] bg-gray-50">Профиль:</td>
                    <td className="border border-black p-1.5 w-[25%]">{profileTypeStr} {data.selectedTarget || "?"} мм ({profileGost})</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5 font-bold bg-gray-50">Длина:</td>
                    <td className="border border-black p-1.5">{orderedLength || "?"} мм</td>
                    <td className="border border-black p-1.5 font-bold bg-gray-50">Объем заказа:</td>
                    <td className="border border-black p-1.5">{orderWeightStr} тонн</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5 font-bold bg-gray-50">Цена за 1 тн продукции без НДС:</td>
                    <td className="border border-black p-1.5">{formatCurrency(sellPriceNum)} руб.</td>
                    <td className="border border-black p-1.5 font-bold bg-gray-50">Цена за весь заказ без НДС:</td>
                    <td className="border border-black p-1.5 font-bold">{formatCurrency(sellTotal)} руб.</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5 font-bold bg-gray-50" colSpan={2}></td>
                    <td className="border border-black p-1.5 font-bold bg-gray-50">Цена за весь заказ с НДС (22%):</td>
                    <td className="border border-black p-1.5 font-bold">{formatCurrency(sellTotal * 1.22)} руб.</td>
                  </tr>
                  {commercialStats && (
                    <tr>
                      <td className="border border-black p-1.5 font-bold bg-gray-50" colSpan={2}></td>
                      <td className="border border-black p-1.5 font-bold bg-gray-50 uppercase text-[11px]">Маржа (1 тн, без НДС):</td>
                      <td className="border border-black p-1.5 font-bold">
                        {commercialStats.isPositive ? "+" : ""}{formatCurrency(commercialStats.profitPerTon)} руб. ({commercialStats.isPositive ? "+" : ""}{commercialStats.marginPercent.toFixed(1)}%)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          );
        })}

        {/* FOOTER */}
        <div className="mt-10 flex justify-between items-end pt-4">
           <div className="w-[60%]">
             <div className="flex items-end gap-2 mb-2">
                <span className="font-bold text-[11px] whitespace-nowrap">Ответственный менеджер:</span>
                <div className="border-b border-black flex-1 border-dashed"></div>
                <span className="text-[11px] w-24 text-center">/ ФИО /</span>
             </div>
             <div className="flex items-end gap-2">
                <span className="font-bold text-[11px] whitespace-nowrap">Согласовано (Руководитель):</span>
                <div className="border-b border-black flex-1 border-dashed"></div>
                <span className="text-[11px] w-24 text-center">/ ФИО /</span>
             </div>
           </div>
           
           <div className="text-right flex flex-col items-end">
             <p className="text-[9px] text-gray-500 mb-2">Сформировано в системе (AI Studio)</p>
             <div className="w-24 h-24 border-2 border-gray-300 rounded-full flex items-center justify-center text-[10px] text-gray-400 font-bold -mr-4 rotate-12">
               М.П.
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
