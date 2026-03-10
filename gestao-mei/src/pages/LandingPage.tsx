import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ChevronDown,
    ArrowRight,
    FileText,
    ShieldCheck,
    TrendingUp,
    Zap,
    Lock,
    BarChart3,
    Activity,
    CheckCircle2,
    Cloud,
    Shield
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { startStripeCheckout } from '../lib/stripe';

const Floating3D = ({ children }: { children: React.ReactNode }) => {
    const [rotate, setRotate] = useState({ x: 0, y: 0 });
    const cardRef = React.useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10; // Reduzido para movimento mais suave
        const rotateY = (centerX - x) / 10;
        setRotate({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setRotate({ x: 0, y: 0 });
    };

    return (
        <div 
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="transition-all duration-500 ease-out cursor-pointer hover:shadow-red-500/10"
            style={{ 
                perspective: '1200px',
                transformStyle: 'preserve-3d',
                transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(${rotate.x !== 0 ? 1.02 : 1})`,
            }}
        >
            <div className="animate-float" style={{ transformStyle: 'preserve-3d' }}>
                {children}
            </div>
        </div>
    );
};

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAnnual, setIsAnnual] = useState(false);
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
            
            if (session) {
                const { data: profile } = await supabase
                    .from('users_profile')
                    .select('plano')
                    .eq('id', session.user.id)
                    .single();
                setIsPro(profile?.plano === 'pro');
            }
        };
        checkAuth();
    }, []);

    const handleCTA = () => {
        if (isLoggedIn) {
            navigate('/dashboard');
        } else {
            navigate('/auth');
        }
    };

    const handleProCTA = async () => {
        // Price ID do Plano Pro (Mensal ou Anual)
        const priceId = isAnnual ? 'price_1T2d6SLjW93jPn5ye6wN7Ptg' : 'price_1T2d6SLjW93jPn5ye6wN7Pth'; // Exemplo de IDs

        if (isLoggedIn) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Salva intenção e vai direto para Stripe
                localStorage.setItem('pending_purchase_price_id', priceId);
                await startStripeCheckout(priceId, user.id, user.email || '');
            } else {
                navigate('/auth');
            }
        } else {
            navigate(`/auth?priceId=${priceId}`);
        }
    };

    const scrollToPricing = () => {
        const pricingSection = document.getElementById('planos');
        if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const faqs = [
        {
            q: "Como a Inteligência Preditiva funciona na prática?",
            a: "Nosso algoritmo analisa seu histórico de faturamento diário e mensal, calculando sua média de crescimento. Com base nisso, prevemos exatamente no mês em que você corre o risco de ultrapassar o limite do MEI, dando meses de antecedência para você se planejar."
        },
        {
            q: "É seguro colocar meus dados financeiros aqui?",
            a: "Absolutamente. Utilizamos infraestrutura de nível bancário (Supabase) com criptografia ponta a ponta. Seus dados são exclusivamente seus e nunca são compartilhados."
        },
        {
            q: "O relatório DASN substitui meu contador?",
            a: "Nosso Relatório DASN-Elite organiza todos os seus dados e gera um PDF mastigado e à prova de erros, contendo exatamente os valores que você precisa declarar para a Receita Federal."
        },
        {
            q: "Preciso cadastrar cartão de crédito para acessar?",
            a: "Não! Você pode iniciar gratuitamente e sentir na prática o poder do nosso painel de controle sem nenhum compromisso."
        }
    ];

    return (
        <div className="min-h-screen bg-[#0D0D0D] text-white font-sans selection:bg-red-500/30 overflow-x-hidden">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0D0D0D]/80 backdrop-blur-md">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-rose-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
                            <span className="font-black text-xs text-white tracking-wider">MEI</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">Gestão<span className="text-red-500">MEI</span></span>
                    </Link>

                    <div className="flex items-center gap-6">
                        <Link
                            to="/auth"
                            className="text-sm font-semibold text-white/70 hover:text-white transition-colors"
                        >
                            Já tenho conta
                        </Link>
                        <button
                            onClick={scrollToPricing}
                            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg shadow-red-600/20"
                        >
                            Acessar Central
                        </button>
                    </div>
                </div>
            </header>

            <main className="pt-24">
                {/* 1. Hero Section (O Gancho) */}
                <section className="relative pt-24 pb-32">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
                    
                    <div className="container mx-auto px-6 relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold mb-8 uppercase tracking-widest">
                            <Lock size={14} />
                            Segurança Fiscal de Elite
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight max-w-5xl mx-auto">
                            O fim da dúvida e do medo de <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">desenquadrar seu MEI.</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-white/60 mb-12 font-medium max-w-3xl mx-auto leading-relaxed">
                            Use a Inteligência Preditiva para prever seu faturamento, organizar seus impostos e emitir relatórios de auditoria prontos para a Receita Federal.
                        </p>

                        <button
                            onClick={scrollToPricing}
                            className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-12 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-red-600/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto"
                        >
                            Começar Agora Gratuitamente
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </section>

                {/* 2. Radar de Sobrevivência */}
                <section className="py-24 border-t border-white/5 bg-white/[0.01]">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black mb-4">Radar de Sobrevivência</h2>
                            <p className="text-lg text-white/50 max-w-2xl mx-auto">As 3 barreiras de proteção que impedem o seu negócio de ser autuado.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {/* Card 1 */}
                            <div className="bg-[#121212] border border-white/10 p-8 rounded-3xl hover:border-red-500/50 transition-colors group">
                                <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Activity className="text-red-500" size={28} />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Inteligência Preditiva</h3>
                                <p className="text-white/60 leading-relaxed">
                                    Não seja pego de surpresa. Nosso sistema analisa sua média e projeta exatamente quando você corre o risco de estourar o limite de R$ 81.000.
                                </p>
                            </div>
                            
                            {/* Card 2 */}
                            <div className="bg-[#121212] border border-white/10 p-8 rounded-3xl hover:border-blue-500/50 transition-colors group">
                                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="text-blue-500" size={28} />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Simulador de IRPF</h3>
                                <p className="text-white/60 leading-relaxed">
                                    Saiba exatamente quanto do seu lucro é isento de imposto de renda e garanta que sua blindagem patrimonial está ocorrendo dentro da lei.
                                </p>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-[#121212] border border-white/10 p-8 rounded-3xl hover:border-rose-500/50 transition-colors group">
                                <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FileText className="text-rose-500" size={28} />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Relatório DASN-Elite</h3>
                                <p className="text-white/60 leading-relaxed">
                                    Chega de quebrar a cabeça em Maio. Gere o relatório consolidado com os valores mastigados para declarar à Receita em 5 minutos. Com separação automática entre Serviços e Comércio para facilitar sua declaração anual.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2.5 Documentação com Padrão Contábil */}
                <section className="py-24 border-t border-white/5 relative bg-[#0A0A0A]">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black mb-4">Documentação com Padrão Contábil</h2>
                            <p className="text-lg text-white/50 max-w-2xl mx-auto">Relatórios prontos para a Receita Federal, gerados com um clique.</p>
                        </div>
                        <Floating3D>
                            <div className="max-w-5xl mx-auto rounded-2xl bg-[#1A1A1A] border border-white/10 p-2 shadow-2xl relative group overflow-hidden">
                                 <div className="absolute inset-0 bg-red-600/20 blur-[100px] rounded-full scale-75 group-hover:bg-red-600/30 transition-colors" />
                                 <img src="/relatorio mei .PNG" alt="Relatório DASN-Elite" className="w-full h-auto rounded-xl border border-white/5 relative z-10 opacity-90 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </Floating3D>
                    </div>
                </section>

                {/* 3. Central de Comando */}
                <section className="py-32 relative">
                    <div className="container mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="order-2 lg:order-1">
                                <Floating3D>
                                    <div className="relative group overflow-hidden">
                                        <div className="absolute inset-0 bg-red-600/20 blur-[100px] rounded-full scale-75 group-hover:bg-red-600/30 transition-colors" />
                                        <div className="relative rounded-2xl bg-[#1A1A1A] border border-white/10 p-2 shadow-2xl">
                                            <img 
                                                src="/deshboard.PNG" 
                                                alt="Central de Comando exibindo R$ 888,00 e Radar 1.1%" 
                                                className="w-full h-auto rounded-xl border border-white/5 opacity-90 group-hover:opacity-100 transition-opacity"
                                            />
                                        </div>
                                    </div>
                                </Floating3D>
                            </div>
                            
                            <div className="order-1 lg:order-2">
                                <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                                    Central de Comando: Sua empresa em Raio-X.
                                </h2>
                                <p className="text-xl text-white/60 mb-8 leading-relaxed">
                                    Você nunca mais vai olhar para o extrato do banco sem saber o que é dinheiro seu e o que é dinheiro da empresa.
                                </p>
                                
                                <ul className="space-y-6 mb-10">
                                    <li className="flex items-start gap-4">
                                        <div className="mt-1">
                                            <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                                                <CheckCircle2 size={14} className="text-red-400" />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold">Margem Líquida Real</h4>
                                            <p className="text-white/50">Saiba o verdadeiro lucro que sobra no seu bolso após as despesas.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="mt-1">
                                            <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                                                <CheckCircle2 size={14} className="text-red-400" />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold">Reserva DAS</h4>
                                            <p className="text-white/50">Provisão automática para você nunca atrasar a guia mensal.</p>
                                        </div>
                                    </li>
                                </ul>

                                <button
                                    onClick={scrollToPricing}
                                    className="bg-white text-[#0D0D0D] px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/90 transition-colors w-full sm:w-auto"
                                >
                                    Acessar Painel Demonstração
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Pricing Section */}
                <section id="planos" className="py-24 border-t border-white/5 scroll-mt-24">
                    <div className="container mx-auto px-6 max-w-5xl">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-5xl font-black mb-4">Escolha seu Plano</h2>
                            <p className="text-lg text-white/50">Comece grátis ou desbloqueie o poder total da Inteligência MEI.</p>
                        </div>

                        <div className="flex justify-center mb-12">
                            <div className="bg-[#121212] p-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                                <button
                                    onClick={() => setIsAnnual(false)}
                                    className={`px-6 py-2.5 rounded-lg font-bold transition-all ${!isAnnual ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
                                >
                                    Mensal
                                </button>
                                <button
                                    onClick={() => setIsAnnual(true)}
                                    className={`px-6 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 ${isAnnual ? 'bg-red-600 text-white' : 'text-white/50 hover:text-white'}`}
                                >
                                    Anual <span className="text-[10px] bg-red-500/20 text-red-100 px-2 py-1 rounded-full border border-red-500/30 uppercase tracking-widest leading-none">Economize 17%</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Grátis */}
                            <div className="bg-[#121212] border border-white/10 p-10 rounded-3xl flex flex-col">
                                <h3 className="text-2xl font-bold mb-2">Base</h3>
                                <div className="text-4xl font-black mb-1">Grátis</div>
                                <p className="text-white/50 mb-8 border-b border-white/10 pb-8">Controle essencial para o seu dia a dia.</p>
                                
                                <ul className="space-y-4 mb-10 flex-1">
                                    <li className="flex items-center gap-3"><CheckCircle2 className="text-green-500" size={20} /> <span className="text-white/80">Limite de faturamento de até R$ 1.000,00</span></li>
                                    <li className="flex items-center gap-3"><CheckCircle2 className="text-green-500" size={20} /> <span className="text-white/80">Dashboard Básico</span></li>
                                    <li className="flex items-center gap-3"><CheckCircle2 className="text-green-500" size={20} /> <span className="text-white/80">Reserva DAS Automática</span></li>
                                </ul>
                                
                                <button onClick={handleCTA} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-xl font-bold transition-all">
                                    Começar Grátis
                                </button>
                            </div>

                            {/* Pro */}
                            <div className="bg-gradient-to-b from-[#1A1010] to-[#0D0D0D] border border-red-500/30 relative p-10 rounded-3xl flex flex-col shadow-2xl shadow-red-900/20">
                                <div className="absolute top-0 right-8 -translate-y-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wider uppercase">
                                    Recomendado
                                </div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Zap className="text-red-500 fill-red-500" size={24} />
                                    <h3 className="text-2xl font-bold">Elite Pro</h3>
                                </div>
                                <div className="text-4xl font-black mb-1 flex items-baseline gap-1">
                                    {isAnnual ? 'R$ 197,00' : 'R$ 19,90'}
                                    <span className="text-xl text-white/50 font-normal">/{isAnnual ? 'ano' : 'mês'}</span>
                                </div>
                                <p className="text-red-400 mb-8 border-b border-white/10 pb-8">Paz de espírito total para não desenquadrar.</p>
                                
                                <ul className="space-y-4 mb-10 flex-1">
                                    <li className="flex items-center gap-3"><CheckCircle2 className="text-red-500" size={20} /> <span className="text-white font-semibold">Tudo do plano Base</span></li>
                                    <li className="flex items-center gap-3"><CheckCircle2 className="text-red-500 flex-shrink-0" size={20} /> <span className="text-white font-bold">Inteligência Preditiva (Risco de Desenquadramento)</span></li>
                                    <li className="flex items-center gap-3"><CheckCircle2 className="text-red-500 flex-shrink-0" size={20} /> <span className="text-white font-bold">Relatório de Auditoria DASN Automático</span></li>
                                    <li className="flex items-center gap-3"><CheckCircle2 className="text-red-500 flex-shrink-0" size={20} /> <span className="text-white font-bold">Simulador de IRPF</span></li>
                                    <li className="flex items-center gap-3"><CheckCircle2 className="text-red-500 flex-shrink-0" size={20} /> <span className="text-white font-bold">Upload e Gestão de Comprovantes (Fotos/PDF)</span></li>
                                </ul>
                                
                                {isPro ? (
                                    <button onClick={() => navigate('/dashboard')} className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-4 rounded-xl font-bold transition-all shadow-lg">
                                        Gerenciar Assinatura
                                    </button>
                                ) : (
                                    <button onClick={handleProCTA} className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20">
                                        Assinar Módulo Elite
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. FAQ Section */}
                <section className="py-32 bg-white/[0.02]">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black mb-4">Perguntas Frequentes</h2>
                            <p className="text-lg text-white/50">Elimine suas dúvidas e assuma o controle hoje.</p>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <div key={i} className="border border-white/10 bg-[#121212] rounded-2xl overflow-hidden transition-all duration-300">
                                    <button
                                        className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    >
                                        <span className="text-lg font-bold pr-8">{faq.q}</span>
                                        <ChevronDown className={`transition-transform duration-300 flex-shrink-0 text-red-500 ${openFaq === i ? 'rotate-180' : ''}`} />
                                    </button>
                                    <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="px-8 pb-8 text-white/60 leading-relaxed">
                                            {faq.a}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Bottom CTA */}
                <section className="py-24 border-t border-white/5">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-5xl font-black mb-8">Passe para o próximo nível.</h2>
                        <button
                            onClick={scrollToPricing}
                            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-red-600/30 transition-all hover:scale-105 active:scale-95 mx-auto flex items-center gap-3"
                        >
                            Criar Conta Gratuitamente
                            <Zap size={20} />
                        </button>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10 bg-[#0D0D0D]">
                <div className="container mx-auto px-6 mb-12 border-b border-white/5 pb-10">
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60">
                         <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
                             <Lock size={16} className="text-red-500" /> Criptografia de Dados
                         </div>
                         <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
                             <Cloud size={16} className="text-red-500" /> Backup Diário
                         </div>
                         <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
                             <Shield size={16} className="text-red-500" /> Privacidade Garantida
                         </div>
                    </div>
                </div>

                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-bold tracking-tight">Gestão<span className="text-red-500">MEI</span> Elite</span>
                    </div>
                    <div className="flex flex-col gap-2 md:text-right">
                        <p className="text-white/40 text-sm font-medium">
                            © {new Date().getFullYear()} Gestão MEI. Todos os direitos reservados.
                        </p>
                        <p className="text-white/30 text-xs flex items-center gap-1 md:justify-end">
                            <Zap size={10} className="text-yellow-500" />
                            Possuímos um sistema dedicado de Feedback e Sugestões para melhoria contínua da plataforma.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

