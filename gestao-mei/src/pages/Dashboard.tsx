import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Target, Loader2, ArrowUpRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FinancialChart from '../components/dashboard/FinancialChart';
import { supabase } from '../lib/supabase';
import { startStripeCheckout } from '../lib/stripe';

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const [stats, setStats] = useState([
        { label: 'Faturamento Anual', value: 'R$ 0,00', icon: TrendingUp, color: 'text-green-400', raw: 0 },
        { label: 'Despesas Totais', value: 'R$ 0,00', icon: TrendingDown, color: 'text-red-400', raw: 0 },
        { label: 'Lucro Líquido', value: 'R$ 0,00', icon: Wallet, color: 'text-primary', raw: 0 },
    ]);

    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) return;

            // PASSO 2: Capturar na Chegada (Estratégia infalível via localStorage)
            const pendingPrice = localStorage.getItem('checkout_price_id');
            if (pendingPrice && pendingPrice.startsWith('price_')) {
                console.log('Resgatando intenção do localStorage:', pendingPrice);
                localStorage.removeItem('checkout_price_id');

                setCheckoutLoading(true);
                const success = await startStripeCheckout(pendingPrice, currentUser.id, currentUser.email || '');
                if (!success) {
                    setCheckoutLoading(false);
                }
            }

            // Se retornar do Stripe com sucesso
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
            } else if (data) {
                const income = data.filter(t => t.tipo.includes('Receita')).reduce((acc, t) => acc + t.valor, 0);
                const expense = data.filter(t => t.tipo.includes('Despesa')).reduce((acc, t) => acc + t.valor, 0);
                const profit = income - expense;

                setStats([
                    { label: 'Faturamento Anual', value: `R$ ${income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-green-400', raw: income },
                    { label: 'Despesas Totais', value: `R$ ${expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingDown, color: 'text-red-400', raw: expense },
                    { label: 'Lucro Líquido', value: `R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: Wallet, color: 'text-primary', raw: profit },
                ]);
            }
            setLoading(false);
        };

        fetchData();
    }, [sessionId, navigate]);

    const limitPercentage = Math.min(Math.round((stats[0].raw / 81000) * 100), 100);

    if (loading || checkoutLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
                <Loader2 className="animate-spin text-primary" size={48} />
                <div className="text-center">
                    <p className="text-white font-black text-xl mb-1">
                        {checkoutLoading ? 'Redirecionando para o pagamento...' : 'Carregando Dashboard...'}
                    </p>
                    <p className="text-white/40 text-sm font-medium px-4">
                        {checkoutLoading
                            ? 'Preparando seu ambiente de pagamento seguro via Stripe.'
                            : 'Gerenciando suas ferramentas financeiras...'}
                    </p>
                </div>

                {checkoutLoading && (
                    <button
                        onClick={() => {
                            setCheckoutLoading(false);
                            navigate('/dashboard', { replace: true });
                        }}
                        className="mt-4 px-6 py-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-2xl border border-white/10 transition-all font-bold text-sm"
                    >
                        Cancelar e Voltar ao Dashboard
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header com Saudação */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Painel de Controle</h1>
                    <p className="text-white/40 font-bold mt-1">Acompanhe a saúde financeira do seu MEI em tempo real.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                        <p className="text-[10px] uppercase tracking-widest font-black text-white/30 mb-0.5">Ano Fiscal</p>
                        <p className="text-white font-black">2024</p>
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
                        {/* Efeito de Gradiente no Fundo */}
                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Gráfico de Evolução Financeira */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-white">Evolução de Caixa</h3>
                            <p className="text-white/40 text-sm font-bold">Fluxo de caixa dos últimos 6 meses</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-2 text-xs font-bold text-white/40">
                                <span className="w-2 h-2 rounded-full bg-green-400"></span> Receitas
                            </span>
                            <span className="flex items-center gap-2 text-xs font-bold text-white/40">
                                <span className="w-2 h-2 rounded-full bg-red-400"></span> Despesas
                            </span>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <FinancialChart />
                    </div>
                </div>

                {/* Card de Monitoramento de Limite */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                <Target size={24} />
                            </div>
                            <h3 className="text-xl font-black text-white">Limite MEI</h3>
                        </div>

                        <div className="space-y-6 flex-grow">
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Progresso</p>
                                    <p className="text-2xl font-black text-white">{limitPercentage}%</p>
                                </div>
                                <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-[#ff8585] transition-all duration-1000 shadow-[0_0_15px_rgba(246,85,85,0.3)]"
                                        style={{ width: `${limitPercentage}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <span className="text-white/40 font-bold text-sm">Faturamento Atual</span>
                                    <span className="text-white font-black">{stats[0].value}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <span className="text-white/40 font-bold text-sm">Limite Disponível</span>
                                    <span className="text-white font-black">
                                        R$ {(81000 - stats[0].raw).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                                <p className="text-primary text-xs font-black leading-relaxed">
                                    DICA: Mantenha seu faturamento abaixo de R$ 81.000,00 anuais para permanecer no regime MEI.
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Target size={120} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
