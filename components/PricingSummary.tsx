import React from 'react';

interface PricingSummaryProps {
  totalCosts: number;
  profitMargin: number;
  setProfitMargin: (value: number) => void;
  financialReservePercentage: number;
  setFinancialReservePercentage: (value: number) => void;
  calculations: {
    idealMonthlyBilling: number;
    financialReserveValue: number;
    profitValue: number;
    suggestedPricePerDay: number;
    suggestedPricePerHour: number;
  };
  isReadOnly?: boolean;
}

const formatCurrency = (value: number): string => {
  return `$ ${(value || 0).toFixed(2).replace('.', ',')}`;
};

const SummaryRow: React.FC<{ label: string; value?: string; children?: React.ReactNode; isHighlighted?: boolean }> = ({ label, value, children, isHighlighted }) => (
  <div className="flex justify-between items-center py-3.5 border-b border-slate-100">
    <span className="text-sm text-slate-500 font-medium">{label}</span>
    {children || <span className={`font-bold text-right ${isHighlighted ? 'text-teal-500 text-lg' : 'text-[#0D2B3E]'}`}>{value}</span>}
  </div>
);


const PricingSummary: React.FC<PricingSummaryProps> = ({
  totalCosts,
  profitMargin,
  setProfitMargin,
  financialReservePercentage,
  setFinancialReservePercentage,
  calculations,
  isReadOnly = false,
}) => {
  return (
    <div className="bg-white shadow-xl rounded-xl overflow-hidden">
      <h2 className="bg-[#0D2B3E] text-white p-4 font-bold text-lg tracking-wide">ENCONTRE O PREÇO</h2>
      <div className="p-4 sm:p-5">
        <SummaryRow label="MARGEM DE LUCRO">
          <div className="flex items-center bg-slate-100 rounded-lg">
            <input
              type="number"
              value={profitMargin}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
              className="w-20 text-right bg-transparent p-2 text-[#0D2B3E] font-bold focus:outline-none disabled:cursor-not-allowed disabled:text-slate-500"
              aria-label="Margem de Lucro em porcentagem"
              disabled={isReadOnly}
            />
            <span className="pr-3 text-[#0D2B3E] font-bold">%</span>
          </div>
        </SummaryRow>
        <SummaryRow label="PERCENTUAL DE RESERVA FINANCEIRA">
            <div className="flex items-center bg-slate-100 rounded-lg">
                <input
                type="number"
                value={financialReservePercentage}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setFinancialReservePercentage(parseFloat(e.target.value) || 0)}
                className="w-20 text-right bg-transparent p-2 text-[#0D2B3E] font-bold focus:outline-none disabled:cursor-not-allowed disabled:text-slate-500"
                aria-label="Percentual de Reserva Financeira"
                disabled={isReadOnly}
                />
                <span className="pr-3 text-[#0D2B3E] font-bold">%</span>
            </div>
        </SummaryRow>
        <SummaryRow label="DESPESAS E CUSTOS TOTAIS" value={formatCurrency(totalCosts)} />
        <SummaryRow label="FATURAMENTO MENSAL - IDEAL" value={formatCurrency(calculations.idealMonthlyBilling)} isHighlighted />
        <SummaryRow label="RESERVA FINANCEIRA" value={formatCurrency(calculations.financialReserveValue)} />
        <SummaryRow label="LUCRO" value={formatCurrency(calculations.profitValue)} />
        <SummaryRow label="PREÇO SUGERIDO POR DIA" value={formatCurrency(calculations.suggestedPricePerDay)} />
        <SummaryRow label="PREÇO SUGERIDO POR HORA" value={formatCurrency(calculations.suggestedPricePerHour)} />
      </div>
    </div>
  );
};

export default PricingSummary;