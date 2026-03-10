import React, { useMemo } from 'react';
import { CalendarClock, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

const DASCountdown: React.FC = () => {
    const { daysLeft, nextDAS, isUrgent, isPast } = useMemo(() => {
        const now = new Date();
        const day = now.getDate();
        const month = now.getMonth();
        const year = now.getFullYear();

        // DAS é devido todo dia 20
        let targetMonth = month;
        let targetYear = year;

        if (day > 20) {
            // Passou do dia 20 deste mês, próximo é mês seguinte
            targetMonth = month + 1;
            if (targetMonth > 11) {
                targetMonth = 0;
                targetYear = year + 1;
            }
        }

        const dasDate = new Date(targetYear, targetMonth, 20);
        const diffMs = dasDate.getTime() - now.getTime();
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const isPast = day === 20 && diffMs < 0;

        const nextDASLabel = dasDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });

        return {
            daysLeft: Math.max(0, daysLeft),
            nextDAS: nextDASLabel,
            isUrgent: daysLeft <= 5,
            isPast
        };
    }, []);

    return (
        <div className={`bg-white/5 border rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden group transition-all hover:border-white/20 ${isUrgent ? 'border-amber-500/30' : 'border-white/10'}`}>
            {/* Glow */}
            {isUrgent && (
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-3xl" />
            )}

            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl border ${isUrgent ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                        <CalendarClock size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Próximo DAS</p>
                        <p className="text-xs font-black text-white capitalize">{nextDAS}</p>
                    </div>
                </div>
                {isUrgent ? (
                    <AlertCircle size={16} className="text-amber-400 animate-pulse" />
                ) : (
                    <CheckCircle size={16} className="text-green-400" />
                )}
            </div>

            <div className="relative z-10">
                <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-black tracking-tighter ${isUrgent ? 'text-amber-400' : 'text-white'}`}>
                        {daysLeft}
                    </span>
                    <span className="text-white/40 font-bold text-sm">dias</span>
                </div>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">
                    {isUrgent ? '⚠️ Vencimento se aproximando!' : 'Para vencer o boleto'}
                </p>
            </div>

            <div className="relative z-10 p-3 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center group/tooltip">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-wide">Reserva Sugerida para DAS</span>
                    <span className="relative">
                        <HelpCircle size={10} className="text-white/20 cursor-help hover:text-primary transition-colors" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white text-black text-[10px] font-bold rounded-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-2xl z-50 leading-relaxed">
                            <span className="text-primary block mb-1 uppercase font-black tracking-widest text-[8px]">Dicionário MEI</span>
                            R$ 75,90 é a contribuição mensal obrigatória (INSS + ICMS/ISS) que garante seus benefícios previdenciários e alvarás.
                        </span>
                    </span>
                </div>
                <span className="text-sm font-black text-white">R$ 75,90</span>
            </div>
        </div>
    );
};

export default DASCountdown;
