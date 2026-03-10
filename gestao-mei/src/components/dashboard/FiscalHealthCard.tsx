import React from 'react';
import { Shield, AlertTriangle, XCircle, TrendingUp, HelpCircle } from 'lucide-react';

interface FiscalHealthCardProps {
    faturamentoAtual: number;
    projecaoAnual: number;
    mesesAtivos: number;
}

const MEI_LIMIT = 81000;

const FiscalHealthCard: React.FC<FiscalHealthCardProps> = ({ faturamentoAtual, projecaoAnual, mesesAtivos }) => {
    const progressoReal = Math.min((faturamentoAtual / MEI_LIMIT) * 100, 100);
    const progressoProjecao = Math.min((projecaoAnual / MEI_LIMIT) * 100, 100);
    const isRisk = projecaoAnual > MEI_LIMIT;
    const isWarning = projecaoAnual > MEI_LIMIT * 0.7 && !isRisk;
    const disponivel = Math.max(0, MEI_LIMIT - faturamentoAtual);

    const barColor = isRisk
        ? 'from-red-500 to-red-400'
        : isWarning
        ? 'from-amber-500 to-yellow-400'
        : 'from-primary to-[#ff8585]';

    const badgeBg = isRisk
        ? 'bg-red-500/10 border-red-500/20 text-red-400'
        : isWarning
        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        : 'bg-green-500/10 border-green-500/20 text-green-400';

    const StatusIcon = isRisk ? XCircle : isWarning ? AlertTriangle : Shield;
    const statusText = isRisk
        ? 'RISCO DE DESENQUADRAMENTO'
        : isWarning
        ? 'ATENÇÃO: LIMITE SE APROXIMANDO'
        : 'SAÚDE FISCAL OK';

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col relative overflow-hidden group hover:border-white/20 transition-all">
            {/* Background glow */}
            <div className={`absolute -right-8 -bottom-8 w-40 h-40 rounded-full blur-3xl opacity-10 ${isRisk ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-primary'}`} />

            <div className="relative z-10 flex flex-col h-full gap-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl border ${isRisk ? 'bg-red-500/10 border-red-500/20 text-red-400' : isWarning ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                            <Shield size={22} />
                        </div>
                        <h3 className="text-lg font-black text-white">Saúde Fiscal</h3>
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${badgeBg}`}>
                        <StatusIcon size={10} />
                        {isRisk ? 'RISCO' : isWarning ? 'ALERTA' : 'OK'}
                    </span>
                </div>

                {/* Progress bar — real */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Faturado / Limite</p>
                        <p className="text-xl font-black text-white">{progressoReal.toFixed(1)}%</p>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div
                            className={`h-full bg-gradient-to-r ${barColor} transition-all duration-1000 shadow-[0_0_12px_rgba(246,85,85,0.3)]`}
                            style={{ width: `${progressoReal}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1.5">
                        <span className="text-[9px] text-white/20 font-bold">R$ 0</span>
                        <span className="text-[9px] text-white/20 font-bold">R$ 81.000</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 group/tooltip">
                        <div className="flex items-center gap-2">
                            <span className="text-white/40 font-bold text-xs uppercase tracking-widest">Faturamento Atual</span>
                            <span className="relative">
                                <HelpCircle size={10} className="text-white/20 cursor-help hover:text-primary transition-colors" />
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white text-black text-[10px] font-bold rounded-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-2xl z-50 leading-relaxed">
                                    <span className="text-primary block mb-1 uppercase font-black tracking-widest text-[8px]">Dicionário MEI</span>
                                    O limite de R$ 81k é baseado em sua Receita Bruta acumulada. Despesas não são deduzidas para este cálculo.
                                </span>
                            </span>
                        </div>
                        <span className="text-white font-black text-sm">
                            R$ {faturamentoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-2xl border ${isRisk ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/5'}`}>
                        <span className="text-white/40 font-bold text-xs flex items-center gap-1.5">
                            <TrendingUp size={12} className="text-primary" />
                            Projeção Anual
                        </span>
                        <span className={`font-black text-sm ${isRisk ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-white'}`}>
                            R$ {projecaoAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-white/40 font-bold text-xs">Disponível</span>
                        <span className="text-green-400 font-black text-sm">
                            R$ {disponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                {/* Alert or tip */}
                {isRisk ? (
                    <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                        <p className="text-red-400 text-[10px] font-black leading-relaxed uppercase tracking-wide">
                            ⚠️ Este ritmo de faturamento ultrapassa o limite MEI. Consulte um contador.
                        </p>
                    </div>
                ) : isWarning ? (
                    <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                        <p className="text-amber-400 text-[10px] font-black leading-relaxed">
                            📊 Sua projeção chega a {progressoProjecao.toFixed(0)}% do limite. Monitore de perto.
                        </p>
                    </div>
                ) : (
                    <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                        <p className="text-primary text-[10px] font-black leading-relaxed">
                            ✅ Baseado em {mesesAtivos} {mesesAtivos === 1 ? 'mês ativo' : 'meses ativos'} no ano. Limite confortável.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FiscalHealthCard;
