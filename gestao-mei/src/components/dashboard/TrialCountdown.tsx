import React, { useMemo } from 'react';
import { Zap, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

interface TrialCountdownProps {
    createdAt: string;
    onUpgrade: () => void;
}

const TrialCountdown: React.FC<TrialCountdownProps> = ({ createdAt, onUpgrade }) => {
    const { daysLeft, progress, isExpired } = useMemo(() => {
        const createdDate = new Date(createdAt);
        const trialEndDate = new Date(createdDate.getTime() + 15 * 24 * 60 * 60 * 1000);
        const now = new Date();
        
        const diffMs = trialEndDate.getTime() - now.getTime();
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const totalDuration = 15 * 24 * 60 * 60 * 1000;
        const elapsed = now.getTime() - createdDate.getTime();
        const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

        return {
            daysLeft: Math.max(0, daysLeft),
            progress,
            isExpired: diffMs <= 0
        };
    }, [createdAt]);

    if (isExpired) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/20 rounded-[32px] p-6 relative overflow-hidden group transition-all hover:border-indigo-500/40 shadow-xl shadow-indigo-500/5">
            {/* Glossy Overlay */}
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-500/20 rounded-2xl border border-indigo-500/20 text-indigo-400">
                            <Zap size={18} fill="currentColor" className="animate-pulse" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-400/60 uppercase tracking-[3px]">Acesso VIP Elite</p>
                            <p className="text-sm font-black text-white">Teste Grátis Ativo</p>
                        </div>
                    </div>
                    <ShieldCheck size={20} className="text-indigo-400/40" />
                </div>

                <div className="space-y-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-white tracking-tighter">
                            {daysLeft}
                        </span>
                        <span className="text-white/40 font-bold text-sm">dias restantes</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-primary transition-all duration-1000 ease-out"
                            style={{ width: `${100 - progress}%` }}
                        />
                    </div>

                    <p className="text-[10px] text-white/40 font-bold leading-relaxed">
                        Você está usando o <span className="text-white">Plano Elite</span> com todos os recursos liberados. Aproveite para organizar seu MEI!
                    </p>

                    <button 
                        onClick={onUpgrade}
                        className="w-full mt-2 flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group/btn"
                    >
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Garantir Plano Vitalício</span>
                        <ArrowRight size={14} className="text-indigo-400 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrialCountdown;
