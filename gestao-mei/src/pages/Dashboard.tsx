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
    const priceId = searchParams.get('priceId');
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const [stats, setStats] = useState([
        { label: 'Faturamento Anual', value: 'R$ 0,00', icon: TrendingUp, color: 'text-green-400', raw: 0 },
        { label: 'Despesas Totais', value: 'R$ 0,00', icon: TrendingDown, color: 'text-red-400', raw: 0 },
        { label: 'Lucro Líquido', value: 'R$ 0,00', icon: Wallet, color: 'text-primary', raw: 0 },
    ]);

    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Interceptação Agressiva: Se houver intent na URL (vindo de cliques diretos já logado)
            if (priceId && !sessionId) {
                setCheckoutLoading(true);
                const success = await startStripeCheckout(priceId, user.id, user.email || '');
                if (!success) setCheckoutLoading(false);
                return;
            }

            // Se retornar do Stripe com sucesso
            if (sessionId) {
                // Removemos o parâmetro da URL de forma "silenciosa"
                navigate('/dashboard', { replace: true });
                alert('Assinatura confirmada! Seu Plano Pro já está ativo. Aproveite os recursos ilimitados.');
            }

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
                    { label: 'Faturamento Anual', value: `R$ ${income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-green-400', raw: income },
                    { label: 'Despesas Totais', value: `R$ ${expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingDown, color: 'text-red-400', raw: expense },
                    { label: 'Lucro Líquido', value: `R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: Wallet, color: 'text-primary', raw: profit },
                ]);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    const limitPercentage = Math.min(Math.round((stats[0].raw / 81000) * 100), 100);

    if (loading || checkoutLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-white/40 font-bold animate-pulse">
                    {checkoutLoading ? 'Preparando seu Checkout Seguro...' : 'Carregando Dashboard...'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight">Raio-X da Empresa</h1>
                    <p className="text-white/40 mt-1 font-medium">Gestão inteligente para o seu negócio.</p>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40">
                    Status: Operacional
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className="bg-white/[0.03] border border-white/5 p-8 rounded-[32px] hover:bg-white/[0.05] transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full" />
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[10px] font-black text-white uppercase tracking-[2px]">{stat.label}</span>
                            <div className={`p-2 rounded-xl bg-white/5 ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <div className="text-3xl font-black tracking-tighter mb-2 text-white">{stat.value}</div>
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tight">
                            <ArrowUpRight
                                size={12}
                                className={
                                    stat.label.includes('Despesa') || (stat.label.includes('Lucro') && stat.raw < 0)
                                        ? 'text-red-500'
                                        : 'text-green-500'
                                }
                            />
                            <span className={
                                stat.label.includes('Despesa') || (stat.label.includes('Lucro') && stat.raw < 0)
                                    ? 'text-red-500'
                                    : 'text-green-500'
                            }>
                                {stat.label.includes('Despesa') ? 'Saída de Caixa' : stat.label.includes('Lucro') && stat.raw < 0 ? 'Alerta: Prejuízo' : '+0% em relação ao anterior'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 p-10 rounded-[40px] flex flex-col min-h-[450px]">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-black tracking-tight">Evolução de Caixa</h2>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="text-[10px] font-black text-white/40 uppercase">Receitas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-white/20" />
                                <span className="text-[10px] font-black text-white/40 uppercase">Despesas</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full">
                        <FinancialChart />
                    </div>
                </div>

                <div className="bg-white/[0.03] border border-white/5 p-10 rounded-[40px] flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="w-48 h-48 relative mb-8">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="96"
                                cy="96"
                                r="80"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="16"
                                className="text-white/5"
                            />
                            <circle
                                cx="96"
                                cy="96"
                                r="80"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="16"
                                strokeDasharray={502.6}
                                strokeDashoffset={502.6 - (502.6 * limitPercentage) / 100}
                                className="text-primary transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(246,85,85,0.4)]"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black tracking-tighter">{limitPercentage}%</span>
                            <span className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">Limite MEI</span>
                        </div>
                    </div>

                    <h3 className="text-xl font-black mb-3">Teto Faturamento</h3>
                    <p className="text-xs text-white/40 leading-relaxed max-w-[200px] mb-8 font-medium">
                        Você atingiu <span className="text-white/80 font-black">{stats[0].value}</span> dos R$ 81.000,00 anuais permitidos.
                    </p>

                    <div className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-4 text-left">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                            <Target size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-[2px] mb-0.5">ESTRATÉGIA</p>
                            <p className="text-[11px] font-bold text-white/50 leading-tight">
                                {limitPercentage < 80 ? 'Otimize seus impostos para crescer.' : 'Considere migrar para ME em breve.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
