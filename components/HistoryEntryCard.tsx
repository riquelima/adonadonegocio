import React from 'react';
import { HistoryEntry } from '../types';

interface HistoryEntryCardProps {
  entry: HistoryEntry;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
  isBusy?: boolean;
}

const formatCurrency = (value: number): string => {
    const isNegative = value < 0;
    const absoluteValue = Math.abs(value);
    return `${isNegative ? '- ' : ''}$ ${absoluteValue.toFixed(2).replace('.', ',')}`;
};

const HistoryEntryCard: React.FC<HistoryEntryCardProps> = ({ entry, onView, onEdit, onDelete, className = '', isBusy = false }) => {
  return (
    <div className={`bg-white shadow-lg rounded-xl p-4 sm:p-6 transition-transform hover:scale-[1.02] hover:shadow-xl ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 sm:gap-2 border-b border-slate-100 pb-4 mb-4">
        <div>
          <p className="font-bold text-lg sm:text-xl text-[#0D2B3E]">Resumo do Dia</p>
          <p className="text-slate-500 font-medium text-sm sm:text-base">{entry.date}</p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
            <button 
              onClick={(e) => {
                e.stopPropagation(); 
                onEdit(entry.id);
              }}
              disabled={isBusy}
              className="flex items-center gap-2 py-2 px-3 sm:px-4 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Editar resumo de ${entry.date}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
              </svg>
              <span className="hidden sm:inline">Editar</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(entry.id);
              }}
              disabled={isBusy}
              className="py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Deletar resumo de ${entry.date}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
        </div>
      </div>
      <div 
        onClick={() => onView(entry.id)}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left cursor-pointer"
        aria-label={`Visualizar detalhes do resumo de ${entry.date}`}
      >
          <div className='p-4 rounded-lg bg-slate-50'>
              <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider font-semibold">Recebimentos</p>
              <p className="text-xl sm:text-2xl font-bold text-teal-500 mt-1">{formatCurrency(entry.receipts)}</p>
          </div>
           <div className='p-4 rounded-lg bg-slate-50'>
              <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider font-semibold">Despesas</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-500 mt-1">{formatCurrency(entry.expenses)}</p>
          </div>
           <div className='p-4 rounded-lg bg-slate-50'>
              <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider font-semibold">Lucro</p>
              <p className={`text-xl sm:text-2xl font-bold mt-1 ${entry.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(entry.profit)}</p>
          </div>
      </div>
    </div>
  );
};

export default HistoryEntryCard;