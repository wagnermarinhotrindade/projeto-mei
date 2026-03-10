import React, { useState, useEffect } from 'react';
import {
    Calendar,
    FilePlus,
    CheckCircle,
    TrendingUp,
    Filter,
    Download,
    MoreVertical,
    Loader2,
    AlertCircle,
    FileText,
    Zap,
    HelpCircle,
    Lock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { startStripeCheckout } from '../lib/stripe';

const Reports: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [activityType, setActivityType] = useState('Serviços');
    const [companyInfo, setCompanyInfo] = useState({ nome_empresa: 'Minha Empresa MEI', nome_completo: '', cnpj: '', cpf: '' });
    const [userPlan, setUserPlan] = useState('gratis');
    const [user, setUser] = useState<any>(null);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUser(user);

        // Fetch Plan Status
        const { data: profile } = await supabase
            .from('users_profile')
            .select('nome_empresa, nome_completo, plano, cnpj, cpf, plan_status')
            .eq('id', user.id)
            .single();

        if (profile) {
            setCompanyInfo({
                nome_empresa: profile.nome_empresa || 'Minha Empresa MEI',
                nome_completo: profile.nome_completo || '',
                cnpj: profile.cnpj || '',
                cpf: profile.cpf || ''
            });
            
            // SEGURANÇA: Verificação robusta de Pro baseada em plano e status
            const isActive = profile.plan_status === 'active' || profile.plan_status === 'pro';
            const isProPlan = ['pro', 'elite', 'elite_pro'].includes(profile.plano || '');
            setUserPlan(isActive && isProPlan ? profile.plano : 'gratis');
        }

        const { data, error } = await supabase
            .from('transacoes')
            .select('*')
            .eq('user_id', user.id)
            .order('data', { ascending: false });

        if (error) console.error(error);
        else setTransactions(data || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchData();

        // Sincronização Automática: Refresh quando o usuário volta para a aba do app
        const handleFocus = () => {
            console.log('App recuperou o foco. Atualizando dados do perfil...');
            fetchData();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    const handleUpgrade = async () => {
        if (!user) return;
        setCheckoutLoading(true);
        try {
            // Price ID do Plano Anual (R$ 197)
            const success = await startStripeCheckout('price_1T2d6SLjW93jPn5ye6wN7Ptg', user.id, user.email || '');
            if (!success) {
                setCheckoutLoading(false);
            }
        } catch (error) {
            setCheckoutLoading(false);
            console.error('Erro no checkout:', error);
        }
    };

    const isPro = ['pro', 'elite', 'elite_pro'].includes(userPlan);
    const filteredTransactions = transactions.filter(t => new Date(t.data).getFullYear() === selectedYear);
    const totalYTD = filteredTransactions.filter(t => t.tipo.includes('Receita')).reduce((acc, t) => acc + t.valor, 0);
    const totalExpenses = filteredTransactions.filter(t => t.tipo.includes('Despesa')).reduce((acc, t) => acc + t.valor, 0);
    const totalProfit = totalYTD - totalExpenses;
    const taxesPaid = filteredTransactions.filter(t => t.categoria === 'Impostos (DAS)').reduce((acc, t) => acc + t.valor, 0);

    // IRPF Simulator Logic
    const exemptRate = activityType === 'Serviços' ? 0.32 : 0.08;
    const exemptValue = totalYTD * exemptRate;
    const taxableValue = Math.max(0, totalProfit - exemptValue);

    const limitMEI = 81000;
    const limitPercentage = Math.min((totalYTD / limitMEI) * 100, 100);
    const ticketMedio = totalYTD / (filteredTransactions.filter(t => t.tipo.includes('Receita')).length || 1);

    // Lógica de agrupamento mensal — usa tipo_receita se disponível, senão fallback por categoria
    const monthlySummary = Array.from({ length: 12 }, (_, i) => {
        const monthTransactions = filteredTransactions.filter(t => new Date(t.data).getMonth() === i);
        const receitas = monthTransactions.filter(t => t.tipo?.includes('Receita'));
        const faturamentoBruto = receitas.reduce((acc, t) => acc + t.valor, 0);
        // Prioriza tipo_receita (novo campo), fallback para categoria
        const servicos = receitas
            .filter(t => t.tipo_receita === 'servico' || (!t.tipo_receita && t.categoria === 'Prestação de Serviço'))
            .reduce((acc, t) => acc + t.valor, 0);
        const comercio = receitas
            .filter(t => t.tipo_receita === 'comercio' || (!t.tipo_receita && t.categoria === 'Venda de Produto'))
            .reduce((acc, t) => acc + t.valor, 0);

        return {
            monthIndex: i,
            monthName: new Date(selectedYear, i).toLocaleDateString('pt-BR', { month: 'long' }),
            faturamentoBruto,
            servicos,
            comercio,
            hasData: monthTransactions.length > 0
        };
    }).filter(m => m.hasData).reverse();

    const handleGenerateReport = () => {
        if (!isPro) {
            alert('RECURSO PRO: A emissão de relatórios DASN em PDF está disponível apenas para assinantes do Plano Pro.');
            return;
        }
        const doc = new jsPDF();
        const dateStr = new Date().toLocaleDateString('pt-BR');
        const primaryColor = [246, 85, 85]; // #f65555

        // --- PÁGINA 1: RESUMO EXECUTIVO ---
        doc.setFontSize(22);
        doc.setTextColor(40);
        doc.setFont('helvetica', 'bold');
        doc.text('Relatório Anual de Faturamento MEI', 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        doc.text(`Ano Base: ${selectedYear}`, 14, 30);
        doc.text(`Gerado em: ${dateStr}`, 14, 35);

        // Header Border
        doc.setDrawColor(230);
        doc.line(14, 40, 196, 40);

        // Company Details
        doc.setFontSize(14);
        doc.setTextColor(40);
        doc.setFont('helvetica', 'bold');
        doc.text(companyInfo.nome_empresa, 14, 52);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`Titular: ${companyInfo.nome_completo || 'Não informado'}`, 14, 60);
        doc.text(`CNPJ: ${companyInfo.nome_empresa ? companyInfo.cnpj : '—'}`, 14, 66);
        doc.text(`CPF: ${companyInfo.nome_completo ? companyInfo.cpf : '—'}`, 14, 72);

        // Total Accumulated Box
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, 80, 182, 35, 3, 3, 'F');

        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.setFont('helvetica', 'bold');
        doc.text('FATURAMENTO BRUTO TOTAL ACUMULADO (MÉDIA: R$ ' + (totalYTD/12).toLocaleString('pt-BR', {minimumFractionDigits: 2}) + '/mês)', 20, 90);

        doc.setFontSize(26);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(`R$ ${totalYTD.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, 105);

        // Monthly Table
        const tableBody = Array.from({ length: 12 }, (_, i) => {
            const m = Array.from({ length: 12 }, (_, idx) => {
                const monthTransactions = filteredTransactions.filter(t => new Date(t.data).getMonth() === idx);
                const receitas = monthTransactions.filter(t => t.tipo?.includes('Receita'));
                const servicos = receitas
                    .filter(t => t.tipo_receita === 'servico' || (!t.tipo_receita && t.categoria === 'Prestação de Serviço'))
                    .reduce((acc, t) => acc + t.valor, 0);
                const comercio = receitas
                    .filter(t => t.tipo_receita === 'comercio' || (!t.tipo_receita && t.categoria === 'Venda de Produto'))
                    .reduce((acc, t) => acc + t.valor, 0);
                return {
                    name: new Date(selectedYear, idx).toLocaleDateString('pt-BR', { month: 'long' }),
                    servicos,
                    comercio,
                    total: servicos + comercio
                };
            })[i];

            return [
                m.name.charAt(0).toUpperCase() + m.name.slice(1),
                `R$ ${m.servicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                `R$ ${m.comercio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                `R$ ${m.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            ];
        });

        autoTable(doc, {
            startY: 125,
            head: [['Mês de Referência', 'Receita Serviços', 'Receita Comércio', 'Total Mensal']],
            body: tableBody,
            headStyles: { fillColor: primaryColor as [number, number, number], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [250, 250, 250] },
            margin: { left: 14, right: 14 },
            styles: { fontSize: 9, cellPadding: 4 },
            columnStyles: {
                1: { halign: 'right' },
                2: { halign: 'right' },
                3: { halign: 'right', fontStyle: 'bold' }
            },
            foot: [[
                'TOTAL ACUMULADO', 
                `R$ ${filteredTransactions.filter(t => t.tipo?.includes('Receita') && (t.tipo_receita === 'servico' || (!t.tipo_receita && t.categoria === 'Prestação de Serviço'))).reduce((acc, t) => acc + t.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                `R$ ${filteredTransactions.filter(t => t.tipo?.includes('Receita') && (t.tipo_receita === 'comercio' || (!t.tipo_receita && t.categoria === 'Venda de Produto'))).reduce((acc, t) => acc + t.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                `R$ ${totalYTD.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            ]],
            footStyles: { fillColor: [60, 60, 60], textColor: 255, fontStyle: 'bold' }
        });

        // Legal Footer (Page 1)
        const page1Height = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.setFont('helvetica', 'italic');
        doc.text('Este documento é um controle gerencial interno e não substitui a emissão de notas fiscais obrigatórias.', 14, page1Height - 15);
        doc.text('MEI Survival Assistant - Proteção Fiscal e Inteligência Preditiva', 14, page1Height - 10);

        // --- PÁGINA 2: AUDITORIA DE LANÇAMENTOS ---
        doc.addPage();
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.setFont('helvetica', 'bold');
        doc.text('Página de Auditoria', 14, 22);
        
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        doc.text('Lista detalhada de todos os lançamentos que compõem o faturamento declarado.', 14, 30);

        const auditBody = filteredTransactions
            .filter(t => t.tipo?.includes('Receita'))
            .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
            .map(t => [
                new Date(t.data).toLocaleDateString('pt-BR'),
                t.descricao || 'S/ Descrição',
                t.categoria || 'Geral',
                t.tipo_receita === 'servico' ? 'Serviço' : 'Comércio',
                t.comprovante_url ? 'Sim' : 'Não',
                `R$ ${t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            ]);

        autoTable(doc, {
            startY: 40,
            head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Anexo', 'Valor']],
            body: auditBody,
            headStyles: { fillColor: [100, 100, 100], textColor: 255 },
            styles: { fontSize: 8 },
            columnStyles: {
                5: { halign: 'right', fontStyle: 'bold' }
            }
        });

        // Legal Footer (Page 2)
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Este documento é um controle gerencial interno e não substitui a emissão de notas fiscais obrigatórias.', 14, page1Height - 15);

        // Save
        doc.save(`Relatorio-DASN-Elite-${selectedYear}.pdf`);
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Bloqueio Premium para Usuários Free */}
            {!isPro && (
                <div className="absolute inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-[40px]" />
                    <div className="relative bg-[#1a1a1a] border border-primary/30 p-10 md:p-16 rounded-[40px] shadow-2xl shadow-primary/20 text-center max-w-2xl animate-in zoom-in-95 duration-500 group">
                        <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary mx-auto mb-8 border border-primary/20 group-hover:scale-110 transition-transform">
                            {checkoutLoading ? <Loader2 className="animate-spin" size={40} /> : <Zap size={40} fill="currentColor" />}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black mb-6">Desbloqueie o Gestão MEI por 1 ano!</h2>
                        <p className="text-lg text-white/60 mb-10 leading-relaxed">
                            Organize seu MEI como um profissional o ano inteiro. Assine o <span className="text-white font-bold">Plano Pro Anual por R$ 197,00</span> e tenha relatórios DASN em PDF, lançamentos ilimitados, controle do limite de 81k e suporte prioritário.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={handleUpgrade}
                                disabled={checkoutLoading}
                                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all hover:-translate-y-1 shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
                            >
                                {checkoutLoading ? <Loader2 className="animate-spin" size={24} /> : 'Assinar Anual (R$ 197)'}
                            </button>
                            <button
                                onClick={() => window.location.href = '/dashboard'}
                                disabled={checkoutLoading}
                                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all"
                            >
                                Agora não
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ${!isPro ? 'opacity-20 pointer-events-none filter blur-[2px]' : ''}`}>
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight">Impostos e Relatórios</h1>
                        <p className="text-white/40 mt-1 font-medium">Acompanhe sua conformidade fiscal e limites anuais.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all outline-none appearance-none text-white overflow-hidden cursor-pointer"
                        >
                            {[2023, 2024, 2025, 2026].map(year => (
                                <option key={year} value={year} className="bg-background text-white">{year} (Jan - Dez)</option>
                            ))}
                        </select>
                        <button
                            onClick={handleGenerateReport}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black shadow-lg transition-all ${isPro ? 'bg-primary text-white shadow-primary/30 hover:-translate-y-1' : 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed hover:bg-white/10'}`}
                            title={isPro ? '' : 'Disponível apenas no plano Elite Pro'}
                        >
                            {isPro ? <FileText size={18} /> : <Lock size={16} className="text-amber-400" />}
                            {isPro ? 'Gerar Relatório DASN' : 'Relatório DASN (Pro)'}
                        </button>
                    </div>
                </div>

                {/* Primary Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Compliance Card */}
                    <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[32px] relative overflow-hidden flex flex-col justify-between group h-full">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
                        <div className="relative z-10">
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-green-500/20">
                                FISCAL
                            </span>
                            <h2 className="text-2xl font-black mt-4 mb-2 leading-tight">Status DASN</h2>
                            <div className="flex items-center gap-2 text-green-400 font-bold text-xs">
                                <CheckCircle size={16} />
                                <span>Declaração em Dia</span>
                            </div>
                        </div>
                    </div>

                    {/* Limit Card */}
                    <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[32px] relative overflow-hidden group flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">LIMITE ANUAL</span>
                            <TrendingUp size={16} className="text-primary" />
                        </div>
                        <div className="my-2">
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-3xl font-black tracking-tighter">{limitPercentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary shadow-[0_0_20px_rgba(246,85,85,0.5)] transition-all duration-1000 ease-out"
                                    style={{ width: `${limitPercentage}%` }}
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-white/30 font-medium truncate">
                            Restante: R$ {(limitMEI - totalYTD).toLocaleString('pt-BR')}
                        </p>
                    </div>

                    {/* IRPF Simulator Card */}
                    {isPro ? (
                        <div className="md:col-span-2 lg:col-span-2 bg-white/[0.04] border border-white/10 p-8 rounded-[32px] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />

                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <div>
                                    <span className="px-3 py-1 bg-white/10 text-white/60 text-[8px] font-black uppercase tracking-widest rounded-full border border-white/10">
                                        PROFISSIONAL (FISCAL)
                                    </span>
                                    <h2 className="text-2xl font-black mt-2 leading-none flex items-center gap-2">
                                        Simulador IRPF
                                        <span className="group relative">
                                            <HelpCircle size={16} className="text-white/20 cursor-help hover:text-primary transition-colors" />
                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white text-black text-[10px] font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl z-50 leading-relaxed">
                                                <span className="text-primary block mb-1 uppercase font-black tracking-widest text-[8px]">Dicionário MEI</span>
                                                Parcela isenta do faturamento com base no lucro presumido (ex: 32% para serviços e 8% para comércio).
                                            </span>
                                        </span>
                                    </h2>
                                </div>
                                <select
                                    value={activityType}
                                    onChange={(e) => setActivityType(e.target.value)}
                                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-primary/50 cursor-pointer"
                                >
                                    <option value="Serviços">Serviços (32%)</option>
                                    <option value="Comércio">Comércio (8%)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-6 relative z-10">
                                <div>
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">Parcela Isenta</p>
                                    <p className="text-2xl font-black text-green-400">R$ {exemptValue.toLocaleString('pt-BR')}</p>
                                    <p className="text-[9px] text-white/30 mt-1 font-medium">Isento de declaração</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">Lucro Tributável</p>
                                    <p className="text-2xl font-black text-white">R$ {taxableValue.toLocaleString('pt-BR')}</p>
                                    <p className="text-[9px] text-white/30 mt-1 font-medium">A declarar no IRPF</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="md:col-span-2 lg:col-span-2 bg-white/[0.04] border border-white/10 p-8 rounded-[32px] relative overflow-hidden group flex flex-col items-center justify-center text-center min-h-[300px]">
                             <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
                             <Lock size={48} className="text-primary/80 mb-4 animate-in zoom-in group-hover:scale-110 transition-transform" />
                             <h3 className="text-2xl font-black text-white mb-2">Simulador IRPF</h3>
                             <p className="text-white/60 mb-6 max-w-sm">Saiba exatamente quanto do seu faturamento MEI é isento e quanto deve ser declarado no IRPF Pessoa Física.</p>
                             <button onClick={handleUpgrade} className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-black transition-all shadow-lg shadow-primary/20">
                                 Desbloquear Recurso
                             </button>
                        </div>
                    )}
                </div>

                {/* Mini Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Faturamento Total YTD', value: `R$ ${totalYTD.toLocaleString('pt-BR')}`, sub: '+12% vs 2023', subColor: 'text-green-400' },
                        { label: 'Impostos Pagos', value: `R$ ${taxesPaid.toLocaleString('pt-BR')}`, sub: '6 guias quitadas', subColor: 'text-white/40' },
                        { label: 'Impostos Pendentes', value: 'R$ 0,00', sub: 'Tudo em dia', subColor: 'text-green-400' },
                        { label: 'Ticket Médio', value: `R$ ${ticketMedio.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, sub: 'Mensal', subColor: 'text-white/40' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl hover:bg-white/[0.04] transition-all">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4 leading-none">{stat.label}</p>
                            <p className="text-xl font-black mb-1">{stat.value}</p>
                            <p className={`text-[10px] font-bold ${stat.subColor} uppercase tracking-tight`}>{stat.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Table Section */}
                <div className="bg-white/[0.03] border border-white/5 rounded-[32px] overflow-hidden">
                    <div className="p-8 pb-4 flex items-center justify-between">
                        <h3 className="text-xl font-black">Detalhamento Mensal (Faturamento)</h3>
                        <div className="flex items-center gap-2">
                            <button className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-all border border-white/5">
                                <Filter size={18} />
                            </button>
                            <button className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-all border border-white/5">
                                <Download size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="px-8 overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-[10px] font-black text-white/30 uppercase tracking-[2px] border-b border-white/5">
                                    <th className="py-6 pr-4">Mês Referência</th>
                                    <th className="py-6 px-4">Faturamento Bruto</th>
                                    <th className="py-6 px-4">Serviços</th>
                                    <th className="py-6 px-4">Comércio</th>
                                    <th className="py-6 px-4">Guia DAS</th>
                                    <th className="py-6 pl-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {monthlySummary.length > 0 ? (
                                    monthlySummary.map((m, i) => (
                                        <tr key={i} className="group hover:bg-white/[0.01] transition-all">
                                            <td className="py-8 pr-4 text-sm font-black whitespace-nowrap capitalize">
                                                {new Date(selectedYear, m.monthIndex).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                            </td>
                                            <td className="py-8 px-4 text-sm font-black tracking-tight">
                                                R$ {m.faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-8 px-4">
                                                <span className="text-[10px] font-bold text-white/40 block">R$ {m.servicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            </td>
                                            <td className="py-8 px-4 text-[10px] font-bold text-white/40">
                                                R$ {m.comercio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-8 px-4">
                                                <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[9px] font-black uppercase rounded-full border border-green-500/10 tracking-widest">
                                                    PAGO
                                                </span>
                                            </td>
                                            <td className="py-8 pl-4 text-right">
                                                <button className="text-white/20 hover:text-white transition-all">
                                                    <MoreVertical size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-white/20 font-black uppercase tracking-[4px]">
                                            Nenhum faturamento registrado para {selectedYear}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 text-center border-t border-white/5">
                        <button className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-primary transition-all">
                            CARREGAR HISTÓRICO COMPLETO
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
