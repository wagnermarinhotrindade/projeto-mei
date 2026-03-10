import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Eye, Lock, Database, Cookie } from 'lucide-react';
import SEO from '../components/layout/SEO';

const Privacy: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-manrope selection:bg-primary/30">
            <SEO title="Política de Privacidade" description="Saiba como o Gestão MEI protege seus dados financeiros e pessoais em conformidade com a LGPD." />
            {/* Header / Nav */}
            <div className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-all group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold text-sm uppercase tracking-widest">Voltar</span>
                    </button>
                    <span className="font-black text-xl tracking-tighter italic">Gestão <span className="text-primary tracking-normal not-italic underline decoration-primary/30 underline-offset-4">MEI</span></span>
                    <div className="w-20" /> {/* Spacer */}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
                <div className="mb-16">
                    <div className="w-16 h-16 bg-primary/20 rounded-3xl flex items-center justify-center text-primary mb-6 border border-primary/20">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Política de Privacidade</h1>
                    <p className="text-white/40 font-medium text-lg italic">Última atualização: 10 de Março de 2026</p>
                </div>

                <div className="prose prose-invert prose-primary max-w-none space-y-12 text-white/70 leading-relaxed font-medium">
                    <section>
                        <h2 className="text-2xl font-black text-white mb-4 italic">Nosso Compromisso</h2>
                        <p>
                            Sua privacidade é nossa prioridade número um. Esta Política de Privacidade descreve como o Gestão MEI coleta, usa e protege seus dados financeiros e pessoais dentro da plataforma, em conformidade com a LGPD (Lei Geral de Proteção de Dados).
                        </p>
                    </section>

                    <section className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white/5 p-8 rounded-[32px] border border-white/10">
                            <div className="flex items-center gap-3 text-primary mb-4">
                                <Database size={24} />
                                <h3 className="text-xl font-black text-white m-0">Quais dados coletamos?</h3>
                            </div>
                            <ul className="space-y-4 text-sm m-0 list-none p-0">
                                <li>• <strong>Identificação:</strong> Nome, E-mail e CNPJ para gestão da conta.</li>
                                <li>• <strong>Financeiros:</strong> Transações, valores e categorias inseridas.</li>
                                <li>• <strong>Documentos:</strong> Fotos de comprovantes enviadas para OCR.</li>
                                <li>• <strong>Navegação:</strong> Endereço IP e cookies para analytics.</li>
                            </ul>
                        </div>

                        <div className="bg-white/5 p-8 rounded-[32px] border border-white/10">
                            <div className="flex items-center gap-3 text-primary mb-4">
                                <Eye size={24} />
                                <h3 className="text-xl font-black text-white m-0">Como usamos seus dados?</h3>
                            </div>
                            <p className="text-sm m-0 leading-relaxed">
                                Usamos seus dados exclusivamente para fornecer os serviços de gestão financeira, gerar relatórios de faturamento, processar pagamentos de assinatura via Stripe e melhorar nossa Inteligência Artificial de extração de dados.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white mb-4">Compartilhamento de Terceiros</h2>
                        <p>
                            O Gestão MEI não vende seus dados pessoais. Compartilhamos informações apenas com parceiros essenciais:
                        </p>
                        <ul className="space-y-2">
                            <li>• <strong>Supabase:</strong> Armazenamento seguro de banco de dados e arquivos.</li>
                            <li>• <strong>Stripe:</strong> Processamento de pagamentos criptografado.</li>
                            <li>• <strong>Vercel Analytics:</strong> Monitoramento de performance da plataforma.</li>
                            <li>• <strong>Meta Pixel:</strong> Otimização de experiências de marketing.</li>
                        </ul>
                    </section>

                    <section className="bg-primary/10 p-8 rounded-[32px] border border-primary/20">
                        <div className="flex items-center gap-3 text-primary mb-4">
                            <Cookie size={24} />
                            <h2 className="text-2xl font-black text-white m-0">Cookies e Meta Pixel</h2>
                        </div>
                        <p className="m-0 italic text-sm">
                            Utilizamos cookies e o Meta Pixel (Facebook) para entender como os usuários interagem com nossa plataforma. Isso nos ajuda a oferecer uma experiência mais personalizada e a entender quais recursos são mais úteis para os microempreendedores.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white mb-4">Seus Direitos (LGPD)</h2>
                        <p>
                            Como usuário brasileiro, você tem direito a:
                        </p>
                        <ul className="space-y-2">
                            <li>• Confirmar a existência de tratamento de dados.</li>
                            <li>• Acessar seus dados e solicitar correções.</li>
                            <li>• Solicitar a exclusão definitiva da sua conta e dados.</li>
                            <li>• Revogar o consentimento a qualquer momento.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white mb-4">Exclusão de Dados</h2>
                        <p>
                            Caso deseje excluir sua conta e todos os dados financeiros associados, você pode fazê-lo diretamente nas configurações do seu perfil ou enviando uma solicitação para nosso suporte. Uma vez excluídos, os dados não poderão ser recuperados.
                        </p>
                    </section>
                </div>

                <div className="mt-24 p-12 bg-[#121212] border border-white/5 rounded-[48px] text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black mb-4">Segurança é nossa base</h3>
                        <p className="text-white/40 mb-8 font-bold leading-relaxed max-w-xl mx-auto italic">
                            Criptografamos seus dados de ponta a ponta para que você foque apenas no crescimento do seu negócio.
                        </p>
                    </div>
                </div>
            </div>

            {/* Simple Footer */}
            <footer className="py-12 border-t border-white/5 text-center text-white/20 font-bold text-[10px] uppercase tracking-[4px]">
                &copy; 2026 Gestão MEI - Gestão com Segurança.
            </footer>
        </div>
    );
};

export default Privacy;
