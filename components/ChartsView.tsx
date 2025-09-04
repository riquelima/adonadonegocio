import React, { useMemo } from 'react';
import { HistoryEntry } from '../types';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartsViewProps {
  history: HistoryEntry[];
}

const formatCurrency = (value: number): string => {
    const isNegative = value < 0;
    const absoluteValue = Math.abs(value);
    return `${isNegative ? '- ' : ''}$ ${absoluteValue.toFixed(2).replace('.', ',')}`;
};

const KPI_CARD_STYLES = "bg-white shadow-lg rounded-xl p-4 sm:p-6 text-center";
const KPI_LABEL_STYLES = "text-xs sm:text-sm text-slate-500 uppercase tracking-wider font-semibold";
const KPI_VALUE_STYLES = "text-2xl sm:text-3xl font-bold mt-2";
const CHART_CONTAINER_STYLES = "bg-white shadow-lg rounded-xl p-4 sm:p-6";

const ChartTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-base sm:text-lg font-bold text-[#0D2B3E] mb-4 text-center">{children}</h3>
);

const ChartsView: React.FC<ChartsViewProps> = ({ history }) => {
    const monthlyData = useMemo(() => {
        const groups = history.reduce((acc, entry) => {
            const date = new Date(entry.isoDate);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
            
            if (!acc[key]) {
                acc[key] = {
                    label: date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }),
                    Receita: 0,
                    Despesa: 0,
                    Lucro: 0,
                };
            }
            acc[key].Receita += entry.receipts;
            acc[key].Despesa += entry.expenses;
            acc[key].Lucro += entry.profit;
            return acc;
        }, {} as Record<string, { label: string; Receita: number; Despesa: number; Lucro: number }>);
        
        return Object.entries(groups).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)).map(([, value]) => value);
    }, [history]);

    const expenseCompositionData = useMemo(() => {
        const expenseMap = new Map<string, number>();
        history.forEach(entry => {
            entry.snapshot.fixedExpenses.forEach(expense => {
                expenseMap.set(expense.label, (expenseMap.get(expense.label) || 0) + expense.value);
            });
            entry.snapshot.contingencyCosts.forEach(expense => {
                expenseMap.set(expense.label, (expenseMap.get(expense.label) || 0) + expense.value);
            });
        });

        const sortedExpenses = [...expenseMap.entries()].sort(([, a], [, b]) => b - a);
        const top7 = sortedExpenses.slice(0, 7);
        const othersValue = sortedExpenses.slice(7).reduce((acc, [, value]) => acc + value, 0);
        
        const data = top7.map(([label, value]) => ({ name: label, value }));
        
        if (othersValue > 0) {
            data.push({ name: 'Outras', value: othersValue });
        }
        
        return data;
    }, [history]);

    const kpis = useMemo(() => {
        return history.reduce((acc, entry) => {
            acc.totalReceipts += entry.receipts;
            acc.totalExpenses += entry.expenses;
            acc.totalProfit += entry.profit;
            return acc;
        }, { totalReceipts: 0, totalExpenses: 0, totalProfit: 0 });
    }, [history]);

    if (history.length === 0) {
        return (
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#0D2B3E]">Gráficos</h2>
                    <p className="text-slate-500 mt-1">Painel visual da saúde do seu negócio.</p>
                </header>
                <div className="bg-white shadow-xl rounded-xl p-8 text-center">
                    <h3 className="text-xl font-semibold text-slate-700">Nenhum dado para exibir.</h3>
                    <p className="text-slate-500 mt-2">Salve seu primeiro resumo diário para começar a ver os gráficos.</p>
                </div>
            </div>
        );
    }
    
    const COLORS = ['#14b8a6', '#0d9488', '#f97316', '#ea580c', '#3b82f6', '#2563eb', '#6366f1', '#a855f7'];
    const tickFormatter = (value: number) => `$${(value/1000).toFixed(0)}k`;
    const tooltipFormatter = (value: number) => [formatCurrency(value), ''];

    return (
        <div className="space-y-8">
            <header className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0D2B3E]">Painel de Gráficos</h2>
                <p className="text-slate-500 mt-1">Visão panorâmica da saúde do seu negócio em tempo real.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className={KPI_CARD_STYLES}>
                    <p className={KPI_LABEL_STYLES}>Receita Total</p>
                    <p className={`${KPI_VALUE_STYLES} text-teal-500`}>{formatCurrency(kpis.totalReceipts)}</p>
                </div>
                <div className={KPI_CARD_STYLES}>
                    <p className={KPI_LABEL_STYLES}>Despesa Total</p>
                    <p className={`${KPI_VALUE_STYLES} text-orange-500`}>{formatCurrency(kpis.totalExpenses)}</p>
                </div>
                <div className={KPI_CARD_STYLES}>
                    <p className={KPI_LABEL_STYLES}>Lucro Total</p>
                    <p className={`${KPI_VALUE_STYLES} ${kpis.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(kpis.totalProfit)}</p>
                </div>
            </div>

            <div className={CHART_CONTAINER_STYLES}>
                <ChartTitle>Evolução Mensal (Receita, Despesa e Lucro)</ChartTitle>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={tickFormatter} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={tooltipFormatter} />
                        <Legend />
                        <Line type="monotone" dataKey="Receita" stroke="#14b8a6" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Despesa" stroke="#f97316" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Lucro" stroke="#22c55e" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                <div className={`${CHART_CONTAINER_STYLES} lg:col-span-2`}>
                    <ChartTitle>Composição das Despesas</ChartTitle>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={expenseCompositionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%">
                                {expenseCompositionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={tooltipFormatter} />
                            <Legend wrapperStyle={{fontSize: "12px", paddingTop: "20px"}}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className={`${CHART_CONTAINER_STYLES} lg:col-span-3`}>
                    <ChartTitle>Receita vs. Despesa Mensal</ChartTitle>
                    <ResponsiveContainer width="100%" height={300}>
                       <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                            <YAxis tickFormatter={tickFormatter} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={tooltipFormatter} />
                            <Legend />
                            <Bar dataKey="Receita" fill="#14b8a6" radius={[5, 5, 0, 0]} />
                            <Bar dataKey="Despesa" fill="#f97316" radius={[5, 5, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ChartsView;