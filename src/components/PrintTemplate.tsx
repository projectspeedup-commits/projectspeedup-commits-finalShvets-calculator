import { formatCurrency } from "../lib/constants";

interface PrintTemplateProps {
  steelGrade: string;
  profileType: string;
  selectedTarget: string;
  selectedRaw: string;
  orderedLength: string;
  orderWeight: string;
  techEndsMm: string | number;
  frontCoef: string;
  backCoef: string;
  lengthAfterTechEnds: string | number;
  requiredWeight: string | number | null;
  commercialStats: any;
}

export function PrintTemplate({
  steelGrade,
  profileType,
  selectedTarget,
  selectedRaw,
  orderedLength,
  orderWeight,
  techEndsMm,
  frontCoef,
  backCoef,
  lengthAfterTechEnds,
  requiredWeight,
  commercialStats,
}: PrintTemplateProps) {
  return (
    <div className="hidden print:!block bg-white text-black p-10 font-sans mx-auto" style={{ maxWidth: "800px", fontFamily: '"Roboto", sans-serif' }}>
      <div className="border-b-4 border-slate-800 pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-normal text-slate-900 tracking-tight uppercase">Детали расчета</h1>
          <p className="text-xl font-bold text-slate-800 mt-2">ООО "ЗМК Арсенал"</p>
        </div>
        <div className="text-right text-slate-500 text-sm font-medium">
          Дата формирования:
          <br />
          <span className="text-slate-900 font-bold text-base">{new Date().toLocaleDateString("ru-RU")}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-10">
        <div className="pr-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Параметры заказа</h2>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-600">Марка:</span>
              <span className="font-bold text-slate-900">{steelGrade || "Не выбрана"}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-600">Профиль:</span>
              <span className="font-bold text-slate-900">
                {profileType === "round" ? "Круг" : "Шестигранник"} {selectedTarget || "?"} мм
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-600">Длина (отгрузка):</span>
              <span className="font-bold text-slate-900">{orderedLength || "?"} мм</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-600">Объем заказа:</span>
              <span className="font-bold text-slate-900">{orderWeight || "?"} тонн</span>
            </div>
          </div>
        </div>

        <div className="pl-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Технологии & Сырье</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-600">Тех. концы:</span>
              <div className="text-right">
                <span className="font-bold text-slate-900">{techEndsMm || "0.0"} мм</span>
                <div className="text-[10px] text-slate-500 uppercase mt-0.5">
                  Перед: {frontCoef}, Зад: {backCoef}
                </div>
              </div>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-600">Длина после удаления:</span>
              <span className="font-bold text-slate-900">{lengthAfterTechEnds || "0.0"} мм</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-600 font-bold">Сырье к закупке:</span>
              <span className="font-bold text-slate-800 text-right leading-tight">
                {requiredWeight || "?"} тонн <br />
                <span className="text-xs font-normal text-slate-500">(Заготовка {selectedRaw || "?"} мм)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {commercialStats && (
        <div className="bg-slate-50 p-8 rounded-[24px] border border-slate-200 mt-8">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-4">
            Коммерческое предложение
          </h2>
          <div className="space-y-6">
            <div className="flex justify-between items-center text-xl">
              <span className="text-slate-600">Сумма заказа (без НДС):</span>
              <span className="font-bold text-slate-900">{formatCurrency(commercialStats.sellTotal)} руб.</span>
            </div>
            <div className="flex justify-between items-center text-2xl border-t border-slate-300 pt-6 mt-2">
              <span className="font-bold text-slate-900">Итого к оплате (с НДС 22%):</span>
              <span className="font-bold text-slate-800">{formatCurrency(commercialStats.sellTotalVat)} руб.</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-20 pt-8 border-t border-slate-200 text-center text-slate-400 text-xs uppercase tracking-wider">
        Документ сгенерирован автоматически информационной системой ООО "ЗМК Арсенал"
      </div>
    </div>
  );
}
