import React from 'react';
import {
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Legend,
} from 'recharts';

interface MonthData {
    name: string;
    faturado: number;
    projecao?: number;
    cumulative?: number;
    cumulativeProjection?: number;
}

interface PredictiveChartProps {
    data: MonthData[];
}

const MEI_LIMIT = 81000;

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 shadow-2xl">
                <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-2">{label}</p>
                {payload.map((entry: any, i: number) => (
                    <p key={i} className="text-sm font-black" style={{ color: entry.color }}>
                        {entry.name}: R$ {Number(entry.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const PredictiveChart: React.FC<PredictiveChartProps> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorFaturado" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProjecao" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f65555" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#f65555" stopOpacity={0} />
                    </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />

                <XAxis
                    dataKey="name"
                    stroke="#ffffff30"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    fontWeight={700}
                />
                <YAxis
                    stroke="#ffffff30"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                    fontWeight={700}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Linha de Limite MEI */}
                <ReferenceLine
                    y={MEI_LIMIT}
                    stroke="#f65555"
                    strokeDasharray="6 4"
                    strokeWidth={1.5}
                    label={{ value: 'Limite R$ 81k', position: 'right', fill: '#f65555', fontSize: 10, fontWeight: 700 }}
                />

                {/* Área faturamento real */}
                <Area
                    type="monotone"
                    dataKey="cumulative"
                    name="Faturado Acumulado"
                    stroke="#4ade80"
                    strokeWidth={2.5}
                    fill="url(#colorFaturado)"
                    dot={{ fill: '#4ade80', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#4ade80' }}
                />

                {/* Linha de projeção (tracejada) */}
                <Line
                    type="monotone"
                    dataKey="cumulativeProjection"
                    name="Projeção Anual"
                    stroke="#f65555"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    dot={false}
                    activeDot={{ r: 5, fill: '#f65555' }}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
};

export default PredictiveChart;
