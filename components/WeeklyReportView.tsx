import React, { useState } from 'react';
import { WeeklySummary } from '../types';
import HistoryEntryCard from './HistoryEntryCard';

interface WeeklyReportViewProps {
  summaries: WeeklySummary[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isBusy?: boolean;
}

const formatCurrency = (value: number): string => {
    const isNegative = value < 0;
    const absoluteValue = Math.abs(value);
    return `${isNegative ? '- ' : ''}$ ${absoluteValue.toFixed(2).replace('.', ',')}`;
};

const WeeklyCard: React.FC<{
  summary: WeeklySummary;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isBusy?: boolean;
}> = ({ summary, onView, onEdit, onDelete, isBusy }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white shadow-lg rounded-xl transition-shadow hover:shadow-xl">
      <div
        className="p-4 sm:p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
          <div>
            <p className="font-bold text-lg sm:text-xl text-[#0D2B3E]">{summary.weekYear}</p>
            <p className="text-sm text-slate-500 font-medium">
              Baseado em {summary.count} resumo(s). Clique para ver.
            </p>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 text-slate-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
          <div className="p-4 rounded-lg bg-slate-50">
            <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider font-semibold">
              Recebimentos
            </p>
            <p className="text-xl sm:text-2xl font-bold text-teal-500 mt-1">
              {formatCurrency(summary.receipts)}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50">
            <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider font-semibold">
              Despesas
            </p>
            <p className="text-xl sm:text-2xl font-bold text-orange-500 mt-1">
              {formatCurrency(summary.expenses)}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50">
            <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider font-semibold">
              Lucro
            </p>
            <p
              className={`text-xl sm:text-2xl font-bold mt-1 ${
                summary.profit >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {formatCurrency(summary.profit)}
            </p>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-6 pt-0 space-y-4">
          <h3 className="text-lg font-bold text-slate-600 border-t border-slate-200 pt-4">
            Detalhes da Semana
          </h3>
          {summary.entries.map(entry => (
            <HistoryEntryCard
              key={entry.id}
              entry={entry}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              isBusy={isBusy}
              className="shadow-md hover:scale-[1.01]"
            />
          ))}
        </div>
      )}
    </div>
  );
};


const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({ summaries, onView, onEdit, onDelete, isBusy }) => {
  if (summaries.length === 0) {
    return (
       <div className="max-w-4xl mx-auto">
        <header className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0D2B3E]">Resumo Semanal</h2>
        </header>
        <div className="bg-white shadow-xl rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-slate-700">Dados insuficientes para gerar o relatório.</h3>
            <p className="text-slate-500 mt-2">Continue salvando seus resumos diários para visualizar este relatório.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0D2B3E]">Resumo Semanal</h2>
      </header>

      <div className="space-y-6">
        {summaries.map(summary => (
          <WeeklyCard key={summary.weekYear} summary={summary} onView={onView} onEdit={onEdit} onDelete={onDelete} isBusy={isBusy} />
        ))}
      </div>
    </div>
  );
};

export default WeeklyReportView;