import { formatCurrency, getGostForGrade, getProfileGost, getLengthLabel } from "../lib/constants";

interface PrintTemplateProps {
  printText: string;
}

export function PrintTemplate({ printText }: PrintTemplateProps) {
  return (
    <div className="hidden print:!block p-4 sm:p-8 bg-white text-black font-sans mx-auto text-[12px] sm:text-[13px] leading-snug whitespace-pre-wrap break-words" style={{ maxWidth: "210mm", margin: "0 auto" }}>
      {printText.trim()}
    </div>
  );
}
