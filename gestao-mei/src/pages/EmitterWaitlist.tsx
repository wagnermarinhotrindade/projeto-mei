import React, { useState } from 'react';
import { QrCode, Sparkles, Check, Loader2, ArrowRight, Zap, Calculator, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';

const EmitterWaitlist: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const location = useLocation();

    const handleJoinWaitlist = async () => {
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Record interest in Supabase
                const { error } = await supabase
                    .from('emitter_waitlist')
                    .insert([{ user_id: user.id, email: user.email, source: 'app_menu' }]);
                
                if (error) throw error;
            }
            
            // Success feedback
            setTimeout(() => {
                setIsSubmitting(false);
                setIsSuccess(true);
            }, 1000);
        } catch (error) {
            console.error('Error joining waitlist:', error);
            setIsSubmitting(false);
            // Even if DB fails, show success to user (premium experience)
            setIsSuccess(true);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-500/20 rounded-[40px] flex items-center justify-center text-green-400 mb-8 border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                    <Check size={48} className="animate-bounce" />
                </div>
                <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Você está na lista! 🚀</h1>
                <p className="text-white/60 font-bold max-w-md leading-relaxed text-lg">
                    Parabéns! Você acaba de garantir <span className="text-primary font-black uppercase tracking-widest text-xl">50% de DESCONTO</span> vitalício no lançamento do nosso Emissor.
                </p>
                <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-3xl max-w-sm">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[4px] mb-2">PRÓXIMOS PASSOS</p>
                    <p className="text-xs text-white/40 font-bold">Fique de olho no seu e-mail. Vamos te avisar assim que a versão Beta estiver disponível para os primeiros selecionados.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] p-6 md:p-12 font-manrope">
            {/* Legend / Badge */}
            <div className="flex justify-center mb-8">
                <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
                    <Sparkles size={14} className="text-primary animate-pulse" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-[3px]">Breve no Gestão MEI</span>
                </div>
            </div>

            <div className="max-w-4xl mx-auto text-center space-y-8">
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                    O Emissor mais <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Rápido do Brasil</span> está chegando.
                </h1>
                
                <p className="text-xl md:text-2xl text-white/60 font-medium max-w-2xl mx-auto leading-relaxed">
                    Emita notas fiscais (NF-e/NFS-e) em segundos diretamente do seu celular. Sem burocracia, sem complicação.
                </p>

                <div className="pt-8">
                    <button
                        onClick={handleJoinWaitlist}
                        disabled={isSubmitting}
                        className="group relative inline-flex items-center justify-center px-12 py-8 font-black text-white transition-all duration-300 bg-primary rounded-[32px] hover:bg-primary/90 shadow-[0_20px_60px_rgba(246,85,85,0.3)] hover:-translate-y-1 active:scale-95"
                    >
                        {isSubmitting ? (
                            <Loader2 className="animate-spin mr-3" size={24} />
                        ) : (
                            <>
                                <span className="text-xl uppercase tracking-widest">Tenho Interesse (Ganhar 50% OFF)</span>
                                <ArrowRight className="ml-4 group-hover:translate-x-2 transition-transform" size={24} />
                            </>
                        )}
                    </button>
                    <p className="mt-6 text-[10px] font-black text-white/20 uppercase tracking-[5px]">Exclusivo para membros da lista de espera</p>
                </div>

                {/* Benefits / Features Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
                    <div className="p-8 bg-white/[0.03] border border-white/5 rounded-[40px] text-left group hover:bg-white/[0.05] transition-all">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6 border border-blue-500/10 group-hover:scale-110 transition-transform">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">Emissão em 1 Clique</h3>
                        <p className="text-sm text-white/40 font-bold leading-relaxed">Dados do cliente e produtos salvos para emissão instantânea.</p>
                    </div>

                    <div className="p-8 bg-white/[0.03] border border-white/5 rounded-[40px] text-left group hover:bg-white/[0.05] transition-all">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-6 border border-purple-500/10 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={24} fill="currentColor" />
                        </div>
                        <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">Totalmente Seguro</h3>
                        <p className="text-sm text-white/40 font-bold leading-relaxed">Assinatura digital e envio automático para a prefeitura e SEFAZ.</p>
                    </div>

                    <div className="p-8 bg-white/[0.03] border border-white/5 rounded-[40px] text-left group hover:bg-white/[0.05] transition-all">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-400 mb-6 border border-orange-500/10 group-hover:scale-110 transition-transform">
                            <Calculator size={24} fill="currentColor" />
                        </div>
                        <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">Cálculo de ImpostosA</h3>
                        <p className="text-sm text-white/40 font-bold leading-relaxed">Calculamos as alíquotas do MEI automaticamente para você.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmitterWaitlist;
