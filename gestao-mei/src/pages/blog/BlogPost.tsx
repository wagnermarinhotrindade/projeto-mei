import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Zap, Calendar, User, Clock, Share2, ArrowRight } from 'lucide-react';
import SEO from '../../components/layout/SEO';

interface PostContent {
    title: string;
    description: string;
    category: string;
    date: string;
    readTime: string;
    image: string;
    content: React.ReactNode;
}

const posts: Record<string, PostContent> = {
    'livro-caixa-mei-ia': {
        title: "Como fazer o Livro Caixa do MEI em segundos usando Inteligência Artificial (OCR)",
        description: "Automatize seu livro caixa MEI com IA e OCR. Aprenda como guardar comprovantes e gerar relatórios automaticamente.",
        category: "Automação",
        date: "10 de Março, 2026",
        readTime: "4 min de leitura",
        image: "/relatorio mei .PNG",
        content: (
            <>
                <p>O maior pesadelo de todo Microempreendedor Individual (MEI) não é apenas vender, mas sim organizar a "papelada" que vem depois. Todo café, toda compra de insumo no Nubank e todo boleto pago formam uma montanha de dados que precisam estar no seu Livro Caixa.</p>
                
                <h2>O Diferencial: Adeus digitação manual</h2>
                <p>Antigamente, você precisava anotar valor por valor em uma planilha de Excel. Se perdesse o papel térmico que apaga com o tempo, perdia a dedução do seu lucro. Hoje, a <strong>Inteligência Artificial (OCR)</strong> mudou o jogo.</p>
                
                <h3>O que é o OCR e como ele ajuda o MEI?</h3>
                <p>OCR (Optical Character Recognition) é a tecnologia que permite que o sistema "leia" texto dentro de uma imagem. No Gestão MEI, você simplesmente tira uma foto do comprovante ou anexa o PDF do banco.</p>
                
                <ul>
                    <li><strong>Extração Automática:</strong> O sistema identifica Data, Valor e Categoria (Alimentação, Transporte, etc).</li>
                    <li><strong>Nubank & Bancos Digitais:</strong> Basta printar o comprovante e subir. A IA já reconhece o padrão.</li>
                    <li><strong>Organização Fiscal:</strong> Cada gasto é automaticamente abatido do seu lucro real, preparando o terreno para a sua declaração anual (DASN-SIMEI).</li>
                </ul>

                <h2>Como isso evita erros na Declaração Anual?</h2>
                <p>Muitos MEIs chegam em Maio sem saber quanto venderam e quanto gastaram, chutando valores na DASN. Isso é um convite para a malha fina. Com o Livro Caixa automatizado, você tem um PDF mastigado com todos os gastos dedutíveis, garantindo que você nunca pague mais imposto do que deveria.</p>
            </>
        )
    },
    'limite-mei-2026-radar': {
        title: "Limite do MEI em 2026: Como o Radar Preditivo evita que você seja desenquadrado por erro",
        description: "Saiba tudo sobre o limite de faturamento MEI em 2026 e como usar o Radar Preditivo para não ser desenquadrado.",
        category: "Segurança Fiscal",
        date: "08 de Março, 2026",
        readTime: "5 min de leitura",
        image: "/deshboard.PNG",
        content: (
            <>
                <p>O limite de faturamento do MEI é um dos assuntos mais sensíveis. Em 2026, com a inflação e o crescimento dos negócios digitais, muitos empreendedores correm o risco de ultrapassar os R$ 81.000,00 anuais sem perceber.</p>
                
                <h2>O perigo do desenquadramento retroativo</h2>
                <p>Se você ultrapassa o limite em mais de 20%, o desenquadramento é retroativo ao início do ano. Isso significa pagar impostos como Microempresa (ME) sobre tudo o que você já vendeu, além de multas e juros. É o fim de muitos negócios.</p>
                
                <h3>Radar Preditivo: Sua proteção 24/7</h3>
                <p>Nosso sistema não apenas soma o que você vendeu hoje. Ele utiliza um algoritmo de <strong>Inteligência Preditiva</strong> para analisar sua velocidade de crescimento.</p>
                
                <p>Imagine que você faturou R$ 8.000,00 em um mês. O sistema calcula: "Nesse ritmo, você atingirá o limite em Setembro". Você recebe um aviso visual no Dashboard, permitindo que você tome decisões estratégicas:</p>
                
                <ul>
                    <li>Pausar vendas no final do ano.</li>
                    <li>Planejar a transição para ME de forma estruturada.</li>
                    <li>Evitar a surpresa de uma notificação da Receita Federal.</li>
                </ul>

                <h2>Acompanhamento em Tempo Real</h2>
                <p>Com o gráfico de Projeção de Faturamento, você vê exatamente onde está e para onde seu CNPJ está indo. Não é apenas controle, é visão de longo prazo para quem quer crescer com segurança.</p>
            </>
        )
    },
    'simulador-irpf-mei-isencao': {
        title: "Simulador IRPF para MEI: Descubra quanto do seu lucro é isento de imposto de renda",
        description: "Use o simulador IRPF para MEI e descubra o seu lucro isento. Saiba como calcular pro labore e evitar impostos desnecessários.",
        category: "Economia",
        date: "05 de Março, 2026",
        readTime: "6 min de leitura",
        image: "/mobe.png",
        content: (
            <>
                <p>Uma das maiores dúvidas do MEI é: "Como eu passo o dinheiro da empresa para o meu CPF sem pagar Imposto de Renda?". A resposta está na regra da Parcela Isenta do Lucro Presumido.</p>
                
                <h2>Lucro vs. Rendimento Tributável</h2>
                <p>Nem tudo o que sobra na sua conta é isento. A Receita Federal define percentuais fixos de isenção dependendo da sua atividade:</p>
                
                <ul>
                    <li><strong>8%</strong> para comércio, indústria e transporte de carga.</li>
                    <li><strong>16%</strong> para transporte de passageiros.</li>
                    <li><strong>32%</strong> para prestação de serviços em geral.</li>
                </ul>

                <h3>Como o nosso Simulador funciona?</h3>
                <p>Dentro do Gestão MEI, nós automatizamos esse cálculo complexo. O sistema pega seu faturamento bruto, subtrai suas despesas comprovadas (aquelas do Livro Caixa que falamos antes) e aplica a regra de isenção.</p>
                
                <p>O resultado é dividido em duas colunas claras:</p>
                <ol>
                    <li><strong>Rendimento Isento:</strong> O valor que você informa na sua declaração de CPF sem pagar nada.</li>
                    <li><strong>Rendimento Tributável:</strong> O valor que, se ultrapassar o teto da Receita, pode gerar imposto.</li>
                </ol>

                <h2>Por que ter Pro-Labore organizado?</h2>
                <p>Ter esses valores documentados mês a mês é essencial para comprovar renda em bancos (conseguir empréstimos e cartões) e para estar 100% legalizado. O app já entrega o valor exato que você deve preencher no programa do IRPF, eliminando qualquer medo de errar na declaração.</p>
            </>
        )
    }
};

