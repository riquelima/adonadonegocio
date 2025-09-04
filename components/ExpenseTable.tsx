import React from 'react';
import { ExpenseItem } from '../types';
import CurrencyInput from './CurrencyInput';

interface ExpenseTableProps {
  title: string;
  items: ExpenseItem[];
  onItemChange: (id: string, field: 'label' | 'value', value: string | number) => void;
  onAddItem: () => void;
  onDeleteItem: (id: string) => void;
  total: number;
  isReadOnly?: boolean;
}

const formatCurrency = (value: number): string => {
    return (value || 0).toFixed(2).replace('.', ',');
};

const ExpenseTable: React.FC<ExpenseTableProps> = ({ title, items, onItemChange, onAddItem, onDeleteItem, total, isReadOnly = false }) => {
  return (
    <div className="bg-white shadow-xl rounded-xl overflow-hidden flex flex-col">
      <h2 className="bg-[#0D2B3E] text-white p-4 font-bold text-lg tracking-wide">{title}</h2>
      <div className="overflow-x-auto flex-grow">
        <div className="min-w-[400px]">
            <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-100">
                <tr>
                <th className="text-left p-3 font-semibold text-slate-600 w-2/3 uppercase text-xs tracking-wider">Descrição</th>
                <th className="text-right p-3 font-semibold text-slate-600 w-1/3 uppercase text-xs tracking-wider">Valor</th>
                <th className="w-12 p-3"></th>
                </tr>
            </thead>
            <tbody>
                {items.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-100 group hover:bg-teal-50/50">
                    <td className="p-2">
                    <input
                        type="text"
                        value={item.label}
                        onChange={(e) => onItemChange(item.id, 'label', e.target.value)}
                        className="w-full bg-transparent p-1 focus:outline-none text-slate-700 font-medium disabled:text-slate-500 disabled:cursor-not-allowed"
                        aria-label={`Descrição de ${item.label}`}
                        disabled={isReadOnly}
                    />
                    </td>
                    <td className="p-2">
                    <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                        <CurrencyInput
                            value={item.value}
                            onChange={(newValue) => onItemChange(item.id, 'value', newValue)}
                            className="w-full text-right bg-transparent p-1 pl-6 focus:outline-none font-medium text-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                            placeholder="0,00"
                            ariaLabel={`Valor para ${item.label}`}
                            disabled={isReadOnly}
                        />
                    </div>
                    </td>
                    <td className="p-2 text-center">
                        {!isReadOnly && (
                        <button 
                            onClick={() => onDeleteItem(item.id)} 
                            className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            aria-label={`Deletar ${item.label}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                        )}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
      {!isReadOnly && (
        <div className="p-4 mt-auto">
          <button onClick={onAddItem} className="w-full text-center py-2.5 px-4 bg-teal-500 text-white hover:bg-teal-600 rounded-lg transition-colors font-semibold shadow-md hover:shadow-lg">
              Adicionar Linha
          </button>
        </div>
      )}
      <div className="bg-[#113c55] text-white p-4 flex justify-between items-center font-bold text-lg">
        <span>Total</span>
        <span>$ {formatCurrency(total)}</span>
      </div>
    </div>
  );
};

export default ExpenseTable;