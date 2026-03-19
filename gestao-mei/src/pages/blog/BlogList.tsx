import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, User, Zap, ArrowLeft } from 'lucide-react';
import SEO from '../../components/layout/SEO';

const blogPosts = [
    {
        title: "🛡️ Como declarar o novo benefício de previdência do MEI em 2026: Guia Completo.",
        slug: "beneficios-previdenciarios-mei-2026",
        excerpt: "As regras mudaram e agora o MEI tem acesso a novos auxílios. Saiba como não perder seus direitos.",
        date: "19 de Março, 2026",
        category: "Previdência",
        image: "/previdencia-mei-2026.png"
    },
    {
        title: "⚠️ Meu CNPJ foi suspenso por falta de faturamento: O que fazer agora?",
        slug: "recuperacao-cnpj-suspenso",
        excerpt: "Não entre em pânico. Saiba como regularizar sua situação e evitar o cancelamento definitivo do seu registro.",
        date: "18 de Março, 2026",
        category: "Regularização",
        image: "/cnpj-suspenso-alert.png"
    },
    {
        title: "📊 Calculadora de Preço de Vendas para MEI: Não confunda Faturamento com Lucro!",
        slug: "calculadora-preco-venda-lucro",
        excerpt: "Vender muito não significa ganhar dinheiro. Aprenda a precificar corretamente e veja a cor do seu lucro no final do mês.",
        date: "17 de Março, 2026",
        category: "Elite",
        image: "/calculadora-lucro-venda.png"
    },
    {
        title: "🔥 Por que 15 dias de gestão profissional podem salvar o seu ano?",
        slug: "valor-gestao-profissional-mei",
        excerpt: "O caos financeiro é o maior inimigo do pequeno empresário. Descubra como a organização transforma o seu negócio.",
        date: "16 de Março, 2026",
        category: "Gestão",
        image: "/gestao-profissional-fin.png"
    },
    {
        title: "Gestão MEI revoluciona: Lançamento de notas fiscais via QR Code agora com 'Tecnologia de Leitura Direta'",
        slug: "tecnologia-leitura-direta-nfce",
        excerpt: "Microempreendedores do Amapá e de todo o Brasil agora podem automatizar seu livro caixa em menos de 1 segundo, pulando as barreiras dos sites do governo.",
        date: "11 de Março, 2026",
        category: "Inovação",
        image: "/scaneando.png"
    },
    {
        title: "Como fazer o Livro Caixa do MEI em segundos usando Inteligência Artificial (OCR)",
        slug: "livro-caixa-mei-ia",
        excerpt: "Descubra como a tecnologia OCR pode automatizar seu controle financeiro, economizando horas de trabalho manual e evitando erros na declaração.",
        date: "10 de Março, 2026",
        category: "Automação",
        image: "/relatorio mei .PNG"
    },
    {
        title: "Limite do MEI em 2026: Como o Radar Preditivo evita que você seja desenquadrado por erro",
        slug: "limite-mei-2026-radar",
        excerpt: "Entenda as regras de faturamento para 2026 e veja como nossa inteligência preditiva avisa antes de você ultrapassar o teto do MEI.",
        date: "08 de Março, 2026",
        category: "Segurança Fiscal",
        image: "/deshboard.PNG"
    },
    {
        title: "Simulador IRPF para MEI: Descubra quanto do seu lucro é isento de imposto de renda",
        slug: "simulador-irpf-mei-isencao",
        excerpt: "Aprenda a calcular a parcela isenta do seu faturamento e como declarar corretamente seu rendimento no Imposto de Renda Pessoa Física.",
        date: "05 de Março, 2026",
        category: "Economia",
        image: "/mobe.png"
    }
];

const BlogList: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-manrope selection:bg-red-500/30 selection:text-white">
            <SEO 
                title="Blog - Gestão MEI" 
                description="Dicas, tutorias e novidades sobre gestão financeira para MEI, automação com IA e conformidade fiscal." 
            />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-rose-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
                            <span className="font-black text-xs text-white tracking-wider">MEI</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">Gestão<span className="text-red-500">MEI</span></span>
                    </Link>
                    
                    <button 
                        onClick={() => navigate('/')}
                        className="text-white/60 hover:text-white text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Voltar para o Site
                    </button>
                </div>
            </header>

            <main className="pt-32 pb-24">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center mb-20">
                        <span className="px-4 py-1.5 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-[4px] rounded-full border border-red-500/20 mb-6 inline-block">
                            Conhecimento Elite
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
                            Blog do <span className="text-red-500">Gestor</span>
                        </h1>
                        <p className="text-lg text-white/50 font-medium leading-relaxed max-w-2xl mx-auto">
                            Tudo o que você precisa saber para blindar seu CNPJ e escalar seu faturamento com inteligência preditiva.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogPosts.map((post, index) => (
                            <Link 
                                key={index} 
                                to={`/blog/${post.slug}`}
                                className="group flex flex-col bg-[#111] border border-white/10 rounded-[32px] overflow-hidden hover:border-red-500/40 transition-all duration-500 hover:-translate-y-2"
                            >
                                <div className="aspect-[16/10] overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent z-10" />
                                    <img 
                                        src={post.image} 
                                        alt={post.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                                    />
                                    <span className="absolute top-6 left-6 z-20 px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/10">
                                        {post.category}
                                    </span>
                                </div>
                                
                                <div className="p-8 pt-2 flex flex-col flex-grow relative z-20">
                                    <div className="flex items-center gap-4 text-white/30 text-[10px] font-black uppercase tracking-widest mb-4">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {post.date}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User size={12} />
                                            MEI Elite
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-bold mb-4 group-hover:text-red-500 transition-colors leading-tight">
                                        {post.title}
                                    </h2>
                                    <p className="text-white/40 text-sm font-medium mb-8 line-clamp-3 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                    <div className="mt-auto flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                                        Ler Artigo Completo
                                        <ChevronRight size={16} className="text-red-500" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Bottom CTA */}
                    <div className="mt-32 p-12 bg-gradient-to-br from-red-600/20 via-[#111] to-[#111] border border-white/5 rounded-[48px] text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10">
                            <h3 className="text-3xl font-black mb-4">Cansado de planilhas complexas?</h3>
                            <p className="text-white/40 mb-8 font-bold leading-relaxed max-w-xl mx-auto italic">
                                Junte-se a milhares de MEIs que já automatizaram seu livro caixa com Inteligência Artificial.
                            </p>
                            <Link 
                                to="/auth"
                                className="bg-red-600 hover:bg-red-500 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-3"
                            >
                                Criar Conta Grátis
                                <Zap size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10 bg-[#0D0D0D] text-center">
                <div className="container mx-auto px-6">
                    <p className="text-white/20 text-xs font-bold uppercase tracking-[4px]">
                        © 2026 Gestão MEI - Gestão com Segurança.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default BlogList;
