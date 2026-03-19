import React, { useState, useEffect } from 'react';
import { 
    MessageSquare, 
    Send, 
    ThumbsUp, 
    MessageCircle, 
    Lightbulb, 
    Bug, 
    Heart,
    CheckCircle2,
    Clock,
    Zap,
    AlertCircle,
    UserCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FeedbackItem {
    id: string;
    user_id: string;
    user_name: string;
    category: 'bug' | 'improvement' | 'praise';
    content: string;
    status: 'analyzing' | 'developing' | 'implemented';
    votes_count: number;
    created_at: string;
    has_voted?: boolean;
}

const Feedback: React.FC = () => {
    const [category, setCategory] = useState<'bug' | 'improvement' | 'praise'>('improvement');
    const [content, setContent] = useState('');
    const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            fetchFeedback(user?.id);
        };
        init();
    }, []);

    const fetchFeedback = async (userId?: string) => {
        setLoading(true);
        try {
            // Get feedback - Ordered by votes first, then date
            const { data, error } = await supabase
                .from('user_feedback')
                .select('*')
                .order('votes_count', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Get user's votes if logged in
            let userVotes: string[] = [];
            if (userId) {
                const { data: votes } = await supabase
                    .from('feedback_votes')
                    .select('feedback_id')
                    .eq('user_id', userId);
                userVotes = votes?.map(v => v.feedback_id) || [];
            }

            const formatted = (data || []).map(item => ({
                ...item,
                has_voted: userVotes.includes(item.id)
            }));

            setFeedbackList(formatted);
        } catch (err) {
            console.error('Error fetching feedback:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !user) return;

        setIsSubmitting(true);
        try {
            const firstName = user.user_metadata?.full_name?.split(' ')[0] || 'MEI';
            
            const { error } = await supabase
                .from('user_feedback')
                .insert({
                    user_id: user.id,
                    user_name: firstName,
                    category,
                    content,
                    status: 'analyzing'
                });

            if (error) throw error;
            
            setContent('');
            fetchFeedback(user.id);
        } catch (err) {
            console.error('Error submitting feedback:', err);
            alert('Erro ao enviar feedback. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVote = async (feedbackId: string, hasVoted: boolean) => {
        if (!user || hasVoted) return;

        try {
            const { error } = await supabase
                .from('feedback_votes')
                .insert({
                    feedback_id: feedbackId,
                    user_id: user.id
                });

            if (error) throw error;
            
            // Re-fetch to see updated counts
            fetchFeedback(user.id);
        } catch (err) {
            console.error('Error voting:', err);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'implemented':
                return (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-wider">
                        <CheckCircle2 size={10} /> Implementado
                    </div>
                );
            case 'developing':
                return (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider">
                        <Zap size={10} /> Em Desenvolvimento
                    </div>
                );
            default:
                return (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-black uppercase tracking-wider">
                        <Clock size={10} /> Em Análise
                    </div>
                );
        }
    };

    const getCategoryDetails = (cat: string) => {
        switch (cat) {
            case 'bug': return { icon: Bug, label: 'Bug', color: 'text-red-500' };
            case 'praise': return { icon: Heart, label: 'Elogio', color: 'text-pink-500' };
            default: return { icon: Lightbulb, label: 'Melhoria', color: 'text-yellow-500' };
        }
    };

    return (
        <div className="animate-in fade-in duration-700 max-w-5xl mx-auto space-y-12 pb-24">
            {/* Header com Estilo Neon Red */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-600/10 border border-red-600/20 text-red-500 text-[10px] font-black uppercase tracking-[2px]">
                        Comunidade
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                        Central de <span className="text-red-600">Feedback</span>
                    </h1>
                    <p className="text-white/40 font-bold max-w-lg">
                        Ajude-nos a construir o software definitivo para o MEI. Reporte bugs, sugira melhorias ou envie um elogio para nossa equipe.
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-12">
                {/* Formulário - Coluna Menor */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl group-hover:bg-red-600/10 transition-all duration-700" />
                        
                        <h2 className="text-xl font-black text-white mb-6 relative z-10">Sua Opinião</h2>
                        
                        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[2px] ml-1">Categoria</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'bug', label: 'Bug', icon: '🐛' },
                                        { id: 'improvement', label: 'Melhoria', icon: '💡' },
                                        { id: 'praise', label: 'Elogio', icon: '❤️' }
                                    ].map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategory(cat.id as any)}
                                            className={`py-3 rounded-2xl border font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                                                category === cat.id 
                                                ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20' 
                                                : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10'
                                            }`}
                                        >
                                            <span className="text-lg">{cat.icon}</span>
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[2px] ml-1">Mensagem</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Conte para nós: o que tornaria o seu dia a dia mais fácil no Gestão MEI?"
                                    className="w-full h-40 bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-sm font-medium focus:outline-none focus:border-red-600/50 transition-all resize-none placeholder:text-white/10"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !content.trim()}
                                className="w-full bg-red-600 hover:bg-red-500 disabled:bg-white/5 disabled:text-white/20 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                            >
                                {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
                                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </form>
                    </div>

                    <div className="p-8 bg-red-600/5 border border-red-600/10 rounded-[32px]">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500 shrink-0">
                                <Heart size={24} fill="currentColor" />
                            </div>
                            <div>
                                <h4 className="text-white font-black text-sm uppercase tracking-widest mb-1">Obrigado!</h4>
                                <p className="text-white/40 text-xs font-bold leading-relaxed">
                                    Analisamos todas as sugestões pessoalmente. Sua ideia pode ser a próxima funcionalidade do Gestão MEI.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mural - Coluna Maior */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            <MessageCircle size={32} className="text-red-600" /> Mural de Ideias
                        </h2>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[2px]">Rankeadas por votos</span>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-dotted border-white/10 rounded-[48px]">
                            <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-white/20 text-xs font-black uppercase tracking-widest">Sintonizando sugestões...</p>
                        </div>
                    ) : feedbackList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white/[0.02] border border-dotted border-white/10 rounded-[48px] text-center px-12">
                            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-white/10 mb-6">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-white/40 font-black mb-2 uppercase tracking-widest text-sm">Nenhum feedback ainda</h3>
                            <p className="text-white/20 text-xs font-bold leading-relaxed">Seja o primeiro a compartilhar uma ideia e ajude a comunidade!</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {feedbackList.map((item) => {
                                const details = getCategoryDetails(item.category);
                                const Icon = details.icon;
                                
                                return (
                                    <div 
                                        key={item.id}
                                        className="bg-white/[0.02] border border-white/5 p-6 rounded-[32px] flex items-start gap-6 hover:bg-white/[0.04] transition-all group relative overflow-hidden"
                                    >
                                        <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 border border-white/10 min-w-[56px] transition-all group-hover:border-red-600/30">
                                            <button 
                                                onClick={() => handleVote(item.id, !!item.has_voted)}
                                                disabled={item.has_voted}
                                                className={`transition-all ${
                                                    item.has_voted 
                                                    ? 'text-red-500 cursor-default scale-110' 
                                                    : 'text-white/20 hover:text-red-500 active:scale-90 hover:scale-125'
                                                }`}
                                            >
                                                <ThumbsUp size={20} fill={item.has_voted ? 'currentColor' : 'none'} strokeWidth={item.has_voted ? 0 : 2.5} />
                                            </button>
                                            <span className={`text-base font-black ${item.has_voted ? 'text-white' : 'text-white/40'}`}>
                                                {item.votes_count}
                                            </span>
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center flex-wrap gap-3">
                                                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                                                    <Icon size={12} className={details.color} />
                                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{details.label}</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    <UserCircle2 size={12} className="text-white/20" />
                                                    <span className="text-xs font-black text-white/50">{item.user_name || 'Usuário MEI'}</span>
                                                </div>

                                                <div className="h-1 w-1 rounded-full bg-white/10 ml-auto hidden md:block" />
                                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest hidden md:block">
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <p className="text-sm font-medium text-white/80 leading-relaxed whitespace-pre-wrap">
                                                {item.content}
                                            </p>

                                            <div className="flex items-center gap-3">
                                                {getStatusBadge(item.status)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Feedback;
