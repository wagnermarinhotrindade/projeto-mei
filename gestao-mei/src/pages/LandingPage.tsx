import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ChevronDown,
    CheckCircle2,
    ArrowRight,
    FileText,
    ShieldCheck,
    Users,
    Zap,
    TrendingDown,
    LayoutGrid
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [isAnnual, setIsAnnual] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    React.useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsLoggedIn(!!session);
        });
    }, []);

    const handleSubscription = async (priceId: string) => {
        if (isLoggedIn) {
            navigate(`/dashboard?priceId=${priceId}`);
        } else {
            navigate(`/auth?priceId=${priceId}`);
        }
    };

    const scrollToPricing = () => {
        const element = document.getElementById('pricing');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const faqs = [
        {
            q: "É seguro colocar meus dados?",
            a: "Sim! Utilizamos criptografia de ponta e o banco de dados do Supabase, referência mundial em segurança de dados."
        },
        {
            q: "Precisa de cartão de crédito para testar?",
            a: "Não! Você pode começar agora mesmo gratuitamente sem precisar cadastrar nenhum cartão."
        },
        {
            q: "Como o sistema me ajuda no limite de 81k?",
            a: "Nós monitoramos seu faturamento automático e te avisamos quando você estiver chegando perto do limite anual do MEI."
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-manrope selection:bg-primary/30">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                            <span className="font-black text-xs text-white">MEI</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">Gestão<span className="text-primary">MEI</span></span>
                    </Link>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={scrollToPricing}
                            className="text-white/60 hover:text-white font-bold transition-colors hidden sm:block"
                        >
                            Ver Planos
                        </button>
                        <Link
                            to="/auth"
                            className="bg-white/5 hover:bg-white/10 text-white px-6 py-2.5 rounded-full font-semibold border border-white/10 transition-all hover:scale-105"
                        >
                            Entrar
                        </Link>
                    </div>
                </div>
            </header>

            <main className="pt-24">
                {/* Seção Hero */}
                <section className="relative overflow-hidden pt-20 pb-32">
                    {/* Background glow effects */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

                    <div className="container mx-auto px-6 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-16 items-center text-center lg:text-left transition-all duration-700">
                            <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-8">
                                    <Zap size={16} fill="currentColor" />
                                    Feito para quem quer crescer
                                </div>

                                <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
                                    O Fim da <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Planilha Financeira</span>
                                </h1>

                                <p className="text-xl md:text-2xl text-white/60 mb-12 font-medium">
                                    Controle seu MEI, gere relatórios e saiba seu lucro real em 3 cliques. Simples como deve ser.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center gap-4 lg:justify-start justify-center">
                                    <button
                                        onClick={scrollToPricing}
                                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-primary/40 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        Começar Grátis
                                        <ArrowRight size={20} />
                                    </button>
                                    <a href="#beneficios" className="w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/5 transition-colors">
                                        Ver como funciona
                                    </a>
                                </div>
                            </div>

                            <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 group">
                                <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full scale-75 group-hover:bg-primary/30 transition-colors" />

                                <div className="relative rounded-3xl p-1 bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-2xl overflow-hidden aspect-[16/10] transition-all duration-700 hover:-translate-y-6 hover:scale-[1.03] hover:shadow-primary/20 animate-float">
                                    <img
                                        src="/deshdord.png"
                                        alt="Gestão MEI Dashboard"
                                        className="w-full h-full object-cover rounded-2xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pain Section */}
                <section className="py-48 bg-white/[0.02]">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                                    Você mistura o dinheiro de casa com o da empresa?
                                </h2>
                                <p className="text-lg text-white/60 mb-10 leading-relaxed font-medium">
                                    Essa é a dor número 1 dos MEIs brasileiros. Sem separação de contas, você nunca sabe quanto realmente está ganhando e quando pode estar no prejuízo.
                                </p>
                                <ul className="space-y-6">
                                    {[
                                        "Chega de confusão no extrato bancário",
                                        "Pare de perder tempo anotando em cadernos",
                                        "Tenha previsibilidade para investir no seu negócio"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-4 group">
                                            <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30 group-hover:bg-red-500/30 transition-colors">
                                                <TrendingDown size={14} className="text-red-400" />
                                            </div>
                                            <span className="text-lg font-semibold">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="relative group transition-all duration-700 hover:-translate-y-8 animate-float [animation-delay:1s]">
                                <div className="absolute inset-0 bg-red-500/10 blur-[80px] rounded-full scale-90" />
                                <div className="relative aspect-[9/16] max-w-[320px] mx-auto rounded-[2.5rem] bg-[#0d0d0d] border-[8px] border-white/10 shadow-2xl overflow-hidden transition-all duration-700 group-hover:border-primary/20 group-hover:scale-[1.05]">
                                    <img
                                        src="/mobe.png"
                                        alt="Gestão MEI Mobile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section id="beneficios" className="py-48 relative">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-24">
                            <h2 className="text-4xl md:text-5xl font-black mb-6">Tudo o que você precisa em um só lugar</h2>
                            <p className="text-lg text-white/60 max-w-2xl mx-auto font-medium">Funcionalidades pensadas exclusivamente na realidade do Microempreendedor Individual.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <FileText className="text-primary" size={32} />,
                                    title: "Relatório DASN (PDF)",
                                    description: "Gere seu relatório mensal e anual com um clique. Pronto para a declaração oficial da Receita Federal."
                                },
                                {
                                    icon: <TrendingDown className="text-blue-400 rotate-180" size={32} />,
                                    title: "Limite de R$ 81k",
                                    description: "Acompanhe seu progresso em tempo real e nunca seja surpreendido pelo limite de faturamento anual do MEI."
                                },
                                {
                                    icon: <LayoutGrid className="text-purple-400" size={32} />,
                                    title: "Separação de Contas",
                                    description: "Categorize o que é da empresa e o que é pessoal. Tenha total clareza do seu lucro real de cada mês."
                                }
                            ].map((benefit, i) => (
                                <div key={i} className="group p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-primary/30 transition-all hover:bg-white/[0.05] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="mb-6 p-4 rounded-2xl bg-white/5 w-fit group-hover:scale-110 transition-transform">{benefit.icon}</div>
                                    <h3 className="text-2xl font-black mb-4 group-hover:text-primary transition-colors">{benefit.title}</h3>
                                    <p className="text-white/60 leading-relaxed font-medium">{benefit.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Planos e Preços */}
                <section id="pricing" className="py-48 bg-white/[0.01]">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            <h2 className="text-4xl md:text-6xl font-black mb-6">Escolha o plano ideal para o seu MEI</h2>
                            <p className="text-xl text-white/60 max-w-2xl mx-auto font-medium mb-12">
                                Comece grátis e faça o upgrade conforme seu negócio cresce. Sem pegadinhas.
                            </p>

                            {/* Toggle Mensal/Anual */}
                            <div className="flex items-center justify-center gap-4 mb-16">
                                <span className={`text-sm font-bold ${!isAnnual ? 'text-white' : 'text-white/40'}`}>Mensal</span>
                                <button
                                    onClick={() => setIsAnnual(!isAnnual)}
                                    className="w-16 h-8 bg-white/10 rounded-full relative transition-all border border-white/10"
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-primary rounded-full transition-all shadow-lg shadow-primary/40 ${isAnnual ? 'left-9' : 'left-1'}`} />
                                </button>
                                <span className={`text-sm font-bold ${isAnnual ? 'text-white' : 'text-white/40'}`}>Anual <span className="text-green-400 text-[10px] ml-1 uppercase tracking-widest bg-green-400/10 px-2 py-0.5 rounded-full">Economize 15%</span></span>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {/* Plano Básico */}
                            <div className="p-10 md:p-16 rounded-[40px] bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all flex flex-col relative group overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                <h3 className="text-2xl font-black mb-2">Plano Básico</h3>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-5xl font-black">Grátis</span>
                                </div>
                                <p className="text-white/40 font-medium mb-10 text-sm">Ideal para quem está começando e quer organizar as primeiras vendas.</p>

                                <ul className="space-y-6 mb-12 flex-1">
                                    <li className="flex items-center gap-3 text-white/60 font-bold text-sm">
                                        <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                                            <CheckCircle2 size={12} className="text-primary" />
                                        </div>
                                        Até 20 lançamentos / mês
                                    </li>
                                    <li className="flex items-center gap-3 text-white/60 font-bold text-sm">
                                        <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                                            <CheckCircle2 size={12} className="text-primary" />
                                        </div>
                                        Limite de R$ 1.000,00 de movimentação
                                    </li>
                                    <li className="flex items-center gap-3 text-white/20 font-bold text-sm line-through decoration-white/20">
                                        <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                        </div>
                                        Relatórios DASN em PDF
                                    </li>
                                </ul>

                                <button
                                    onClick={() => navigate('/auth')}
                                    className="w-full bg-white/5 hover:bg-white/10 text-white py-5 rounded-2xl font-black text-lg transition-all border border-white/10 active:scale-95"
                                >
                                    Começar Grátis
                                </button>
                            </div>

                            {/* Plano Pro */}
                            <div className="p-10 md:p-16 rounded-[40px] bg-gradient-to-br from-primary/20 to-blue-600/10 border-2 border-primary shadow-2xl shadow-primary/20 flex flex-col relative group overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
                                <div className="absolute top-8 right-8 px-4 py-1.5 bg-primary rounded-full text-[10px] font-black uppercase tracking-[2px] text-white">Recomendado</div>

                                <h3 className="text-2xl font-black mb-2">Plano Pro</h3>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-2xl font-black text-white/40">R$</span>
                                    <span className="text-6xl font-black tracking-tighter">{isAnnual ? '197,00' : '19,90'}</span>
                                    <span className="text-white/40 font-bold">{isAnnual ? '/ano' : '/mês'}</span>
                                </div>
                                <p className="text-white/60 font-medium mb-10 text-sm">Para o MEI que quer controle total e não quer se preocupar com limites.</p>

                                <ul className="space-y-6 mb-12 flex-1">
                                    <li className="flex items-center gap-3 text-white/90 font-bold text-sm">
                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                            <CheckCircle2 size={12} className="text-white" />
                                        </div>
                                        Lançamentos Ilimitados
                                    </li>
                                    <li className="flex items-center gap-3 text-white/90 font-bold text-sm">
                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                            <CheckCircle2 size={12} className="text-white" />
                                        </div>
                                        Relatórios DASN e Financeiros
                                    </li>
                                    <li className="flex items-center gap-3 text-white/90 font-bold text-sm">
                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                            <CheckCircle2 size={12} className="text-white" />
                                        </div>
                                        Controle Ativo de Limite MEI 81k
                                    </li>
                                    <li className="flex items-center gap-3 text-white/90 font-bold text-sm">
                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                            <CheckCircle2 size={12} className="text-white" />
                                        </div>
                                        Suporte Prioritário
                                    </li>
                                </ul>

                                <button
                                    onClick={() => handleSubscription(isAnnual ? 'price_1T2d6SLjW93jPn5ye6wN7Ptg' : 'price_1T2d6SLjW93jPn5yKFFhiedU')}
                                    className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/40 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                                >
                                    Assinar o Pro
                                    <Zap size={20} fill="currentColor" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="py-48">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <h2 className="text-4xl md:text-5xl font-black mb-20 text-center">Perguntas Frequentes</h2>
                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <div key={i} className="border border-white/5 bg-white/[0.02] rounded-2xl overflow-hidden transition-all duration-300">
                                    <button
                                        className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    >
                                        <span className="text-xl font-bold">{faq.q}</span>
                                        <ChevronDown className={`transition-transform duration-300 text-primary ${openFaq === i ? 'rotate-180' : ''}`} />
                                    </button>
                                    <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-96' : 'max-h-0'}`}>
                                        <div className="px-8 pb-8 text-white/60 text-lg leading-relaxed font-medium">
                                            {faq.a}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Final */}
                <section className="py-40 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] bg-primary/20 rounded-full blur-[150px] pointer-events-none opacity-50" />
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="max-w-4xl mx-auto rounded-[3rem] bg-gradient-to-br from-primary to-blue-600 p-12 md:p-24 text-center shadow-2xl shadow-primary/30 overflow-hidden relative">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/20 rounded-full blur-3xl" />

                            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight relative z-10">
                                Pronto para profissionalizar seu MEI?
                            </h2>
                            <p className="text-xl md:text-2xl text-white/80 mb-12 font-bold relative z-10">
                                Comece agora e tenha o controle total do seu negócio em minutos.
                            </p>
                            <button
                                onClick={scrollToPricing}
                                className="group bg-white text-primary hover:bg-white/90 px-12 py-6 rounded-2xl font-black text-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 mx-auto relative z-10"
                            >
                                Criar Conta Agora
                                <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <p className="mt-8 text-white/60 font-medium relative z-10">Não precisa de cartão de crédito.</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-20 border-t border-white/5 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <span className="font-black text-[10px] text-white">MEI</span>
                            </div>
                            <span className="text-lg font-bold tracking-tight">Gestão<span className="text-primary">MEI</span></span>
                        </div>
                        <div className="flex gap-10 text-white/40 font-bold">
                            <a href="#beneficios" className="hover:text-primary transition-colors">Sobre</a>
                            <a href="#faq" className="hover:text-primary transition-colors">Ajuda</a>
                            <Link to="/auth" className="hover:text-primary transition-colors">Acessar</Link>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between text-white/20 text-sm font-bold pt-8 border-t border-white/5 gap-4">
                        <p>© 2026 Gestão MEI. Todos os direitos reservados.</p>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-white/40 transition-colors">Termos</a>
                            <a href="#" className="hover:text-white/40 transition-colors">Privacidade</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
