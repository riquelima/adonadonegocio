import React from 'react';
import { HistoryEntry } from '../types';
import HistoryEntryCard from './HistoryEntryCard';

interface HistoryViewProps {
  history: HistoryEntry[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isBusy?: boolean;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onView, onEdit, onDelete, isBusy = false }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0D2B3E]">Histórico Diário</h2>
      </header>

      {history.length === 0 ? (
        <div className="bg-white shadow-xl rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-slate-700">Nenhum resumo salvo ainda.</h3>
            <p className="text-slate-500 mt-2">Use o botão "Salvar Resumo" na calculadora para começar a registrar seu histórico.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {history.map(entry => (
            <HistoryEntryCard 
              key={entry.id}
              entry={entry}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              isBusy={isBusy}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;