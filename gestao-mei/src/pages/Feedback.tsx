import React, { useState } from 'react';
import { 
    Send, 
    Lightbulb, 
    MessageSquare, 
    CheckCircle, 
    Mail,
    HelpCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const Feedback = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        titulo: '',
        tipo: 'Sugestão de Melhoria',
        mensagem: ''
    });

    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const faqItems = [
        {
            question: "Quanto tempo leva para meu feedback ser analisado?",
            answer: "Analisamos todos os feedbacks dentro de 48 horas úteis."
        },
        {
            question: "Meu feedback será implementado?",
            answer: "Todos os feedbacks são considerados. Priorizamos aqueles que beneficiam mais empreendedores."
        },
        {
            question: "Posso acompanhar o status do meu feedback?",
            answer: "Sim! Você receberá atualizações por email sobre feedbacks importantes."
        },
        {
            question: "Como reportar um bug?",
            answer: "Use a opção 'Relatar um Problema' no Seletor de Tipo e descreva detalhadamente o que aconteceu."
        }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) throw new Error('Usuário não autenticado');

            const { error } = await supabase
                .from('feedback_tickets')
                .insert([
                    {
                        user_id: user.id,
                        titulo: formData.titulo,
                        tipo: formData.tipo,
                        mensagem: formData.mensagem,
                        status: 'pendente'
                    }
                ]);

            if (error) throw error;

            setSuccess(true);
            setFormData({ titulo: '', tipo: 'Sugestão de Melhoria', mensagem: '' });
            setTimeout(() => setSuccess(false), 5000);
        } catch (error) {
            console.error('Erro ao enviar feedback:', error);
            alert('Erro ao enviar feedback. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-white tracking-tight">Feedback e Sugestões</h1>
                <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Ajude-nos a evoluir o Gestão MEI</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form Column */}
                <div className="lg:col-span-2">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:bg-primary/10" />
                        
                        <div className="relative z-10">
                            <h2 className="text-xl font-black text-white mb-2">Compartilhe sua opinião</h2>
                            <p className="text-white/60 text-sm font-medium mb-8 leading-relaxed">
                                Seu feedback é muito importante para melhorarmos o <span className="text-primary font-bold">Gestão MEI</span>. Nos conte o que você pensa!
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Título *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Resuma seu feedback em uma linha"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                                        value={formData.titulo}
                                        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Tipo de Feedback</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                    >
                                        <option value="Sugestão de Melhoria" className="bg-zinc-900">Sugestão de Melhoria</option>
                                        <option value="Relatar um Problema" className="bg-zinc-900">Relatar um Problema</option>
                                        <option value="Dúvida" className="bg-zinc-900">Dúvida</option>
                                        <option value="Outros" className="bg-zinc-900">Outros</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Sua Mensagem *</label>
                                    <textarea
                                        required
                                        rows={5}
                                        placeholder="Conte-nos o que você pensa..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-white/20 resize-none"
                                        value={formData.mensagem}
                                        onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                                    />
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{formData.mensagem.length}/500 caracteres</span>
                                        {success && (
                                            <span className="text-[9px] font-black text-green-400 uppercase tracking-widest animate-pulse">Feedback enviado com sucesso!</span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            <span>Enviar Feedback</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Info Column */}
                <div className="space-y-6">
                    {/* Dicas */}
                    <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-4 text-primary">
                            <Lightbulb size={20} />
                            <h3 className="font-black text-sm uppercase tracking-widest">Dicas</h3>
                        </div>
                        <ul className="space-y-3">
                            {[
                                "Seja específico e detalhado",
                                "Descreva o contexto do problema",
                                "Sugira soluções se possível",
                                "Seu feedback é analisado pela equipe"
                            ].map((dica, i) => (
                                <li key={i} className="flex items-start gap-3 text-white/60 text-xs font-bold leading-relaxed">
                                    <CheckCircle size={14} className="text-primary mt-0.5 shrink-0" />
                                    {dica}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Obrigado */}
                    <div className="bg-green-500/5 border border-green-500/10 rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-3 text-green-400">
                            <MessageSquare size={20} />
                            <h3 className="font-black text-sm uppercase tracking-widest">Obrigado!</h3>
                        </div>
                        <p className="text-white/60 text-xs font-bold leading-relaxed">
                            Todos os feedbacks ajudam a tornar o <span className="text-green-400">Gestão MEI</span> melhor para você e para outros empreendedores.
                        </p>
                    </div>

                    {/* Contato */}
                    <div className="bg-purple-500/5 border border-purple-500/10 rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-3 text-purple-400">
                            <Mail size={20} />
                            <h3 className="font-black text-sm uppercase tracking-widest">Contato</h3>
                        </div>
                        <p className="text-white/60 text-xs font-bold leading-relaxed">
                            Para questões urgentes, envie um email para <span className="text-purple-400">suporte@gestaomei.com.br</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12 mt-12 mb-12 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mb-48 -mr-48" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 border border-white/5 transition-all group-hover:scale-110">
                            <HelpCircle size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-white">Perguntas Frequentes</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                        {faqItems.map((item, index) => (
                            <div 
                                key={index}
                                className="border-b border-white/5 py-6 transition-all"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full flex items-center justify-between text-left group"
                                >
                                    <span className={`text-sm md:text-base font-bold transition-all ${openFaq === index ? 'text-primary' : 'text-white hover:text-white/80'}`}>
                                        {item.question}
                                    </span>
                                    {openFaq === index ? (
                                        <ChevronUp size={20} className="text-primary shrink-0" />
                                    ) : (
                                        <ChevronDown size={20} className="text-white/20 shrink-0 group-hover:text-white/40" />
                                    )}
                                </button>
                                {openFaq === index && (
                                    <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                                        <p className="text-sm text-white/50 leading-relaxed font-medium">
                                            {item.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Feedback;
