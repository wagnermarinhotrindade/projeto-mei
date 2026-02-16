import React from 'react';
import { Download, FileText, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
    { name: 'Venda de Produtos', value: 55 },
    { name: 'Prestação de Serviço', value: 45 },
];

const COLORS = ['#f65555', '#4ade80'];

const Reports: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-extrabold mb-1">Informe de Rendimentos</h1>
                <p className="text-white/60">Gere seus relatórios para a declaração anual</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 p-8 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <PieChartIcon className="text-primary" size={24} />
                        <h2 className="text-xl font-bold">Composição de Receita</h2>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #ffffff10', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-8 rounded-xl backdrop-blur-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <FileText className="text-primary" size={24} />
                            <h2 className="text-xl font-bold">Resumo IRPF 2026</h2>
                        </div>
                        <div className="space-y-4 mb-8 text-sm">
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-white/40 font-bold uppercase tracking-wider">Parcela Isenta</span>
                                <span className="font-bold text-green-400">R$ 14.473,00</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-white/40 font-bold uppercase tracking-wider">Rend. Tributáveis</span>
                                <span className="font-bold text-red-400">R$ 18.307,00</span>
                            </div>
                            <p className="text-white/40 text-[11px] leading-relaxed mt-4 italic">
                                * Valores baseados nos lançamentos deste ano fiscal.
                            </p>
                        </div>
                    </div>

                    <button className="w-full bg-white text-black hover:bg-white/90 font-black py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95">
                        <Download size={20} />
                        Baixar Relatório Completo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Reports;
