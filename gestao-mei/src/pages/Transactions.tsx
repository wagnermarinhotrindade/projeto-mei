import React, { useEffect, useState } from 'react';
import { Search, Plus, Filter, Trash2, Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Transactions: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        tipo: 'Receita (Entrou Dinheiro)',
        valor: '',
        categoria: 'Venda de Produto',
        descricao: '',
        data: new Date().toISOString().split('T')[0]
    });

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('transacoes')
            .select('*')
            .eq('user_id', user.id)
            .order('data', { ascending: false });

        if (error) console.error(error);
        else setData(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('transacoes').insert({
            ...formData,
            valor: parseFloat(formData.valor),
            user_id: user.id
        });

        if (error) alert(error.message);
        else {
            setIsModalOpen(false);
            fetchData();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir?')) return;
        const { error } = await supabase.from('transacoes').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchData();
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold mb-1">Livro Caixa</h1>
                    <p className="text-white/60">Registre suas entradas e saídas diárias</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    Novo Lançamento
                </button>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={32} />
                </div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
                    <div className="p-4 border-b border-white/10 flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por descrição ou categoria..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 outline-none focus:border-primary/50 text-sm text-white"
                            />
                        </div>
                    </div>

                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-bold text-white/40 uppercase tracking-widest border-b border-white/5">
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Categoria</th>
                                <th className="px-6 py-4">Descrição</th>
                                <th className="px-6 py-4 text-right">Valor</th>
                                <th className="px-6 py-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 text-sm text-white/80">{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] font-bold uppercase text-white/80">
                                            {item.categoria}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-white/60">{item.descricao}</td>
                                    <td className={`px-6 py-4 text-right font-bold ${item.tipo.includes('Receita') ? 'text-green-400' : 'text-red-400'}`}>
                                        {item.tipo.includes('Receita') ? '+' : '-'} R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 hover:bg-red-400/10 text-white/20 hover:text-red-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-white/20 font-bold uppercase tracking-widest">
                                        Nenhum lançamento encontrado
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-background border border-white/10 p-8 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black">Novo Lançamento</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-white/40 uppercase tracking-wider mb-2">Tipo</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary text-white"
                                    value={formData.tipo}
                                    onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                                >
                                    <option className="bg-background text-white">Receita (Entrou Dinheiro)</option>
                                    <option className="bg-background text-white">Despesa (Saiu Dinheiro)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-white/40 uppercase tracking-wider mb-2">Valor (R$)</label>
                                    <input
                                        type="number" step="0.01" required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary text-white"
                                        value={formData.valor}
                                        onChange={e => setFormData({ ...formData, valor: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-white/40 uppercase tracking-wider mb-2">Data</label>
                                    <input
                                        type="date" required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary text-white"
                                        value={formData.data}
                                        onChange={e => setFormData({ ...formData, data: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-white/40 uppercase tracking-wider mb-2">Categoria</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary text-white"
                                    value={formData.categoria}
                                    onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                                >
                                    {['Venda de Produto', 'Prestação de Serviço', 'Compra de Mercadoria', 'Pagamento de Serviço', 'Aluguel', 'Energia/Água/Internet', 'Pessoal', 'Impostos (DAS)', 'Outros'].map(c => (
                                        <option key={c} className="bg-background text-white">{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-white/40 uppercase tracking-wider mb-2">Descrição</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary text-white"
                                    value={formData.descricao}
                                    onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                                />
                            </div>

                            <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                                Salvar Lançamento
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transactions;
