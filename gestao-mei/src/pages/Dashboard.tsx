import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Target, Loader2 } from 'lucide-react';
import FinancialChart from '../components/dashboard/FinancialChart';
import { supabase } from '../lib/supabase';

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([
        { label: 'Faturamento Anual', value: 'R$ 0,00', icon: TrendingUp, color: 'text-green-400', border: 'border-green-400/50', raw: 0 },
        { label: 'Despesas Totais', value: 'R$ 0,00', icon: TrendingDown, color: 'text-red-400', border: 'border-red-400/50', raw: 0 },
        { label: 'Lucro Líquido', value: 'R$ 0,00', icon: Wallet, color: 'text-primary', border: 'border-primary/50', raw: 0 },
    ]);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('transacoes')
                .select('*')
                .eq('user_id', user.id);

            if (error) {
                console.error(error);
            } else if (data) {
                const income = data.filter(t => t.tipo.includes('Receita')).reduce((acc, t) => acc + t.valor, 0);
                const expense = data.filter(t => t.tipo.includes('Despesa')).reduce((acc, t) => acc + t.valor, 0);
                const profit = income - expense;

                setStats([
                    { label: 'Faturamento Anual', value: `R$ ${income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-green-400', border: 'border-green-400/50', raw: income },
                    { label: 'Despesas Totais', value: `R$ ${expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingDown, color: 'text-red-400', border: 'border-red-400/50', raw: expense },
                    { label: 'Lucro Líquido', value: `R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: Wallet, color: 'text-primary', border: 'border-primary/50', raw: profit },
                ]);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    const limitPercentage = Math.min(Math.round((stats[0].raw / 81000) * 100), 100);

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-extrabold mb-1">Raio-X da Sua Empresa</h1>
                <p className="text-white/60">Acompanhe seu desempenho financeiro em tempo real</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className={`bg-white/5 border-t-4 ${stat.border} p-6 rounded-xl backdrop-blur-sm transition-transform hover:-translate-y-1`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-white/40 uppercase tracking-wider">{stat.label}</span>
                            <stat.icon className={stat.color} size={24} />
                        </div>
                        <div className="text-3xl font-black">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/5 border border-white/10 p-6 rounded-xl min-h-[400px]">
                    <h2 className="text-xl font-bold mb-6">Evolução Financeira</h2>
                    <FinancialChart />
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex flex-col items-center justify-center text-center">
                    <div className="w-40 h-40 relative mb-6">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="12"
                                className="text-white/5"
                            />
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="12"
                                strokeDasharray={440}
                                strokeDashoffset={440 - (440 * limitPercentage) / 100}
                                className="text-primary transition-all duration-1000 ease-out"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black">{limitPercentage}%</span>
                            <span className="text-xs text-white/40 font-bold uppercase tracking-tighter">Limite MEI</span>
                        </div>
                    </div>
                    <h3 className="font-bold mb-2 text-lg">Limite Faturamento (81k)</h3>
                    <p className="text-sm text-white/60 px-4">
                        Você utilizou {limitPercentage}% do faturamento anual permitido para o MEI.
                    </p>
                    <div className="mt-8 w-full p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
                        <Target className="text-primary" size={24} />
                        <div className="text-left">
                            <p className="text-xs font-bold text-primary uppercase">Sugestão</p>
                            <p className="text-[11px] text-white/80 leading-tight">
                                {limitPercentage < 80 ? 'Continue assim! Você está bem dentro do limite.' : 'Atenção! Você está se aproximando do limite anual.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
