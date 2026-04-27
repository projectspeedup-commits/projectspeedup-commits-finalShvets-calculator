import { DEFAULT_STEEL_GRADES, formatCurrency, formatInputValue, getGostForGrade, getLengthLabel, getProfileGost, handleNumericInput, HEX_DATA, ROUND_DATA, TECH_COEFS_ROUND } from "../lib/constants";
import { AlertTriangle, ArrowRight, Briefcase, Calculator, Check, Circle, Copy, Hexagon, Info, LogOut, Package, Printer, RotateCcw, Ruler, Scale } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PrintTemplate } from "./PrintTemplate";

interface CalculatorAppProps {
  adminRawPrices: Record<string, string>;
  adminScrapPrice: string;
  adminRemnantPrice: string;
  customGrades: string[];
  remnantPricing: Record<string, { round: string; hex: string }>;
  onLogout: () => void;
  isCloudActive: boolean;
}

export function CalculatorApp({
  adminRawPrices,
  adminScrapPrice,
  adminRemnantPrice,
  customGrades,
  remnantPricing,
  onLogout,
  isCloudActive,
}: CalculatorAppProps) {
  const [profileType, setProfileType] = useState<"round" | "hex">("round");
  const [steelGrade, setSteelGrade] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [selectedRaw, setSelectedRaw] = useState("");
  const [orderWeight, setOrderWeight] = useState("");

  const [lengthInput, setLengthInput] = useState({ value: "6000", source: "raw" });
  const [orderedLength, setOrderedLength] = useState("6000");

  const [frontCoef, setFrontCoef] = useState("1.027");
  const [backCoef, setBackCoef] = useState("1.003");

  const [sellPrice, setSellPrice] = useState("");

  const [isCopied, setIsCopied] = useState(false);

  const activeData = profileType === "round" ? ROUND_DATA : HEX_DATA;
  const allGrades = useMemo(() => [...DEFAULT_STEEL_GRADES, ...(customGrades || [])], [customGrades]);

  const currentAdminRawPrice = useMemo(() => {
    return steelGrade && adminRawPrices ? adminRawPrices[steelGrade] || "" : "";
  }, [steelGrade, adminRawPrices]);

  const currentRemnantPricingRule = useMemo(() => {
    if (!steelGrade) return "remnant";
    return remnantPricing && remnantPricing[steelGrade] && remnantPricing[steelGrade][profileType]
      ? remnantPricing[steelGrade][profileType]
      : "remnant";
  }, [steelGrade, profileType, remnantPricing]);

  const effectiveRemnantPrice = useMemo(() => {
    return currentRemnantPricingRule === "scrap" ? adminScrapPrice : adminRemnantPrice;
  }, [currentRemnantPricingRule, adminScrapPrice, adminRemnantPrice]);

  const targetOptions = useMemo(() => {
    const targets = activeData.map((item) => item.target);
    return [...new Set(targets)].sort((a, b) => a - b);
  }, [activeData]);

  const rawOptions = useMemo(() => {
    if (!selectedTarget) return [];
    return activeData
      .filter((item) => item.target === Number(selectedTarget) && item.raw > item.target)
      .map((item) => item.raw)
      .sort((a, b) => a - b);
  }, [selectedTarget, activeData]);

  const currentCoefficient = useMemo(() => {
    if (!selectedTarget || !selectedRaw) return null;
    const match = activeData.find(
      (item) => item.target === Number(selectedTarget) && item.raw === Number(selectedRaw)
    );
    return match ? match.coef : null;
  }, [selectedTarget, selectedRaw, activeData]);

  useEffect(() => {
    if (selectedTarget && selectedRaw) {
      if (profileType === "round") {
        const target = Number(selectedTarget);
        const key = `${selectedTarget}_${selectedRaw}`;

        if (TECH_COEFS_ROUND[key]) {
          setFrontCoef(TECH_COEFS_ROUND[key][0].toString());
          setBackCoef(TECH_COEFS_ROUND[key][1].toString());
        } else if (target > 50) {
          let fCoef = 1.032;
          if (target > 50 && target <= 54) fCoef = 1.033;
          else if (target > 54 && target <= 58) fCoef = 1.034;
          else if (target > 58) fCoef = 1.035;

          setFrontCoef(fCoef.toFixed(3));
          setBackCoef("1.003");
        } else {
          setFrontCoef("1.027");
          setBackCoef("1.003");
        }
      } else {
        setFrontCoef("1.030");
        setBackCoef("1.003");
      }
    }
  }, [selectedTarget, selectedRaw, profileType]);

  useEffect(() => {
    setSelectedTarget("");
    setSelectedRaw("");
  }, [profileType]);

  useEffect(() => {
    if (rawOptions.length === 1) {
      setSelectedRaw(rawOptions[0].toString());
    } else if (rawOptions.length > 0 && !rawOptions.includes(Number(selectedRaw))) {
      setSelectedRaw("");
    }
  }, [selectedTarget, rawOptions]);

  const currentDrawCoef = useMemo(() => {
    if (!selectedTarget || !selectedRaw) return null;
    if (profileType === "round") {
      return Math.pow(Number(selectedRaw), 2) / Math.pow(Number(selectedTarget), 2);
    } else {
      return Number(selectedTarget) === 48 && Number(selectedRaw) === 56 ? 1.22 : 1.23;
    }
  }, [selectedTarget, selectedRaw, profileType]);

  const displayedRawLength =
    lengthInput.source === "raw"
      ? lengthInput.value
      : lengthInput.value && currentDrawCoef
      ? (Number(lengthInput.value) / currentDrawCoef).toFixed(1)
      : "";

  const displayedTargetLength =
    lengthInput.source === "target"
      ? lengthInput.value
      : lengthInput.value && currentDrawCoef
      ? (Number(lengthInput.value) * currentDrawCoef).toFixed(1)
      : "";

  const totalTechCoef = useMemo(() => {
    const f = Number(frontCoef) || 1;
    const b = Number(backCoef) || 1;
    return f * b;
  }, [frontCoef, backCoef]);

  const lengthAfterTechEnds = useMemo(() => {
    const draw = Number(displayedTargetLength);
    if (!isNaN(draw) && draw > 0 && totalTechCoef > 0) {
      return (draw / totalTechCoef).toFixed(1);
    }
    return "";
  }, [displayedTargetLength, totalTechCoef]);

  const techEndsMm = useMemo(() => {
    const draw = Number(displayedTargetLength);
    const after = Number(lengthAfterTechEnds);
    if (!isNaN(draw) && !isNaN(after) && draw > after) {
      return (draw - after).toFixed(1);
    }
    return "";
  }, [displayedTargetLength, lengthAfterTechEnds]);

  const piecesPerBar = useMemo(() => {
    if (lengthAfterTechEnds && orderedLength) {
      const usable = Number(lengthAfterTechEnds);
      const order = Number(orderedLength);
      return order > 0 && usable >= order ? Math.floor(usable / order) : 0;
    }
    return 0;
  }, [lengthAfterTechEnds, orderedLength]);

  const remnantLength = useMemo(() => {
    if (lengthAfterTechEnds && orderedLength) {
      const usable = Number(lengthAfterTechEnds);
      const order = Number(orderedLength);
      if (isNaN(usable) || isNaN(order)) return "";
      if (order > usable) return (usable - order).toFixed(1);
      return (usable - order * piecesPerBar).toFixed(1);
    }
    return "";
  }, [lengthAfterTechEnds, orderedLength, piecesPerBar]);

  const optimalLengths = useMemo(() => {
    if (!lengthAfterTechEnds) return [];
    const target = Number(lengthAfterTechEnds);
    if (isNaN(target) || target <= 0) return [];

    const options = [];
    for (let i = 1; i <= 20; i++) {
      const optLen = Math.floor(target / i) - 5;
      if (optLen >= 2500 && optLen <= 6500) {
        options.push({ pieces: i, length: optLen });
      }
    }

    const currentOrder = Number(orderedLength);
    if (!isNaN(currentOrder) && currentOrder > 0) {
      options.sort((a, b) => Math.abs(a.length - currentOrder) - Math.abs(b.length - currentOrder));
    }

    return options.slice(0, 4);
  }, [lengthAfterTechEnds, orderedLength]);

  const requiredWeight = useMemo(() => {
    if (!orderWeight || !currentCoefficient) return null;
    const val = Number(orderWeight) * currentCoefficient;
    return isNaN(val) ? null : val.toFixed(2);
  }, [orderWeight, currentCoefficient]);

  const orderedBarWeight = useMemo(() => {
    if (!orderedLength || Number(orderedLength) <= 0 || !selectedTarget) return null;
    const lengthMm = Number(orderedLength);
    const sizeMm = Number(selectedTarget);
    const area =
      profileType === "round"
        ? (Math.PI * Math.pow(sizeMm, 2)) / 4
        : (Math.sqrt(3) / 2) * Math.pow(sizeMm, 2);
    const weightKg = area * lengthMm * 0.00000785;
    return { tons: (weightKg / 1000).toFixed(5), kg: weightKg.toFixed(2) };
  }, [orderedLength, selectedTarget, profileType]);

  const piecesPerTon = useMemo(() => {
    if (!orderedBarWeight || Number(orderedBarWeight.kg) === 0) return 0;
    return Math.floor(1000 / Number(orderedBarWeight.kg));
  }, [orderedBarWeight]);

  const totalPiecesInOrder = useMemo(() => {
    if (!orderWeight || !orderedBarWeight || Number(orderedBarWeight.kg) === 0) return 0;
    return Math.floor((Number(orderWeight) * 1000) / Number(orderedBarWeight.kg));
  }, [orderWeight, orderedBarWeight]);

  const remnantWeight = useMemo(() => {
    if (!remnantLength || Number(remnantLength) <= 0 || !selectedTarget) return null;
    const lengthMm = Number(remnantLength);
    const sizeMm = Number(selectedTarget);
    const area =
      profileType === "round"
        ? (Math.PI * Math.pow(sizeMm, 2)) / 4
        : (Math.sqrt(3) / 2) * Math.pow(sizeMm, 2);
    const weightKg = area * lengthMm * 0.00000785;
    return { tons: (weightKg / 1000).toFixed(5), kg: weightKg.toFixed(2) };
  }, [remnantLength, selectedTarget, profileType]);

  const remnantValue = useMemo(() => {
    if (!remnantWeight || !effectiveRemnantPrice) return null;
    const val = Number(remnantWeight.tons) * Number(effectiveRemnantPrice);
    return isNaN(val) ? null : val.toFixed(2);
  }, [remnantWeight, effectiveRemnantPrice]);

  const advancedRemnantStats = useMemo(() => {
    const hasRemnant =
      remnantLength && Number(remnantLength) > 0 && orderedLength && Number(orderedLength) > 0 && piecesPerBar > 0;
    const hasTechScrap = techEndsMm && Number(techEndsMm) > 0;

    if (!hasRemnant && !hasTechScrap) return null;

    const productMm = orderedLength && piecesPerBar > 0 ? Number(orderedLength) * piecesPerBar : 0;
    if (productMm === 0) return null;

    const rawRemMm = hasRemnant ? Number(remnantLength) : 0;
    const rawTechMm = hasTechScrap ? Number(techEndsMm) : 0;

    const rawRemRatio = rawRemMm / productMm;
    const rawTechRatio = rawTechMm / productMm;
    const totalRatio = rawRemRatio + rawTechRatio;

    const remRatio = rawRemRatio;
    const techRatio = rawTechRatio;

    const kgPerTon = totalRatio * 1000;
    const tonsPerTon = totalRatio;
    const valuePerTon = currentAdminRawPrice ? totalRatio * Number(currentAdminRawPrice) : 0;

    const techValuePerTon = currentAdminRawPrice ? techRatio * Number(currentAdminRawPrice) : 0;
    const remValuePerTon = currentAdminRawPrice ? remRatio * Number(currentAdminRawPrice) : 0;

    const remnantRevenuePerTon = remRatio * Number(effectiveRemnantPrice || 0);
    const techScrapRevenuePerTon = techRatio * Number(adminScrapPrice || 0);
    const revenuePerTon = remnantRevenuePerTon + techScrapRevenuePerTon;

    let orderScrapTons = 0,
      orderScrapValue = null,
      orderRevenue = 0;
    let orderTechTons = 0,
      orderRemTons = 0;
    let orderTechValue = null,
      orderRemValue = null;
    let orderTechRevenue = 0,
      orderRemRevenue = 0;

    if (orderWeight && Number(orderWeight) > 0) {
      const w = Number(orderWeight);
      orderScrapTons = totalRatio * w;
      orderTechTons = techRatio * w;
      orderRemTons = remRatio * w;

      if (currentAdminRawPrice) {
        orderScrapValue = orderScrapTons * Number(currentAdminRawPrice);
        orderTechValue = orderTechTons * Number(currentAdminRawPrice);
        orderRemValue = orderRemTons * Number(currentAdminRawPrice);
      }

      orderTechRevenue = techScrapRevenuePerTon * w;
      orderRemRevenue = remnantRevenuePerTon * w;
      orderRevenue = revenuePerTon * w;
    }

    return {
      kgPerTon: kgPerTon.toFixed(1),
      tonsPerTon: tonsPerTon.toFixed(3),
      techTonsPerTon: techRatio,
      remTonsPerTon: remRatio,
      valuePerTon: valuePerTon !== null ? valuePerTon.toFixed(2) : null,
      techValuePerTon,
      remValuePerTon,
      revenuePerTon,
      techScrapRevenuePerTon,
      remnantRevenuePerTon,

      orderScrapTons: orderScrapTons.toFixed(3),
      orderTechTons,
      orderRemTons,
      orderScrapValue: orderScrapValue !== null ? orderScrapValue.toFixed(2) : null,
      orderTechValue,
      orderRemValue,
      orderRevenue,
      orderTechRevenue,
      orderRemRevenue,
    };
  }, [remnantLength, orderedLength, currentAdminRawPrice, adminScrapPrice, effectiveRemnantPrice, orderWeight, piecesPerBar, techEndsMm]);

  const commercialStats = useMemo(() => {
    if (!sellPrice || !currentAdminRawPrice || !orderWeight) return null;
    const sPrice = Number(sellPrice);
    const rPrice = Number(currentAdminRawPrice);
    const weight = Number(orderWeight);
    if (isNaN(sPrice) || isNaN(rPrice) || isNaN(weight)) return null;

    const lossesPerTon = advancedRemnantStats && advancedRemnantStats.valuePerTon ? Number(advancedRemnantStats.valuePerTon) : 0;
    const scrapRevenuePerTon = advancedRemnantStats && advancedRemnantStats.revenuePerTon ? Number(advancedRemnantStats.revenuePerTon) : 0;

    const netLossesPerTon = lossesPerTon - scrapRevenuePerTon;
    const profitPerTon = sPrice - rPrice - netLossesPerTon;
    const profitTotal = profitPerTon * weight;

    const marginPercent = sPrice > 0 ? (profitPerTon / sPrice) * 100 : 0;

    return {
      lossesPerTon,
      scrapRevenuePerTon,
      netLossesPerTon,
      profitPerTon,
      profitTotal,
      marginPercent,
      sellTotal: sPrice * weight,
      sellTotalVat: sPrice * weight * 1.22,
      rawTotal: rPrice * weight,
      lossesTotal: lossesPerTon * weight,
      scrapRevenueTotal: advancedRemnantStats ? advancedRemnantStats.orderRevenue : 0,
      netLossesTotal: netLossesPerTon * weight,
      isPositive: profitTotal >= 0,
    };
  }, [sellPrice, currentAdminRawPrice, adminScrapPrice, effectiveRemnantPrice, orderWeight, advancedRemnantStats]);

  const handleReset = () => {
    setProfileType("round");
    setSteelGrade("");
    setSelectedTarget("");
    setSelectedRaw("");
    setOrderWeight("");
    setLengthInput({ value: "6000", source: "raw" });
    setOrderedLength("6000");
    setSellPrice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrint = () => {
    window.print();
  };

  const reportText = useMemo(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
    const gost = getGostForGrade(steelGrade);
    const profileGost = getProfileGost(profileType);
    const lengthLabel = getLengthLabel(orderedLength);
    const rawPriceNum = Number(currentAdminRawPrice) || 0;
    const sellPriceNum = Number(sellPrice) || 0;
    const orderWeightNum = Number(orderWeight) || 0;
    const scrapPriceNum = Number(adminScrapPrice) || 0;
    const remnantPriceNum = Number(effectiveRemnantPrice) || 0;

    let formattedGrade = steelGrade;
    if (steelGrade && !steelGrade.toLowerCase().startsWith('ст') && !steelGrade.toLowerCase().includes('а12')) {
      formattedGrade = `ст.${steelGrade}`;
    }

    let text = `Детали расчета (ООО "ЗМК Арсенал") - ${dateStr}\n`;
    text += `-----------------------------------\n`;
    text += `Коммерческий блок:\n`;
    text += `Марка стали: ${formattedGrade || "Не выбрана"}${gost ? ` (${gost})` : ""}\n`;
    text += `Профиль: ${profileType === "round" ? "Круг" : "Шестигранник"} ${selectedTarget || "?"} мм (${profileGost})\n`;
    text += `Длина: ${lengthLabel}\n`;
    text += `Объем заказа: ${orderWeight || "?"} тонн\n`;
    text += `Цена за 1 тн продукции без НДС: ${formatCurrency(sellPriceNum)} руб.\n`;
    text += `Цена за весь заказ без НДС: ${formatCurrency(sellPriceNum * orderWeightNum)} руб.\n`;
    text += `-----------------------------------\n`;
    text += `Производственный блок:\n`;
    text += `Заготовка длина: ${displayedRawLength || "?"} мм\n`;
    text += `Диаметр заготовки: ${selectedRaw || "?"} мм\n`;
    text += `Вытяжка после волочения: ${displayedTargetLength || "?"} мм. (коф.- ${currentDrawCoef ? currentDrawCoef.toFixed(3) : "?"})\n`;
    text += `Тех. концы: ${techEndsMm || "0.0"} мм (Перед: ${frontCoef}, Зад: ${backCoef})\n`;
    text += `Длина после удаления: = ${lengthAfterTechEnds || "0.0"} мм\n`;
    
    if (advancedRemnantStats) {
      const techTons = advancedRemnantStats.orderTechTons || 0;
      const remTons = advancedRemnantStats.orderRemTons || 0;
      text += `Лом количество: ${(techTons * 1000).toFixed(1)} кг. (${techTons.toFixed(3)} тн)\n`;
      text += `Деловые остатки: ${(remTons * 1000).toFixed(1)} кг. (${remTons.toFixed(3)} тн)\n`;
    } else {
      text += `Лом количество: ? кг.\n`;
      text += `Деловые остатки: ? кг.\n`;
    }
    text += `-----------------------------------\n`;
    text += `Блок снабжение:\n`;
    text += `Сырье к закупке: Круг г/к ф${selectedRaw || "?"} мм ${formattedGrade || "?"} (${gost || "?"}), количество ${requiredWeight || "?"} тн\n`;
    text += `-----------------------------------\n`;
    text += `Блок экономика:\n`;
    text += `Расчет на 1 тонну продукции\n`;
    text += `Продажная цена (за 1 т): ${formatCurrency(sellPriceNum)} руб.\n`;
    text += `- Стоимость заготовки: ${formatCurrency(rawPriceNum)} руб.\n`;
    
    if (commercialStats && advancedRemnantStats && rawPriceNum > 0) {
      text += `- Затраты на отходы (1 т): ${formatCurrency(commercialStats.lossesPerTon)} руб.\n`;
      text += `  Лом (${(advancedRemnantStats.techTonsPerTon * 1000).toFixed(1)} кг): ${formatCurrency(advancedRemnantStats.techValuePerTon)} руб.\n`;
      text += `  Деловой остаток (${(advancedRemnantStats.remTonsPerTon * 1000).toFixed(1)} кг): ${formatCurrency(advancedRemnantStats.remValuePerTon)} руб.\n`;
      
      text += `+ Возврат лома и остатков: ${formatCurrency(commercialStats.scrapRevenuePerTon)} руб.\n`;
      text += `  Лом (${(advancedRemnantStats.techTonsPerTon * 1000).toFixed(1)} кг × ${formatCurrency(scrapPriceNum)} руб/т): ${formatCurrency(advancedRemnantStats.techScrapRevenuePerTon)} руб.\n`;
      text += `  Деловой остаток (${(advancedRemnantStats.remTonsPerTon * 1000).toFixed(1)} кг × ${formatCurrency(remnantPriceNum)} руб/т): ${formatCurrency(advancedRemnantStats.remnantRevenuePerTon)} руб.\n`;
      
      const marginPrefix = commercialStats.isPositive ? "+" : "";
      text += `Маржа (1 тн, без НДС): ${marginPrefix}${formatCurrency(commercialStats.profitPerTon)} руб. (${marginPrefix}${commercialStats.marginPercent.toFixed(1)}%)\n`;
    }
    return text;
  }, [
    steelGrade, profileType, orderedLength, currentAdminRawPrice, sellPrice, orderWeight, 
    adminScrapPrice, effectiveRemnantPrice, selectedTarget, selectedRaw, displayedRawLength, 
    displayedTargetLength, currentDrawCoef, techEndsMm, frontCoef, backCoef, lengthAfterTechEnds, 
    requiredWeight, commercialStats, advancedRemnantStats
  ]);

  const handleCopy = () => {
    const textArea = document.createElement("textarea");
    textArea.value = reportText;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Ошибка копирования", err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F4] flex flex-col md:flex-row">
      <PrintTemplate printText={reportText} />

      {/* Mobile App Bar */}
      <div className="md:hidden fixed bottom-0 w-full bg-[#F0F4F4]/90 backdrop-blur-md border-t border-slate-200 flex justify-around items-center h-16 z-50 print-hide">
         <div className="flex flex-col items-center justify-center w-full h-full text-slate-800">
           <div className="bg-slate-200 px-4 py-1 rounded-full mb-1">
             <Calculator className="w-5 h-5" />
           </div>
           <span className="text-[10px] font-medium tracking-wide">Расчет</span>
         </div>
         <button onClick={onLogout} className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-slate-800">
           <div className="px-4 py-1 mb-1">
             <LogOut className="w-5 h-5" />
           </div>
           <span className="text-[10px] font-medium tracking-wide">Выйти</span>
         </button>
      </div>

      {/* Desktop Navigation Rail */}
      <div className="hidden md:flex flex-col w-[88px] bg-[#F0F4F4] border-r border-slate-200 items-center py-6 fixed h-full z-50 print-hide">
        <div className="flex flex-col items-center mb-8">
           <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-white mb-2 shadow-sm">
             <Calculator className="w-6 h-6 outline-none" />
           </div>
        </div>
        <div className="flex-1 flex flex-col gap-4 w-full px-3">
           <div className="w-full flex flex-col items-center justify-center py-4 text-slate-900">
             <div className="bg-slate-200 px-5 py-1.5 rounded-full mb-1.5">
               <Calculator className="w-6 h-6" strokeWidth={2} />
             </div>
             <span className="text-[11px] font-medium tracking-wide">Расчет</span>
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

      <div className="flex-1 md:ml-[88px] pb-24 md:pb-8 relative">
        <div className="max-w-[1024px] xl:max-w-[1440px] w-full px-4 sm:px-6 lg:px-8 mx-auto relative z-10">
          {/* HEADER */}
          <header className="sticky top-0 z-40 bg-[#F4F5F4]/90 backdrop-blur-md pt-4 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/50 mb-4 print-hide">
            <div className="flex flex-col">
              <h1 className="text-xl font-medium tracking-tight text-[#1A1C19]">
                Калькулятор <span className="hidden sm:inline">для менеджеров</span>
              </h1>
              <p className="text-[11px] font-medium text-slate-500 tracking-wide">ООО "ЗМК Арсенал"</p>
            </div>

            <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopy}
                className={`flex items-center justify-center gap-1.5 px-4 h-9 rounded-md transition-colors font-medium text-xs focus:outline-none ${
                  isCopied ? "bg-green-100 text-green-800" : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                }`}
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{isCopied ? "Скопировано" : "Копировать"}</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-1.5 px-4 h-9 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md transition-colors font-medium text-xs focus:outline-none"
              >
                <Printer className="w-4 h-4" />
                <span className="sm:hidden">Печать</span>
              </button>
              <button
                onClick={handleReset}
                className="flex items-center justify-center w-9 h-9 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md transition-colors font-medium focus:outline-none"
                title="Сбросить все"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start pb-8">
            <div className="space-y-4">
              <section className="bg-white rounded-[16px] border border-slate-200 shadow-sm p-4 sm:p-5 print-shadow-none">
            {/* Segmented Control */}
            <div className="bg-slate-100 p-1 rounded-xl flex max-w-[280px] mx-auto mb-6 print-hide">
              <button
                onClick={() => setProfileType("round")}
                className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs font-medium transition-all duration-200 focus:outline-none ${
                  profileType === "round" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <Circle className="w-3.5 h-3.5" /> Круг
              </button>
              <button
                onClick={() => setProfileType("hex")}
                className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs font-medium transition-all duration-200 focus:outline-none ${
                  profileType === "hex" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <Hexagon className="w-3.5 h-3.5" /> Шестигранник
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4 sm:gap-6 items-end">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider ml-1 border-b-0">Марка стали {steelGrade && <span className="lowercase font-normal opacity-70">({getGostForGrade(steelGrade)})</span>}</label>
                <div className="relative">
                  <select
                    value={steelGrade}
                    onChange={(e) => setSteelGrade(e.target.value)}
                    className="w-full bg-[#F0F4F4] border-b border-slate-400 rounded-t-lg px-3 h-10 text-sm font-medium appearance-none cursor-pointer focus:border-slate-800 focus:outline-none"
                  >
                    <option value="" disabled className="text-black">Выберите марку...</option>
                    {allGrades.map((grade) => (
                      <option key={grade} value={grade} className="text-black">{grade}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Готовый пруток</label>
                <div className="relative">
                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    className="w-full bg-[#F0F4F4] border-b border-slate-400 rounded-t-lg px-3 h-10 text-sm font-medium appearance-none cursor-pointer focus:border-slate-800 focus:outline-none"
                  >
                    <option value="" disabled className="text-black">Размер, мм...</option>
                    {targetOptions.map((size) => (
                      <option key={size} value={size} className="text-black">{size}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Заготовка</label>
                <div className="relative">
                  <select
                    value={selectedRaw}
                    onChange={(e) => setSelectedRaw(e.target.value)}
                    disabled={!selectedTarget}
                    className="w-full bg-[#F0F4F4] border-b border-slate-400 rounded-t-lg px-3 h-10 text-sm font-medium appearance-none disabled:opacity-50 cursor-pointer focus:border-slate-800 focus:outline-none transition-colors"
                  >
                    <option value="" disabled className="text-black">{selectedTarget ? "Выбор..." : "Ожидание"}</option>
                    {rawOptions.map((size) => (
                      <option key={size} value={size} className="text-black">{size}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Объем заказа</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Напр. 5"
                    value={orderWeight}
                    onChange={(e) => handleNumericInput(e, setOrderWeight)}
                    className="w-full bg-[#F0F4F4] border-b border-slate-400 rounded-t-lg pl-3 pr-8 h-10 text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus:border-slate-800"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">тн</span>
                </div>
              </div>
              
              <div className="col-span-1 sm:col-span-2 2xl:col-span-4 flex flex-col sm:flex-row gap-2 sm:gap-3 border-t border-slate-200 pt-4 mt-2">
                <div className="flex-1 flex justify-between items-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Цена заготовки</span>
                  <span className="font-medium text-slate-900 text-sm">{currentAdminRawPrice ? formatInputValue(currentAdminRawPrice) : '—'} <span className="text-slate-500 text-xs ml-1">руб/т</span></span>
                </div>
                <div className="flex-1 flex justify-between items-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Цена лома</span>
                  <span className="font-medium text-slate-900 text-sm">{formatInputValue(adminScrapPrice)} <span className="text-slate-500 text-xs ml-1">руб/т</span></span>
                </div>
                <div className="flex-1 flex justify-between items-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Цена остатков</span>
                  <span className="font-medium text-slate-900 text-sm">{formatInputValue(adminRemnantPrice)} <span className="text-slate-500 text-xs ml-1">руб/т</span></span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl p-4 sm:p-5 space-y-4 sm:space-y-6 print-shadow-none relative overflow-hidden border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3 relative z-10">
              <div className="p-2 bg-[#4A6572]/10 border border-[#4A6572]/20 text-[#4A6572] rounded-xl print-hide">
                <Ruler className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-medium tracking-tight text-[#1A1C19]">Раскрой и остатки</h2>
            </div>

            {/* Layout lengths */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 items-center bg-white border border-slate-200 p-4 rounded-[16px] relative z-10 shadow-sm">
              <div className="space-y-1.5 w-full">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Длина заготовки</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={displayedRawLength}
                    onChange={(e) => handleNumericInput(e, (val) => setLengthInput({ value: val, source: "raw" }))}
                    disabled={!selectedTarget}
                    className="w-full bg-[#F0F4F4] border-b border-slate-400 rounded-t-lg pl-3 pr-10 h-10 text-sm font-medium transition-all disabled:opacity-50 placeholder:text-slate-400 focus:border-slate-800 focus:bg-slate-200 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-xs">мм</span>
                </div>
              </div>

              <ArrowRight className="w-6 h-6 text-slate-400 hidden md:block shrink-0 mx-2" />

              <div className="space-y-1.5 w-full">
                <label className="block text-[10px] font-semibold text-slate-800 uppercase tracking-wider ml-1">Вытяжка (после волочения)</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={displayedTargetLength}
                    onChange={(e) => handleNumericInput(e, (val) => setLengthInput({ value: val, source: "target" }))}
                    disabled={!selectedTarget}
                    className="w-full bg-[#E8DEF8] border-b border-[#6750A4] text-slate-900 rounded-t-lg pl-3 pr-10 h-10 text-sm font-semibold transition-all disabled:opacity-50 focus:border-[#6750A4] focus:bg-[#E8DEF8]/80 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6750A4] font-medium text-xs">мм</span>
                </div>
              </div>
            </div>

            {/* Tech cuts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 2xl:grid-cols-4 gap-3 items-end bg-white border border-slate-200 p-4 rounded-[16px] relative z-10 shadow-sm">
              <div className="space-y-1 w-full">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase ml-1 tracking-wider">Обрезь перед</label>
                <input
                  type="text"
                  readOnly
                  value={formatInputValue(frontCoef)}
                  className="w-full bg-slate-100 text-slate-500 border border-slate-200 rounded-lg px-3 h-9 text-sm font-medium cursor-default focus:outline-none"
                />
              </div>

              <div className="space-y-1 w-full">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase ml-1 tracking-wider">Обрезь зад</label>
                <input
                  type="text"
                  readOnly
                  value={formatInputValue(backCoef)}
                  className="w-full bg-slate-100 text-slate-500 border border-slate-200 rounded-lg px-3 h-9 text-sm font-medium cursor-default focus:outline-none"
                />
              </div>

              <div className="space-y-1 w-full">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase ml-1 tracking-wider">Тех. концы</label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={techEndsMm}
                    className="w-full bg-slate-100 text-slate-500 border border-slate-200 rounded-lg pl-3 pr-8 h-9 text-sm font-medium cursor-default focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">мм</span>
                </div>
              </div>

              <div className="space-y-1 w-full col-span-2 sm:col-span-1 2xl:col-span-1">
                <label className="block text-[10px] font-semibold text-[#0D652D] uppercase ml-1 tracking-wider">Полезная длина</label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={lengthAfterTechEnds}
                    className="w-full bg-[#E6F4EA] border border-[#CEEAD6] text-[#0D652D] rounded-lg pl-3 pr-8 h-9 text-sm font-semibold cursor-default focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0D652D]/60 font-medium text-xs">мм</span>
                </div>
              </div>
            </div>

            {/* Ordered lengths */}
            <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-[16px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 shadow-sm">
              <div>
                <label className="block text-base font-medium text-slate-900 tracking-tight">Длина заказа</label>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Размер прутка в отгрузке</p>
              </div>
              <div className="relative w-full sm:w-1/3 shrink-0">
                <input
                  type="text"
                  inputMode="numeric"
                  value={orderedLength}
                  onChange={(e) => handleNumericInput(e, setOrderedLength)}
                  className="w-full bg-[#F0F4F4] border-b border-slate-400 text-slate-900 rounded-t-lg px-4 h-12 text-lg font-medium transition-all focus:border-slate-800 focus:bg-slate-200 focus:outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-xs">мм</span>
              </div>
            </div>

             {/* Optimal layout recommendation */}
            {optimalLengths.length > 0 && Number(lengthAfterTechEnds) > 0 && (
              <div className="bg-[#E8DEF8] border border-[#CAC4D0] rounded-[16px] p-4 print-hide relative z-10 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="p-2 bg-[#6750A4]/10 rounded-full shrink-0 hidden sm:flex items-center justify-center">
                    <Info className="w-5 h-5 text-[#1D192B]" />
                  </div>
                  <div className="space-y-4 w-full">
                    <div>
                      <h3 className="text-sm font-medium text-[#1D192B] flex items-center gap-2">
                         <Info className="w-4 h-4 text-[#1D192B] sm:hidden" />
                         Безотходный раскрой 
                      </h3>
                      <p className="text-[10px] text-[#49454F] mt-1 bg-white/50 px-2 py-1.5 rounded-lg mt-2 inline-block">
                        Оптимальная длина = (Чистая длина / Кол-во частей) − 5 мм
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-2">
                      {optimalLengths.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => setOrderedLength(opt.length.toString())}
                          className="bg-white hover:bg-slate-50 border border-[#CAC4D0] text-left p-3 rounded-xl transition-colors group flex items-center justify-between shadow-sm focus:outline-none"
                        >
                          <div>
                            <div className="font-semibold text-[#1D192B] text-sm">{opt.length} мм</div>
                            <div className="text-[10px] text-[#49454F] font-medium">
                              На {opt.pieces} {opt.pieces === 1 ? "часть" : opt.pieces > 1 && opt.pieces < 5 ? "части" : "частей"}
                            </div>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-[#6750A4]/5 flex items-center justify-center group-hover:bg-[#6750A4]/10 transition-colors shrink-0">
                            <ArrowRight className="w-3 h-3 text-[#6750A4]" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Remnant processing */}
            {orderedLength && Number(orderedLength) > 0 && (
              <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-[16px] relative z-10 shadow-sm">
                {remnantLength && Number(remnantLength) > 0 && piecesPerBar > 0 && (
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-4 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-slate-900 text-[10px] font-bold uppercase tracking-wider">Деловой остаток</h4>
                        <span className="text-[8px] font-semibold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase">после реза {piecesPerBar} шт.</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-normal text-slate-900 tracking-tight">{remnantLength} <span className="text-base text-slate-500 font-semibold">мм</span></p>
                        {remnantWeight && <p className="text-slate-500 font-medium text-xs">~ {remnantWeight.tons} т ({remnantWeight.kg} кг)</p>}
                      </div>
                    </div>
                    {remnantValue && effectiveRemnantPrice && (
                      <div className={`px-4 py-3 rounded-xl w-full lg:w-auto shadow-sm border ${currentRemnantPricingRule === "scrap" ? "bg-[#FFF8E1] border-[#FFECB3]" : "bg-[#E6F4EA] border-[#CEEAD6]"}`}>
                        <span className={`block text-[8px] font-bold uppercase tracking-wider ${currentRemnantPricingRule === "scrap" ? "text-[#E65100]" : "text-[#0D652D]"}`}>
                          {currentRemnantPricingRule === "scrap" ? "Стоимость лома" : "Оценка остатка"}
                        </span>
                        <span className={`text-lg font-normal tracking-tight ${currentRemnantPricingRule === "scrap" ? "text-[#E65100]" : "text-[#0D652D]"}`}>
                          {new Intl.NumberFormat("ru-RU").format(remnantValue)} руб.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:border-r border-slate-200 sm:pr-4">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Прутков в 1 тн</span>
                    <div className="text-xl font-medium text-slate-900">~ {piecesPerTon || 0} шт.</div>
                    {orderedBarWeight && <div className="text-xs text-slate-500 font-medium">Вес 1 прутка: {orderedBarWeight.kg} кг</div>}
                    {orderWeight && orderedBarWeight ? (
                      <div className="text-[10px] text-[#006A6A] font-semibold bg-[#006A6A]/10 px-2 py-1 rounded-md mt-2 inline-block">
                        Во всем заказе: ~ {new Intl.NumberFormat("ru-RU").format(totalPiecesInOrder || 0)} шт.
                      </div>
                    ) : null}
                  </div>

                  {advancedRemnantStats && (
                    <>
                      <div className="space-y-1.5 sm:border-r border-slate-200 sm:pr-4">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Стоимость отходов (1 тн)</span>
                        <div className="text-xl font-medium tracking-tight text-slate-900">
                          {currentAdminRawPrice && advancedRemnantStats.valuePerTon !== null ? `${formatCurrency(advancedRemnantStats.valuePerTon)} руб.` : "—"}
                        </div>
                        {currentAdminRawPrice && advancedRemnantStats.tonsPerTon !== null && (
                          <div className="mt-2 space-y-1.5 border-l-2 border-slate-200 pl-3">
                            {advancedRemnantStats.techTonsPerTon > 0 && (
                              <div className="text-[10px] text-slate-500 flex justify-between font-medium">
                                <span>Лом:</span>
                                <span className="font-semibold text-slate-900">{formatCurrency(advancedRemnantStats.techValuePerTon)} руб.</span>
                              </div>
                            )}
                            {advancedRemnantStats.remTonsPerTon > 0 && (
                              <div className="text-[10px] text-slate-500 flex justify-between font-medium">
                                <span>Остаток:</span>
                                <span className="font-semibold text-slate-900">{formatCurrency(advancedRemnantStats.remValuePerTon)} руб.</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Отходы на весь заказ</span>
                        <div className="text-xl font-medium tracking-tight text-slate-900">
                          {currentAdminRawPrice && orderWeight && advancedRemnantStats.orderScrapValue !== null
                            ? `${formatCurrency(advancedRemnantStats.orderScrapValue)} руб.`
                            : "—"}
                        </div>
                        {currentAdminRawPrice && orderWeight && advancedRemnantStats.orderScrapTons !== null && (
                          <div className="mt-2 space-y-1.5 border-l-2 border-slate-200 pl-3">
                            {advancedRemnantStats.orderTechTons > 0 && (
                              <div className="text-[10px] text-slate-500 flex justify-between font-medium">
                                <span>Лом:</span>
                                <span className="font-semibold text-slate-900">{formatCurrency(advancedRemnantStats.orderTechValue)} руб.</span>
                              </div>
                            )}
                            {advancedRemnantStats.orderRemTons > 0 && (
                              <div className="text-[10px] text-slate-500 flex justify-between font-medium">
                                <span>Остаток:</span>
                                <span className="font-semibold text-slate-900">{formatCurrency(advancedRemnantStats.orderRemValue)} руб.</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {remnantLength && Number(remnantLength) < 0 && (
              <div className="p-3 bg-[#FFDAD6] border border-[#FFB4AB] rounded-xl flex items-start gap-3 relative z-10 shadow-sm mt-4">
                <AlertTriangle className="w-5 h-5 text-[#BA1A1A] shrink-0" />
                <div>
                  <p className="text-sm font-bold text-[#BA1A1A] mb-0.5">Длина заказа превышает вытяжку</p>
                  <p className="text-xs text-[#BA1A1A]/90 font-medium leading-relaxed">
                    Из заготовки {displayedRawLength} мм получится пруток длиной {displayedTargetLength} мм. Заказанная длина {orderedLength} мм не поместится. Выберите заготовку длиннее или уменьшите длину отгрузки.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-4">
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
            <div className="bg-white p-4 sm:p-5 flex flex-col justify-center relative z-10 border border-slate-200 rounded-[16px] shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-xl">
                  <Package className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Вес заготовки</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-medium text-slate-900 tracking-tight">{requiredWeight || "0.00"}</span>
                <span className="text-base font-medium text-slate-500">тонн</span>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 flex flex-col justify-center relative z-10 border border-slate-200 rounded-[16px] shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-slate-100 border border-slate-200 text-slate-800 rounded-xl">
                  <Scale className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Расходный коэффициент общий</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-medium text-slate-900 tracking-tight">{currentCoefficient ? currentCoefficient.toFixed(3) : "—"}</span>
              </div>
            </div>
          </section>

          {/* COMMERCIAL COMMERCE SECTION */}
          <section className="bg-white rounded-2xl p-4 sm:p-5 space-y-4 sm:space-y-6 print-shadow-none relative overflow-hidden z-10 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3 relative z-10">
              <div className="p-2 bg-slate-800 text-white rounded-xl shadow-sm">
                <Briefcase className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-medium tracking-tight text-[#1A1C19]">Коммерческий расчет</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 p-4 rounded-[16px] relative z-10 shadow-sm">
              <div className="space-y-1.5 w-full">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider ml-1 truncate">Продажа за 1 т (без НДС)</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="55 000"
                    value={formatInputValue(sellPrice)}
                    onChange={(e) => handleNumericInput(e, setSellPrice)}
                    className="w-full bg-[#F0F4F4] border-b border-slate-400 rounded-t-lg pl-3 pr-10 h-10 text-sm font-medium transition-all focus:border-slate-800 focus:bg-slate-200 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-xs">руб</span>
                </div>
              </div>

              <div className="space-y-1.5 w-full">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider ml-1 truncate">Сумма заказа (без НДС)</label>
                <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 h-10 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900 truncate pl-1">{sellPrice && orderWeight ? formatCurrency(commercialStats?.sellTotal) : "0,00"}</span>
                  <span className="text-slate-500 font-medium ml-1 text-xs">руб</span>
                </div>
              </div>

              <div className="space-y-1.5 w-full">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider ml-1 truncate">Сумма (с НДС 22%)</label>
                <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 h-10 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900 truncate pl-1">{sellPrice && orderWeight ? formatCurrency(commercialStats?.sellTotalVat) : "0,00"}</span>
                  <span className="text-slate-500 font-medium ml-1 text-xs">руб</span>
                </div>
              </div>
            </div>

            {commercialStats && (
              <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-[16px] space-y-6 mt-4 relative z-10 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12 pl-1">
                  <div className="space-y-4">
                    <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 pb-2">На 1 тонну продукции</h4>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center font-medium">
                        <span className="text-slate-600">Продажная цена:</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(sellPrice)} руб.</span>
                      </div>
                      <div className="flex justify-between items-center text-[#BA1A1A] font-medium">
                        <span>- Стоимость заготовки:</span>
                        <span>{currentAdminRawPrice ? `${formatCurrency(currentAdminRawPrice)} руб.` : "—"}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#BA1A1A] font-medium">
                        <span>- Затраты на отходы:</span>
                        <span>{currentAdminRawPrice ? `${formatCurrency(commercialStats.lossesPerTon)} руб.` : "—"}</span>
                      </div>
                      {commercialStats.scrapRevenuePerTon > 0 && (
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center text-[#0D652D] font-medium bg-[#E6F4EA] border border-[#CEEAD6] px-2.5 py-1.5 rounded-lg shadow-sm">
                            <span>+ Возврат лома/остатков:</span>
                            <span>{formatCurrency(commercialStats.scrapRevenuePerTon)} руб.</span>
                          </div>
                          <div className="space-y-1 pl-3 border-l-2 border-[#CEEAD6] mt-1 text-[#0D652D]">
                            {advancedRemnantStats && advancedRemnantStats.techScrapRevenuePerTon > 0 && (
                              <div className="flex justify-between items-center text-[10px] font-medium">
                                <span>Лом ({(advancedRemnantStats.techTonsPerTon * 1000).toFixed(1)} кг):</span>
                                <span>{formatCurrency(advancedRemnantStats.techScrapRevenuePerTon)} руб.</span>
                              </div>
                            )}
                            {advancedRemnantStats && advancedRemnantStats.remnantRevenuePerTon > 0 && (
                              <div className="flex justify-between items-center text-[10px] font-medium">
                                <span>Деловой остаток ({(advancedRemnantStats.remTonsPerTon * 1000).toFixed(1)} кг):</span>
                                <span>{formatCurrency(advancedRemnantStats.remnantRevenuePerTon)} руб.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="pt-4 border-t border-slate-200 flex flex-col gap-1.5">
                        <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Маржа (без НДС):</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium tracking-tight text-xl ${commercialStats.isPositive ? "text-[#0D652D]" : "text-[#BA1A1A]"}`}>
                            {commercialStats.isPositive ? "+" : ""}{formatCurrency(commercialStats.profitPerTon)} руб.
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border shadow-sm ${commercialStats.isPositive ? "bg-[#E6F4EA] border-[#CEEAD6] text-[#0D652D]" : "bg-[#FFDAD6] border-[#FFB4AB] text-[#BA1A1A]"}`}>
                            {commercialStats.isPositive ? "+" : ""}{commercialStats.marginPercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 pb-2">На весь заказ ({totalPiecesInOrder} шт.)</h4>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center font-medium">
                        <span className="text-slate-600">Сумма продажи:</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(commercialStats.sellTotal)} руб.</span>
                      </div>
                      <div className="flex justify-between items-center text-[#BA1A1A] font-medium">
                        <span>- Стоимость заготовки:</span>
                        <span>{currentAdminRawPrice && orderWeight ? `${formatCurrency(commercialStats.rawTotal)} руб.` : "—"}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#BA1A1A] font-medium">
                        <span>- Затраты на отходы:</span>
                        <span>{currentAdminRawPrice && orderWeight ? `${formatCurrency(commercialStats.lossesTotal)} руб.` : "—"}</span>
                      </div>
                      {commercialStats.scrapRevenueTotal > 0 && (
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center text-[#0D652D] font-medium bg-[#E6F4EA] border border-[#CEEAD6] px-2.5 py-1.5 rounded-lg shadow-sm">
                            <span>+ Возврат лома/остатков:</span>
                            <span>{formatCurrency(commercialStats.scrapRevenueTotal)} руб.</span>
                          </div>
                          <div className="space-y-1 pl-3 border-l-2 border-[#CEEAD6] mt-1 text-[#0D652D]">
                            {advancedRemnantStats && advancedRemnantStats.orderTechRevenue > 0 && (
                              <div className="flex justify-between items-center text-[10px] font-medium">
                                <span>Лом ({advancedRemnantStats.orderTechTons.toFixed(3)} т):</span>
                                <span>{formatCurrency(advancedRemnantStats.orderTechRevenue)} руб.</span>
                              </div>
                            )}
                            {advancedRemnantStats && advancedRemnantStats.orderRemRevenue > 0 && (
                              <div className="flex justify-between items-center text-[10px] font-medium">
                                <span>Деловой остаток ({advancedRemnantStats.orderRemTons.toFixed(3)} т):</span>
                                <span>{formatCurrency(advancedRemnantStats.orderRemRevenue)} руб.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="pt-4 border-t border-slate-200 flex flex-col gap-1.5">
                        <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Итого маржа (без НДС):</span>
                        <span className={`font-medium tracking-tight text-2xl ${commercialStats.isPositive ? "text-[#0D652D]" : "text-[#BA1A1A]"}`}>
                          {commercialStats.isPositive ? "+" : ""}{formatCurrency(commercialStats.profitTotal)} руб.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {commercialStats && (
              <div className="grid grid-cols-1 gap-3 pt-4 relative z-10">
                {commercialStats.netLossesPerTon > 0 && (
                  <div className="bg-[#FFF8E1] border border-[#FFECB3] p-4 rounded-xl flex gap-3 shadow-sm">
                    <Info className="w-5 h-5 text-[#E65100] shrink-0" />
                    <div>
                      <h5 className="font-semibold text-[#E65100] text-sm mb-1">Рекомендация по цене</h5>
                      <p className="text-[#E65100]/80 text-[11px] font-medium mb-2">
                        Чистые потери от отходов: <span className="font-bold">{formatCurrency(commercialStats.netLossesPerTon)} руб./т</span>.
                      </p>
                      <div className="inline-flex items-center bg-white/60 px-3 py-1.5 rounded-lg text-slate-900 font-bold text-sm border border-slate-200">
                        Рекомендуемая цена: {formatCurrency(Number(sellPrice) + Number(commercialStats.netLossesPerTon))} руб./т
                      </div>
                    </div>
                  </div>
                )}
                {commercialStats.profitPerTon > 0 && commercialStats.profitPerTon < 10000 && (
                  <div className="border border-[#FFECB3] p-4 rounded-xl flex gap-3 shadow-sm bg-white">
                    <AlertTriangle className="w-5 h-5 text-[#E65100] shrink-0" />
                    <div>
                      <h5 className="font-semibold text-[#E65100] text-sm mb-1">Осторожно</h5>
                      <p className="text-slate-500 text-xs font-medium">Маржинальность на тонну меньше 10 000 руб. ({formatCurrency(commercialStats.profitPerTon)} руб./т).</p>
                    </div>
                  </div>
                )}
                {commercialStats.profitPerTon <= 0 && currentAdminRawPrice && sellPrice && (
                  <div className="bg-[#FFDAD6] border border-[#FFB4AB] p-4 rounded-xl flex gap-3 shadow-sm">
                    <AlertTriangle className="w-5 h-5 text-[#BA1A1A] shrink-0" />
                    <div>
                      <h5 className="font-semibold text-[#BA1A1A] text-sm mb-1">Сделка убыточна</h5>
                      <p className="text-[#BA1A1A]/80 text-xs font-medium">Пересмотрите цену продажи или согласуйте новую длину.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  </div>
</div>
  );
}
