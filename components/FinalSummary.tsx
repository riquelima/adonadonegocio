import React from 'react';
import CurrencyInput from './CurrencyInput';

interface FinalSummaryProps {
    clientReceipts: number;
    setClientReceipts: (value: number) => void;
    calculations: {
        monthlyProfit: number;
        realVsIdealDifference: number;
    };
    isReadOnly?: boolean;
}

const formatCurrency = (value: number): string => {
    const isNegative = value < 0;
    const absoluteValue = Math.abs(value);
    return `${isNegative ? '- ' : ''}$ ${absoluteValue.toFixed(2).replace('.', ',')}`;
};

const FinalSummary: React.FC<FinalSummaryProps> = ({ clientReceipts, setClientReceipts, calculations, isReadOnly = false }) => {
    const differenceColor = calculations.realVsIdealDifference >= 0 ? 'text-green-500' : 'text-red-500';
    const profitColor = calculations.monthlyProfit >= 0 ? 'text-green-500' : 'text-red-500';

    return (
        <div className="bg-white shadow-xl rounded-xl">
            <div className="p-4 sm:p-5 space-y-4">
                <div className="flex flex-col items-start sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-2 border-b border-slate-100">
                    <label htmlFor="clientReceipts" className="text-sm text-slate-500 font-medium">RECEBIMENTOS CLIENTES</label>
                    <div className="flex items-center rounded-lg bg-slate-100 overflow-hidden focus-within:ring-2 focus-within:ring-teal-400 transition-all w-full sm:w-auto">
                        <span className="px-3 py-2.5 text-slate-500 font-bold border-r border-slate-200">$</span>
                        <CurrencyInput
                            value={clientReceipts}
                            onChange={setClientReceipts}
                            className="w-full sm:w-28 text-right bg-slate-100 text-[#0D2B3E] font-bold p-2.5 pr-3 focus:outline-none disabled:cursor-not-allowed disabled:text-slate-500"
                            placeholder="0,00"
                            disabled={isReadOnly}
                            ariaLabel="Recebimentos de clientes"
                        />
                    </div>
                </div>
                <div className="flex flex-col items-start sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-500 font-medium">LUCRO DO MÊS</span>
                    <span className={`font-bold text-xl ${profitColor}`}>{formatCurrency(calculations.monthlyProfit)}</span>
                </div>
                <div className="flex flex-col items-start sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 py-2">
                    <span className="text-sm text-slate-500 font-medium">DIFERENÇA REAL E IDEAL</span>
                    <span className={`font-bold text-xl ${differenceColor}`}>{formatCurrency(calculations.realVsIdealDifference)}</span>
                </div>
            </div>
        </div>
    )
}

export default FinalSummary;