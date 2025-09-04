import React, { useState } from 'react';
import { HistoryEntry, InsightData } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface InsightsViewProps {
  history: HistoryEntry[];
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  setNotification: (notification: { message: string; type: 'success' | 'error' }) => void;
}

const formatCurrency = (value: number): string => {
    const isNegative = value < 0;
    const absoluteValue = Math.abs(value);
    return `${isNegative ? '- ' : ''}$ ${absoluteValue.toFixed(2).replace('.', ',')}`;
};

const KPI_CARD_STYLES = "bg-white shadow-lg rounded-xl p-4 sm:p-6 text-center";
const KPI_LABEL_STYLES = "text-xs sm:text-sm text-slate-500 uppercase tracking-wider font-semibold";
const KPI_VALUE_STYLES = "text-2xl sm:text-3xl font-bold mt-2";

const InsightsView: React.FC<InsightsViewProps> = ({ history, isGenerating, setIsGenerating, setNotification }) => {
    const [insights, setInsights] = useState<InsightData | null>(null);

    const handleGenerateInsights = async () => {
        if (history.length < 1) {
            setNotification({ message: 'É necessário ter pelo menos um resumo salvo para gerar insights.', type: 'error' });
            return;
        }

        setIsGenerating(true);
        setInsights(null);

        try {
            const ai = new GoogleGenAI({ apiKey: "AIzaSyCsX9l10XCu3TtSCU1BSx-qOYrwUKYw2xk" });
            
            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    kpis: {
                        type: Type.OBJECT,
                        properties: {
                            totalReceipts: { type: Type.NUMBER, description: "Soma total de todos os 'receipts' dos resumos." },
                            totalExpenses: { type: Type.NUMBER, description: "Soma total de todas as 'expenses' dos resumos." },
                            totalProfit: { type: Type.NUMBER, description: "Soma total de todos os 'profit' dos resumos." },
                            averageProfitMargin: { type: Type.NUMBER, description: "Média da margem de lucro. Calcule (totalProfit / totalReceipts) * 100. Retorne 0 se a receita for 0." }
                        },
                    },
                    costAnalysis: {
                        type: Type.OBJECT,
                        properties: {
                            topExpenses: {
                                type: Type.ARRAY,
                                description: "Um array com as 5 maiores despesas agregadas de todos os resumos. Some os valores de despesas com o mesmo 'label' de todos os 'snapshot.fixedExpenses' e 'snapshot.contingencyCosts'.",
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        label: { type: Type.STRING },
                                        value: { type: Type.NUMBER }
                                    },
                                }
                            }
                        },
                    },
                    alerts: {
                        type: Type.ARRAY,
                        description: "Um array de 3 a 5 strings com insights e alertas acionáveis em português do Brasil. Seja direto e prático. Exemplo: 'Seu custo com veículo representa X% das despesas. Reduzir em 10% pode aumentar seu lucro em R$ Y.'",
                        items: { type: Type.STRING }
                    }
                },
            };

            const prompt = `Você é um analista financeiro especialista em pequenos negócios de limpeza (house cleaning). Analise os dados históricos fornecidos, que estão em formato JSON de um array de resumos diários. Sua tarefa é extrair KPIs, analisar a estrutura de custos e gerar alertas inteligentes para o dono do negócio. Retorne sua análise estritamente no formato JSON definido no schema. Não adicione nenhuma explicação ou texto fora do JSON. Principais pontos a analisar: 1. KPIs: Calcule os totais de recebimentos, despesas e lucro somando os valores de todos os resumos. Calcule a margem de lucro média. 2. Análise de Custos: Identifique as despesas mais significativas. Para isso, agregue (some) os valores de todas as despesas que têm o mesmo 'label' (rótulo) em todos os 'snapshot' dos resumos. Retorne as 5 despesas com os maiores totais. 3. Alertas: Com base nos dados, gere de 3 a 5 alertas ou recomendações acionáveis. Compare despesas com receitas, identifique tendências e sugira pontos de melhoria. Seja conciso e use valores monetários para exemplificar o impacto. Aqui estão os dados: ${JSON.stringify(history)}`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema,
                }
            });

            const generatedText = response.text.trim();
            const parsedInsights: InsightData = JSON.parse(generatedText);
            setInsights(parsedInsights);

        } catch (error) {
            console.error("Error generating insights:", error);
            setNotification({ message: 'Ocorreu um erro ao gerar os insights. Tente novamente.', type: 'error' });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0D2B3E]">Insights com IA</h2>
                <p className="text-slate-500 mt-1">Analise seus dados para tomar decisões mais inteligentes.</p>
            </header>

            {!insights && !isGenerating && (
                 <div className="bg-white shadow-xl rounded-xl p-8 text-center">
                    <h3 className="text-xl font-semibold text-slate-700">Pronto para analisar seu negócio?</h3>
                    <p className="text-slate-500 mt-2 mb-6 max-w-2xl mx-auto">Clique no botão abaixo para que a Inteligência Artificial analise seu histórico de resumos e gere gráficos, KPIs e recomendações para otimizar seus resultados.</p>
                    <button onClick={handleGenerateInsights} disabled={isGenerating} className="px-8 py-3 bg-teal-500 text-white hover:bg-teal-600 rounded-lg transition-colors font-semibold shadow-lg hover:shadow-xl disabled:bg-slate-300 disabled:cursor-not-allowed">
                        {isGenerating ? 'Gerando...' : 'Gerar Insights com IA'}
                    </button>
                </div>
            )}
            
            {isGenerating && (
                <div className="flex flex-col items-center justify-center p-16 bg-white rounded-xl shadow-xl">
                     <svg className="mx-auto h-10 w-10 text-teal-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <h2 className="mt-4 text-lg font-semibold text-slate-600">Analisando seus dados...</h2>
                    <p className="text-slate-500">A IA está processando seu histórico. Isso pode levar alguns segundos.</p>
                </div>
            )}

            {insights && (
                <div className="space-y-8 animate-fade-in-down">
                     {/* KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        <div className={KPI_CARD_STYLES}>
                            <p className={KPI_LABEL_STYLES}>Receita Total</p>
                            <p className={`${KPI_VALUE_STYLES} text-teal-500`}>{formatCurrency(insights.kpis.totalReceipts)}</p>
                        </div>
                        <div className={KPI_CARD_STYLES}>
                            <p className={KPI_LABEL_STYLES}>Despesa Total</p>
                            <p className={`${KPI_VALUE_STYLES} text-orange-500`}>{formatCurrency(insights.kpis.totalExpenses)}</p>
                        </div>
                        <div className={KPI_CARD_STYLES}>
                            <p className={KPI_LABEL_STYLES}>Lucro Total</p>
                            <p className={`${KPI_VALUE_STYLES} ${insights.kpis.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(insights.kpis.totalProfit)}</p>
                        </div>
                         <div className={KPI_CARD_STYLES}>
                            <p className={KPI_LABEL_STYLES}>Margem Média</p>
                            <p className={`${KPI_VALUE_STYLES} ${insights.kpis.averageProfitMargin >= 0 ? 'text-blue-500' : 'text-red-500'}`}>{insights.kpis.averageProfitMargin.toFixed(2)}%</p>
                        </div>
                    </div>
                    {/* Chart and Alerts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6">
                            <h3 className="text-lg font-bold text-[#0D2B3E] mb-4 text-center">Top 5 Maiores Despesas</h3>
                             <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={insights.costAnalysis.topExpenses} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" tickFormatter={(value) => `$${value.toLocaleString('pt-BR')}`} />
                                    <YAxis type="category" dataKey="label" width={100} interval={0} tick={{ fontSize: 10 }} />
                                    <Tooltip formatter={(value: number) => [formatCurrency(value), 'Custo Total']} />
                                    <Bar dataKey="value" name="Custo Total" fill="#14b8a6" radius={[0, 5, 5, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                         <div className="bg-white shadow-lg rounded-xl p-6">
                             <h3 className="text-lg font-bold text-[#0D2B3E] mb-4">Alertas Inteligentes</h3>
                             <ul className="space-y-3">
                                {insights.alerts.map((alert, index) => (
                                    <li key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-slate-700 text-sm">{alert}</p>
                                    </li>
                                ))}
                             </ul>
                        </div>
                    </div>
                    <div className="text-center mt-6">
                        <button onClick={handleGenerateInsights} disabled={isGenerating} className="px-8 py-3 bg-teal-500 text-white hover:bg-teal-600 rounded-lg transition-colors font-semibold shadow-lg hover:shadow-xl disabled:bg-slate-300 disabled:cursor-not-allowed">
                            {isGenerating ? 'Gerando...' : 'Gerar Novos Insights'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InsightsView;