import React, { useEffect, useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, Loader2, ArrowUpRight, BarChart2, HelpCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { startStripeCheckout } from '../lib/stripe';
import FiscalHealthCard from '../components/dashboard/FiscalHealthCard';
import DASCountdown from '../components/dashboard/DASCountdown';
import PredictiveChart from '../components/dashboard/PredictiveChart';
import FeedbackHub from '../components/dashboard/FeedbackHub';

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get('session_id');

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-indexed

    const fetchData = async () => {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return;

        if (sessionId) {
            navigate('/dashboard', { replace: true });
            alert('Assinatura confirmada! Seu Plano Pro já está ativo. Aproveite os recursos ilimitados.');
        }

        const { data, error } = await supabase
            .from('transacoes')
            .select('*')
            .eq('user_id', currentUser.id);

        if (error) {
            console.error(error);
        } else {
            setTransactions(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        const handleFocus = () => fetchData();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [sessionId, navigate]);

    // --- Cálculos Financeiros ---
    const { income, expense, profit, mesesAtivos, projecaoAnual, chartData } = useMemo(() => {
        const thisYearTx = transactions.filter(t => new Date(t.data).getFullYear() === currentYear);

        const income = thisYearTx.filter(t => t.tipo?.includes('Receita')).reduce((acc, t) => acc + (t.valor || 0), 0);
        const expense = thisYearTx.filter(t => t.tipo?.includes('Despesa')).reduce((acc, t) => acc + (t.valor || 0), 0);
        const profit = income - expense;

        // Meses ativos: meses únicos com alguma transação de receita no ano atual
        const monthsWithIncome = new Set(
            thisYearTx
                .filter(t => t.tipo?.includes('Receita'))
                .map(t => new Date(t.data).getMonth())
        );
        const mesesAtivos = Math.max(1, monthsWithIncome.size);

        // Projeção anual baseada na média mensal
        const mediaMensal = income / mesesAtivos;
        const projecaoAnual = mediaMensal * 12;

        // Dados do gráfico — acumulado mês a mês
        let cumulativeFaturado = 0;
        const chartData = MONTH_NAMES.slice(0, currentMonth + 1).map((name, i) => {
            const monthRevenue = thisYearTx
                .filter(t => new Date(t.data).getMonth() === i && t.tipo?.includes('Receita'))
                .reduce((acc, t) => acc + (t.valor || 0), 0);
            cumulativeFaturado += monthRevenue;

            // Projeção linear simples
            const cumulativeProjection = mediaMensal * (i + 1);

            return {
                name,
                faturado: monthRevenue,
                cumulative: parseFloat(cumulativeFaturado.toFixed(2)),
                cumulativeProjection: parseFloat(cumulativeProjection.toFixed(2)),
            };
        });

        return { income, expense, profit, mesesAtivos, projecaoAnual, chartData };
    }, [transactions, currentYear, currentMonth]);

    const stats = [
        { label: 'Faturamento Anual', value: `R$ ${income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-green-400' },
        { label: 'Despesas Totais', value: `R$ ${expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingDown, color: 'text-red-400' },
        { label: 'Lucro Líquido', value: `R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: Wallet, color: profit >= 0 ? 'text-primary' : 'text-red-400' },
    ];

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
                <Loader2 className="animate-spin text-primary" size={48} />
                <div className="text-center">
                    <p className="text-white font-black text-xl mb-1">Carregando Dashboard...</p>
                    <p className="text-white/40 text-sm font-medium px-4">Calculando sua saúde fiscal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Painel de Controle</h1>
                    <p className="text-white/40 font-bold mt-1 flex items-center gap-2">
                        Inteligência preditiva para seu MEI. Limite 2026: R$ 81.000,00.
                        <span className="group relative">
                            <HelpCircle size={14} className="text-white/20 cursor-help hover:text-primary transition-colors" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white text-black text-[10px] font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl z-50 leading-relaxed">
                                <span className="text-primary block mb-1 uppercase font-black tracking-widest text-[8px]">Dicionário MEI</span>
                                O limite de R$ 81k refere-se ao faturamento BRUTO acumulado no ano, antes de descontar qualquer despesa.
                            </span>
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                        <p className="text-[10px] uppercase tracking-widest font-black text-white/30 mb-0.5">Ano Fiscal</p>
                        <p className="text-white font-black">{currentYear}</p>
                    </div>
                </div>
            </div>

            {/* Grid de Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="group relative bg-white/5 border border-white/10 p-6 rounded-3xl overflow-hidden hover:bg-white/[0.07] transition-all hover:border-white/20">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 bg-white/5 rounded-2xl ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={24} />
                                </div>
                                <div className="flex items-center gap-1 px-2 py-1 bg-green-400/10 rounded-lg">
                                    <ArrowUpRight size={12} className="text-green-400" />
                                    <span className="text-[10px] font-black text-green-400">ATIVO</span>
                                </div>
                            </div>
                            <p className="text-white/40 text-sm font-bold mb-1 uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-3xl font-black text-white tracking-tight">{stat.value}</h3>
                        </div>
                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))}
            </div>

            {/* Segunda linha: Gráfico Preditivo + Saúde Fiscal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Gráfico Preditivo */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-black text-white">Projeção de Faturamento</h3>
                            <p className="text-white/40 text-sm font-bold">Real acumulado vs. projeção anual (limite: R$ 81k)</p>
                        </div>
                        <div className="flex gap-4">
                            <span className="flex items-center gap-2 text-xs font-bold text-white/40">
                                <span className="w-3 h-3 rounded-full bg-green-400 inline-block" /> Real
                            </span>
                            <span className="flex items-center gap-2 text-xs font-bold text-white/40">
                                <span className="w-5 border-t-2 border-dashed border-primary inline-block" /> Projeção
                            </span>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <PredictiveChart data={chartData} />
                    </div>
                </div>

                {/* Card de Saúde Fiscal */}
                <FiscalHealthCard
                    faturamentoAtual={income}
                    projecaoAnual={projecaoAnual}
                    mesesAtivos={mesesAtivos}
                />
            </div>

            {/* Terceira linha: Widget DAS + Mini-stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* DAS Countdown */}
                <DASCountdown />

                {/* Mini stats extras */}
                <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-2xl text-primary">
                            <BarChart2 size={18} />
                        </div>
                        <h3 className="text-base font-black text-white">Inteligência MEI</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Média Mensal</p>
                            <p className="text-xl font-black text-white">
                                R$ {mesesAtivos > 0 ? (income / mesesAtivos).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}
                            </p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Meses Ativos</p>
                            <p className="text-xl font-black text-white">{mesesAtivos} <span className="text-sm text-white/40">/ 12</span></p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Margem Líquida</p>
                            <p className={`text-xl font-black ${income > 0 ? (profit / income > 0 ? 'text-green-400' : 'text-red-400') : 'text-white'}`}>
                                {income > 0 ? `${((profit / income) * 100).toFixed(1)}%` : '—'}
                            </p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Limite Restante</p>
                            <p className="text-xl font-black text-green-400">
                                R$ {Math.max(0, 81000 - income).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hub de Feedback */}
            <div className="pt-4 pb-12">
                <FeedbackHub />
            </div>
        </div>
    );
};

export default Dashboard;
