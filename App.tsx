import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ExpenseItem, HistoryEntry, WeeklySummary, MonthlySummary } from './types';
import ExpenseTable from './components/ExpenseTable';
import PricingSummary from './components/PricingSummary';
import FinalSummary from './components/FinalSummary';
import { INITIAL_FIXED_EXPENSES, INITIAL_CONTINGENCY_COSTS } from './constants/initialData';
import HistoryView from './components/HistoryView';
import WeeklyReportView from './components/WeeklyReportView';
import MonthlyReportView from './components/MonthlyReportView';
import InsightsView from './components/InsightsView';
import ChartsView from './components/ChartsView';
import { supabase } from './supabaseClient';

type View = 'calculator' | 'history' | 'charts' | 'insights';
type CalculatorMode = 'new' | 'edit' | 'view';
type HistoryViewMode = 'daily' | 'weekly' | 'monthly';
type NotificationType = { message: string; type: 'success' | 'error' };

const Notification: React.FC<{ notification: NotificationType; onClose: () => void }> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = notification.type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`fixed top-5 right-5 ${bgColor} text-white py-3 px-5 rounded-lg shadow-xl animate-fade-in-down z-50`}>
      <div className="flex items-center justify-between">
        <span>{notification.message}</span>
        <button onClick={onClose} className="ml-4 opacity-80 hover:opacity-100">&times;</button>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [fixedExpenses, setFixedExpenses] = useState<ExpenseItem[]>(INITIAL_FIXED_EXPENSES);
  const [contingencyCosts, setContingencyCosts] = useState<ExpenseItem[]>(INITIAL_CONTINGENCY_COSTS);
  const [profitMargin, setProfitMargin] = useState<number>(20);
  const [financialReservePercentage, setFinancialReservePercentage] = useState<number>(10);
  const [clientReceipts, setClientReceipts] = useState<number>(0);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState<NotificationType | null>(null);

  const [view, setView] = useState<View>('calculator');
  const [historyView, setHistoryView] = useState<HistoryViewMode>('daily');
  const [calculatorMode, setCalculatorMode] = useState<CalculatorMode>('new');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  
  const fetchHistory = useCallback(async () => {
    setIsLoading(true);

    const { data, error } = await supabase
      .from('Done_Negocio_House_Cleaning')
      .select('*')
      .order('summary_date', { ascending: false });

    if (error) {
      console.error('Error fetching history:', error);
      setNotification({ message: 'Não foi possível carregar o histórico.', type: 'error' });
    } else if (data) {
      const formattedData: HistoryEntry[] = data.map((item: any) => ({
        id: item.id,
        date: new Date(item.summary_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        isoDate: item.summary_date,
        receipts: item.receipts,
        expenses: item.expenses,
        profit: item.profit,
        snapshot: item.snapshot,
      }));
      setHistory(formattedData);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const resetCalculatorState = useCallback(() => {
    setFixedExpenses(INITIAL_FIXED_EXPENSES.map(item => ({...item, value: 0})));
    setContingencyCosts(INITIAL_CONTINGENCY_COSTS.map(item => ({...item, value: 0})));
    setProfitMargin(20);
    setFinancialReservePercentage(10);
    setClientReceipts(0);
    setEditingEntryId(null);
    setCalculatorMode('new');
  }, []);

  const handleItemChange = useCallback((setter: React.Dispatch<React.SetStateAction<ExpenseItem[]>>) => (id: string, field: 'label' | 'value', value: string | number) => {
    setter(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  }, []);

  const handleAddItem = useCallback((setter: React.Dispatch<React.SetStateAction<ExpenseItem[]>>) => () => {
    setter(prevItems => [
      ...prevItems,
      { id: `new-${Date.now()}`, label: 'Nova Despesa', value: 0 },
    ]);
  }, []);

  const handleDeleteItem = useCallback((setter: React.Dispatch<React.SetStateAction<ExpenseItem[]>>) => (id: string) => {
    setter(prevItems => prevItems.filter(item => item.id !== id));
  }, []);
  
  const totalFixedExpenses = useMemo(() => fixedExpenses.reduce((acc, item) => acc + Number(item.value || 0), 0), [fixedExpenses]);
  const totalContingencyCosts = useMemo(() => contingencyCosts.reduce((acc, item) => acc + Number(item.value || 0), 0), [contingencyCosts]);
  const totalCosts = useMemo(() => totalFixedExpenses + totalContingencyCosts, [totalFixedExpenses, totalContingencyCosts]);

  const pricingCalculations = useMemo(() => {
    const idealMonthlyBilling = totalCosts * (1 + (profitMargin / 100) + (financialReservePercentage / 100));
    const financialReserveValue = idealMonthlyBilling * (financialReservePercentage / 100);
    const profitValue = idealMonthlyBilling - totalCosts - financialReserveValue;
    const suggestedPricePerDay = idealMonthlyBilling / 20;
    const suggestedPricePerHour = suggestedPricePerDay / 8;
    return { idealMonthlyBilling, financialReserveValue, profitValue, suggestedPricePerDay, suggestedPricePerHour };
  }, [totalCosts, profitMargin, financialReservePercentage]);
  
  const finalCalculations = useMemo(() => {
      const monthlyProfit = clientReceipts - totalCosts - pricingCalculations.financialReserveValue;
      const realVsIdealDifference = pricingCalculations.profitValue - monthlyProfit;
      return { monthlyProfit, realVsIdealDifference };
  }, [clientReceipts, totalCosts, pricingCalculations]);

  const getWeekNumber = (d: Date): [number, number] => {
      d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
      return [d.getUTCFullYear(), weekNo];
  };

  const weeklySummaries = useMemo<WeeklySummary[]>(() => {
    const groups = history.reduce((acc, entry) => {
        const [year, week] = getWeekNumber(new Date(entry.isoDate));
        const key = `${year}-W${week}`;
        if (!acc[key]) {
            acc[key] = {
                weekYear: `Semana ${week} de ${year}`,
                receipts: 0,
                expenses: 0,
                profit: 0,
                count: 0,
                entries: [],
            };
        }
        acc[key].receipts += entry.receipts;
        acc[key].expenses += entry.expenses;
        acc[key].profit += entry.profit;
        acc[key].count += 1;
        acc[key].entries.push(entry);
        return acc;
    }, {} as Record<string, WeeklySummary>);

    return Object.values(groups).sort((a, b) => b.entries[0].isoDate.localeCompare(a.entries[0].isoDate));
  }, [history]);

  const monthlySummaries = useMemo<MonthlySummary[]>(() => {
    const groups = history.reduce((acc, entry) => {
        const date = new Date(entry.isoDate);
        const monthYear = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
        const key = `${date.getFullYear()}-${date.getMonth()}`;

        if (!acc[key]) {
            acc[key] = {
                monthYear: monthYear.charAt(0).toUpperCase() + monthYear.slice(1),
                receipts: 0,
                expenses: 0,
                profit: 0,
                count: 0,
                entries: [],
            };
        }
        acc[key].receipts += entry.receipts;
        acc[key].expenses += entry.expenses;
        acc[key].profit += entry.profit;
        acc[key].count += 1;
        acc[key].entries.push(entry);
        return acc;
    }, {} as Record<string, MonthlySummary>);

    return Object.values(groups).sort((a, b) => b.entries[0].isoDate.localeCompare(a.entries[0].isoDate));
  }, [history]);

  const handleSaveOrUpdateSummary = useCallback(async () => {
    setIsSaving(true);
    setNotification(null);
    const snapshot = {
        fixedExpenses,
        contingencyCosts,
        profitMargin,
        financialReservePercentage,
        clientReceipts
    };

    try {
        if (editingEntryId) {
            const { error } = await supabase
                .from('Done_Negocio_House_Cleaning')
                .update({
                    summary_date: new Date().toISOString(),
                    receipts: clientReceipts,
                    expenses: totalCosts,
                    profit: finalCalculations.monthlyProfit,
                    snapshot,
                })
                .eq('id', editingEntryId);
            if (error) throw error;
            setNotification({ message: 'Resumo atualizado com sucesso!', type: 'success' });
        } else {
            const { error } = await supabase
                .from('Done_Negocio_House_Cleaning')
                .insert({
                    summary_date: new Date().toISOString(),
                    receipts: clientReceipts,
                    expenses: totalCosts,
                    profit: finalCalculations.monthlyProfit,
                    snapshot,
                });
            if (error) throw error;
            setNotification({ message: 'Resumo salvo com sucesso!', type: 'success' });
        }
        await fetchHistory();
        resetCalculatorState();
        setView('history');
    } catch (error: any) {
        console.error('Error saving/updating summary:', error);
        setNotification({ message: `Erro: ${error.message}`, type: 'error' });
    } finally {
        setIsSaving(false);
    }
  }, [clientReceipts, totalCosts, finalCalculations, editingEntryId, fixedExpenses, contingencyCosts, profitMargin, financialReservePercentage, resetCalculatorState, fetchHistory]);
  
  const handleDeleteSummary = useCallback(async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este resumo? Esta ação não pode ser desfeita.')) {
        setIsSaving(true);
        setNotification(null);
        try {
            const { error } = await supabase
                .from('Done_Negocio_House_Cleaning')
                .delete()
                .eq('id', id);
            if (error) throw error;
            setNotification({ message: 'Resumo deletado com sucesso!', type: 'success' });
            await fetchHistory();
        } catch (error: any) {
            console.error('Error deleting summary:', error);
            setNotification({ message: `Erro ao deletar: ${error.message}`, type: 'error' });
        } finally {
            setIsSaving(false);
        }
    }
  }, [fetchHistory]);

  const loadSnapshotIntoCalculator = useCallback((snapshot: HistoryEntry['snapshot']) => {
    setFixedExpenses(snapshot.fixedExpenses);
    setContingencyCosts(snapshot.contingencyCosts);
    setProfitMargin(snapshot.profitMargin);
    setFinancialReservePercentage(snapshot.financialReservePercentage);
    setClientReceipts(snapshot.clientReceipts);
  }, []);

  const handleViewEntry = useCallback((id: string) => {
    const entry = history.find(e => e.id === id);
    if (entry) {
        loadSnapshotIntoCalculator(entry.snapshot);
        setEditingEntryId(entry.id);
        setCalculatorMode('view');
        setView('calculator');
    }
  }, [history, loadSnapshotIntoCalculator]);
  
  const handleEditEntry = useCallback((id: string) => {
    const entry = history.find(e => e.id === id);
    if (entry) {
        loadSnapshotIntoCalculator(entry.snapshot);
        setEditingEntryId(entry.id);
        setCalculatorMode('edit');
        setView('calculator');
    }
  }, [history, loadSnapshotIntoCalculator]);

  const handleExitCalculatorMode = useCallback(() => {
    resetCalculatorState();
    setView('history');
  }, [resetCalculatorState]);

  const renderView = () => {
    const isReadOnly = calculatorMode === 'view';
    switch (view) {
      case 'history': {
        const HistoryNavButton: React.FC<{ activeView: HistoryViewMode, targetView: HistoryViewMode, label: string, onClick: (view: HistoryViewMode) => void }> = ({ activeView, targetView, label, onClick }) => {
            const isActive = activeView === targetView;
            return (
              <button 
                onClick={() => onClick(targetView)} 
                className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
                  isActive 
                    ? 'bg-teal-500 text-white shadow' 
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            );
        };
        return (
            <div>
                 <div className="flex items-center gap-2 mb-8 bg-slate-100 p-2 rounded-lg shadow-inner w-fit mx-auto">
                    <HistoryNavButton activeView={historyView} targetView="daily" label="Diário" onClick={setHistoryView} />
                    <HistoryNavButton activeView={historyView} targetView="weekly" label="Semanal" onClick={setHistoryView} />
                    <HistoryNavButton activeView={historyView} targetView="monthly" label="Mensal" onClick={setHistoryView} />
                </div>
                {historyView === 'daily' && <HistoryView history={history} onView={handleViewEntry} onEdit={handleEditEntry} onDelete={handleDeleteSummary} isBusy={isSaving} />}
                {historyView === 'weekly' && <WeeklyReportView summaries={weeklySummaries} onView={handleViewEntry} onEdit={handleEditEntry} onDelete={handleDeleteSummary} isBusy={isSaving} />}
                {historyView === 'monthly' && <MonthlyReportView summaries={monthlySummaries} onView={handleViewEntry} onEdit={handleEditEntry} onDelete={handleDeleteSummary} isBusy={isSaving} />}
            </div>
        )
      }
      case 'charts':
        return <ChartsView history={history} />;
      case 'insights':
        return <InsightsView history={history} isGenerating={isGenerating} setIsGenerating={setIsGenerating} setNotification={setNotification} />;
      case 'calculator':
      default:
        return (
          <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 md:items-start">
              <ExpenseTable
                title="DESPESAS-CUSTOS (variáveis e fixos)"
                items={fixedExpenses}
                onItemChange={handleItemChange(setFixedExpenses)}
                onAddItem={handleAddItem(setFixedExpenses)}
                onDeleteItem={handleDeleteItem(setFixedExpenses)}
                total={totalFixedExpenses}
                isReadOnly={isReadOnly}
              />
              <ExpenseTable
                title="CUSTOS EVENTUAIS"
                items={contingencyCosts}
                onItemChange={handleItemChange(setContingencyCosts)}
                onAddItem={handleAddItem(setContingencyCosts)}
                onDeleteItem={handleDeleteItem(setContingencyCosts)}
                total={totalContingencyCosts}
                isReadOnly={isReadOnly}
              />
            </div>

            <div className="space-y-8">
              <PricingSummary
                totalCosts={totalCosts}
                profitMargin={profitMargin}
                setProfitMargin={setProfitMargin}
                financialReservePercentage={financialReservePercentage}
                setFinancialReservePercentage={setFinancialReservePercentage}
                calculations={pricingCalculations}
                isReadOnly={isReadOnly}
              />
              <FinalSummary
                  clientReceipts={clientReceipts}
                  setClientReceipts={setClientReceipts}
                  calculations={finalCalculations}
                  isReadOnly={isReadOnly}
              />
            </div>
          </main>
        )
    }
  }
  
  const NavButton: React.FC<{ activeView: View, targetView: View, label: string, onClick: (view: View) => void, disabled?: boolean }> = ({ activeView, targetView, label, onClick, disabled }) => {
    const isActive = activeView === targetView;
    return (
      <button 
        onClick={() => onClick(targetView)} 
        disabled={disabled}
        className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
          isActive 
            ? 'bg-teal-500 text-white shadow' 
            : 'bg-white text-slate-600 hover:bg-slate-100'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {label}
      </button>
    );
  };
  
  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {notification && <Notification notification={notification} onClose={() => setNotification(null)} />}
      <div className="container mx-auto p-4 md:p-8">
        <header className="flex flex-col md:flex-row justify-between md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0D2B3E]">Calculadora de Precificação</h1>
            <p className="text-slate-500">A dona do Negócio - House Cleaning</p>
          </div>
        </header>

        <div className="bg-white/80 backdrop-blur-sm shadow-md rounded-xl p-4 mb-8 flex flex-col sm:flex-row gap-4 sm:gap-2 justify-between items-center">
            <nav className="flex items-center gap-2 flex-wrap">
                <NavButton activeView={view} targetView="calculator" label="Calculadora" onClick={() => setView('calculator')} disabled={isLoading} />
                <NavButton activeView={view} targetView="history" label="Histórico" onClick={() => setView('history')} disabled={isLoading} />
                <NavButton activeView={view} targetView="charts" label="Gráficos" onClick={() => setView('charts')} disabled={isLoading} />
                <NavButton activeView={view} targetView="insights" label="Insights" onClick={() => setView('insights')} disabled={isLoading || isGenerating} />
            </nav>
            {view === 'calculator' && (
                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    {calculatorMode !== 'new' && (
                         <button onClick={handleExitCalculatorMode} disabled={isSaving} className="px-6 py-2.5 bg-slate-500 text-white hover:bg-slate-600 rounded-lg transition-colors font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                           {calculatorMode === 'view' ? 'Voltar' : 'Cancelar Edição'}
                        </button>
                    )}
                    <button onClick={handleSaveOrUpdateSummary} disabled={calculatorMode === 'view' || isSaving} className="px-6 py-2.5 bg-green-500 text-white hover:bg-green-600 rounded-lg transition-colors font-semibold shadow-md hover:shadow-lg disabled:bg-slate-300 disabled:cursor-not-allowed">
                       {isSaving ? (calculatorMode === 'edit' ? 'Atualizando...' : 'Salvando...') : (calculatorMode === 'edit' ? 'Atualizar Resumo' : 'Salvar Resumo')}
                    </button>
                </div>
            )}
            {view !== 'calculator' && (
              <button onClick={() => { resetCalculatorState(); setView('calculator'); }} className="px-6 py-2.5 bg-teal-500 text-white hover:bg-teal-600 rounded-lg transition-colors font-semibold shadow-md hover:shadow-lg mt-4 sm:mt-0">
                  + Novo Resumo
              </button>
            )}
        </div>
        
        {isLoading ? (
             <div className="flex items-center justify-center p-16 bg-white rounded-xl shadow-xl">
                 <div className="text-center">
                     <svg className="mx-auto h-10 w-10 text-teal-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <h2 className="mt-4 text-lg font-semibold text-slate-600">Carregando histórico...</h2>
                </div>
            </div>
        ) : renderView()}

      </div>
    </div>
  );
};

export default App;