import React, { useState } from 'react';
import { MessageSquare, Send, Loader2, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const FeedbackHub: React.FC = () => {
    const [message, setMessage] = useState('');
    const [type, setType] = useState('Sugestão');
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message) return;

        setIsSending(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            alert('Você precisa estar logado para enviar feedback.');
            setIsSending(false);
            return;
        }

        const { error } = await supabase
            .from('feedback_tickets')
            .insert({
                user_id: user.id,
                mensagem: message,
                tipo: type
            });

        if (error) {
            alert('Erro ao enviar feedback: ' + error.message);
        } else {
            setSent(true);
            setMessage('');
            setTimeout(() => setSent(false), 5000);
        }
        setIsSending(false);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
            
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl text-primary">
                    <MessageSquare size={20} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white">Sugestões e Melhorias</h3>
                    <p className="text-white/40 text-xs font-bold">Sua ideia pode ser a próxima funcionalidade Pro</p>
                </div>
            </div>

            {sent ? (
                <div className="py-12 text-center animate-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 mx-auto mb-4 border border-green-500/20">
                        <Star size={32} fill="currentColor" />
                    </div>
                    <h4 className="text-lg font-black text-white mb-2">Obrigado!</h4>
                    <p className="text-sm text-white/40 font-medium px-8">Recebemos sua mensagem. Juntos vamos construir o melhor assistente para MEIs do Brasil.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                        {['Sugestão', 'Bug', 'Dúvida'].map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                    type === t ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white/50'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Como podemos melhorar sua experiência hoje?"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary/50 text-white text-sm font-medium min-h-[120px] placeholder:text-white/10 transition-all resize-none"
                    />

                    <button
                        type="submit"
                        disabled={isSending || !message}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:-translate-y-1 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:translate-y-0"
                    >
                        {isSending ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : (
                            <Send size={16} />
                        )}
                        {isSending ? 'Enviando...' : 'Enviar Feedback'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default FeedbackHub;
