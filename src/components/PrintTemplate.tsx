import { formatCurrency, getGostForGrade, getProfileGost, getLengthLabel } from "../lib/constants";

interface PrintTemplateProps {
  steelGrade: string;
  profileType: "round" | "hex";
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
  sellPrice: string | number;
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
  sellPrice,
}: PrintTemplateProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
  const gost = getGostForGrade(steelGrade);
  const profileGost = getProfileGost(profileType);
  const lengthLabel = getLengthLabel(orderedLength);

  return (
    <div id="print-content" className="hidden print:!block p-10 bg-white text-slate-900 font-sans mx-auto" style={{ maxWidth: "800px" }}>
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-900">ООО "ЗМК Арсенал"</h1>
          <p className="text-sm font-medium text-slate-500">Детали расчета заказа</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-900">{dateStr}</p>
          <p className="text-[10px] text-slate-400 font-mono mt-1">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12">
        {/* Left Column */}
        <div className="space-y-8">
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-1">Коммерческий блок</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Марка стали:</span>
                <span className="font-bold">{steelGrade || "—"} {gost && `(${gost})`}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Профиль:</span>
                <span className="font-bold">{profileType === "round" ? "Круг" : "Шестигранник"} {selectedTarget || "?"} мм ({profileGost})</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Длина:</span>
                <span className="font-bold">{lengthLabel} {orderedLength || "?"} мм</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Объем заказа:</span>
                <span className="font-bold">{orderWeight || "?"} тонн</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-1">Блок экономика</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Цена за 1 т (без НДС):</span>
                <span className="font-bold text-slate-900">{formatCurrency(sellPrice)} руб.</span>
              </div>
              {commercialStats && (
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-500 font-bold">Итого (без НДС):</span>
                  <span className="font-bold text-slate-900 text-lg">
                    {formatCurrency(commercialStats.sellTotal)} руб.
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-1">Производственный блок</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Диаметр заготовки:</span>
                <span className="font-bold">{selectedRaw || "?"} мм</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Тех. концы:</span>
                <span className="font-bold">{techEndsMm || "0.0"} мм</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Полезная длина:</span>
                <span className="font-bold text-slate-900">{lengthAfterTechEnds || "0.0"} мм</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-1">Блок снабжение</h2>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Вес заготовки</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{requiredWeight || "?"}</span>
                <span className="text-sm font-bold text-slate-400 tracking-tight">тонн</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">Заготовка: {selectedRaw || "?"} мм {profileGost}</p>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-24 pt-8 border-t border-slate-100 flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Ответственный менеджер</p>
          <div className="w-56 border-b border-slate-900 pt-8 mt-2"></div>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-300 italic mb-2">ООО "ЗМК Арсенал" — Сделано в AI Управлении</p>
          <div className="inline-block px-4 py-2 border-2 border-slate-100 rounded-lg text-[10px] font-bold text-slate-300 uppercase tracking-wide">
            Место печати
          </div>
        </div>
      </div>
    </div>
  );
}
