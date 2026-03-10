import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Scale, ShieldCheck, AlertCircle } from 'lucide-react';
import SEO from '../components/layout/SEO';

const Terms: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-manrope selection:bg-primary/30">
            <SEO title="Termos de Uso" description="Leia os Termos de Uso do Gestão MEI e saiba mais sobre as isenções de responsabilidade fiscal e precisão de OCR." />
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
                        <Scale size={32} />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Termos de Uso</h1>
                    <p className="text-white/40 font-medium text-lg italic">Última atualização: 10 de Março de 2026</p>
                </div>

                <div className="prose prose-invert prose-primary max-w-none space-y-12 text-white/70 leading-relaxed font-medium">
                    <section>
                        <h2 className="text-2xl font-black text-white mb-4">1. Aceitação dos Termos</h2>
                        <p>
                            Ao acessar e usar a plataforma Gestão MEI, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, você não deverá acessar o serviço.
                        </p>
                    </section>

                    <section className="bg-white/5 p-8 rounded-[32px] border border-white/10">
                        <div className="flex items-center gap-3 text-primary mb-4">
                            <AlertCircle size={24} />
                            <h2 className="text-2xl font-black text-white m-0">2. Isenção de Responsabilidade Fiscal</h2>
                        </div>
                        <p className="m-0 italic">
                            O Gestão MEI é uma ferramenta de auxílio à gestão financeira e não substitui, em hipótese alguma, o aconselhamento de um contador profissional ou de um órgão oficial (como o SEBRAE ou a Receita Federal). 
                            A responsabilidade final pela exatidão das declarações fiscais e lançamentos é exclusiva do usuário. Não nos responsabilizamos por multas, atrasos ou inconformidades geradas pelo uso indevido da plataforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white mb-4">3. Inteligência Artificial e OCR</h2>
                        <p>
                            Nossa tecnologia de extração de dados de comprovantes (OCR via Inteligência Artificial) opera com base em "melhor esforço". Fatores como iluminação da foto, nitidez e estado do papel influenciam a precisão. 
                            <strong> É obrigação do usuário conferir todos os valores, datas e categorias extraídos antes de confirmar o lançamento.</strong>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white mb-4">4. Assinaturas e Pagamentos</h2>
                        <p>
                            O Gestão MEI oferece planos gratuitos e pagos (Pro). O acesso aos recursos Pro é liberado mediante confirmação de pagamento via Stripe. 
                            Cancelamentos podem ser feitos a qualquer momento, mantendo o acesso até o fim do período já pago. Não oferecemos reembolso por períodos parciais de uso.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white mb-4">5. Propriedade Intelectual</h2>
                        <p>
                            Todo o design, interface, software e algoritmos da plataforma são de propriedade exclusiva do Gestão MEI. O uso da plataforma concede ao usuário uma licença de uso limitada, não exclusiva e revogável.
                        </p>
                    </section>

                    <section className="bg-primary/10 p-8 rounded-[32px] border border-primary/20">
                        <div className="flex items-center gap-3 text-primary mb-4">
                            <ShieldCheck size={24} />
                            <h2 className="text-2xl font-black text-white m-0">6. Segurança de Dados</h2>
                        </div>
                        <p className="m-0">
                            Utilizamos infraestrutura de nível bancário (Supabase e Stripe) para proteger suas informações. No entanto, o usuário é responsável por manter o sigilo de sua senha e credenciais de acesso.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white mb-4">7. Alterações nos Termos</h2>
                        <p>
                            Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão notificadas via e-mail ou aviso na plataforma.
                        </p>
                    </section>
                </div>

                <div className="mt-24 p-12 bg-gradient-to-br from-primary/10 to-transparent border border-white/5 rounded-[48px] text-center">
                    <h3 className="text-xl font-black mb-4">Dúvidas sobre os termos?</h3>
                    <p className="text-white/40 mb-8 font-bold italic">Nossa equipe está pronta para ajudar.</p>
                    <button 
                        onClick={() => navigate('/feedback')}
                        className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/90 transition-all hover:scale-105 active:scale-95"
                    >
                        Contatar Suporte
                    </button>
                </div>
            </div>

            {/* Simple Footer */}
            <footer className="py-12 border-t border-white/5 text-center text-white/20 font-bold text-[10px] uppercase tracking-[4px]">
                &copy; 2026 Gestão MEI - Todos os direitos reservados.
            </footer>
        </div>
    );
};

export default Terms;