const BlogPost: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const post = slug ? posts[slug] : null;

    if (!post) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-black mb-4">Artigo não encontrado</h1>
                    <Link to="/blog" className="text-red-500 font-bold hover:underline">Voltar para o Blog</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-manrope selection:bg-red-500/30 selection:text-white pb-24">
            <SEO title={post.title} description={post.description} />

            {/* Progress Bar */}
            <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-white/5">
                <div className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)] w-0" id="read-progress"></div>
            </div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-rose-700 rounded-xl flex items-center justify-center">
                            <span className="font-black text-xs text-white">MEI</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">Gestão<span className="text-red-500">MEI</span></span>
                    </Link>
                    
                    <Link 
                        to="/blog"
                        className="text-white/40 hover:text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                    >
                        <ChevronLeft size={14} />
                        Todos os Artigos
                    </Link>
                </div>
            </header>

            <article className="pt-32">
                <div className="container mx-auto px-6">
                    {/* Intro */}
                    <div className="max-w-3xl mx-auto mb-16">
                        <div className="flex items-center gap-4 text-white/40 text-[10px] font-black uppercase tracking-[4px] mb-8">
                            <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20">{post.category}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1.5">
                                <Clock size={12} />
                                {post.readTime}
                            </div>
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-black mb-10 tracking-tighter leading-[1.1]">
                            {post.title}
                        </h1>

                        <div className="flex items-center justify-between py-6 border-y border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center font-black text-xs">GM</div>
                                <div>
                                    <p className="text-sm font-bold">Equipe Gestão MEI</p>
                                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{post.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-white/30">
                                <Share2 size={18} className="hover:text-white cursor-pointer transition-colors" />
                            </div>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="max-w-3xl mx-auto">
                        <div className="rounded-[40px] overflow-hidden border border-white/10 mb-16 shadow-2xl relative group">
                            <img src={post.image} alt={post.title} className="w-full aspect-video object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
                        </div>

                        <div className="prose prose-invert prose-red max-w-none 
                            prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-white
                            prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6
                            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-red-500
                            prose-p:text-white/60 prose-p:text-lg prose-p:leading-relaxed prose-p:mb-8
                            prose-strong:text-white prose-strong:font-black
                            prose-li:text-white/60 prose-li:text-lg prose-li:mb-2
                            prose-ul:mb-8
                        ">
                            {post.content}
                        </div>

                        {/* Article Footer / CTA */}
                        <div className="mt-24 p-12 bg-white/[0.03] border border-white/10 rounded-[48px] text-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-red-600/10 transition-colors" />
                            
                            <div className="relative z-10">
                                <Zap className="text-red-500 mx-auto mb-6" size={40} />
                                <h3 className="text-3xl font-black mb-4">Pronto para o próximo nível?</h3>
                                <p className="text-white/40 mb-10 font-bold leading-relaxed max-w-md mx-auto italic text-lg">
                                    Pare de perder tempo com papelada. Deixe a nossa IA cuidar do seu Livro Caixa enquanto você foca em crescer.
                                </p>
                                
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                    <Link 
                                        to="/auth"
                                        className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[2px] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-red-600/20 flex items-center justify-center gap-3"
                                    >
                                        Começar Grátis Agora
                                        <ArrowRight size={16} />
                                    </Link>
                                </div>

                                <p className="mt-8 text-[10px] text-white/20 font-black uppercase tracking-[4px]">
                                    Sem cartão de crédito • Setup em 2 minutos
                                </p>
                            </div>
                        </div>

                        {/* Back to Blog */}
                        <div className="mt-16 text-center">
                            <Link 
                                to="/blog"
                                className="inline-flex items-center gap-2 text-white/30 hover:text-white font-bold transition-all group"
                            >
                                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                Voltar para o Blog
                            </Link>
                        </div>
                    </div>
                </div>
            </article>

            {/* Footer */}
            <footer className="mt-32 py-12 border-t border-white/5 text-center">
                <p className="text-white/20 text-[10px] font-black uppercase tracking-[8px]">
                    Gestão MEI Elite © 2026
                </p>
            </footer>
        </div>
    );
};

export default BlogPost;
