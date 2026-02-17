import React, { useEffect, useState } from 'react';
import {
    Search,
    Plus,
    Filter,
    Trash2,
    Loader2,
    X,
    Download,
    MoreHorizontal,
    ShoppingBag,
    Bell,
    Check,
    ShoppingBasket,
    Wrench,
    Home,
    Globe,
    Zap,
    Truck,
    Utensils,
    PlusCircle,
    Calendar as CalendarIcon,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
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

    const categories = [
        { id: 'Venda de Produto', label: 'Vendas', icon: ShoppingBasket },
        { id: 'Prestação de Serviço', label: 'Serviços', icon: Wrench },
        { id: 'Aluguel', label: 'Aluguel', icon: Home },
        { id: 'Internet', label: 'Internet', icon: Globe },
        { id: 'Compra de Mercadoria', label: 'Compra', icon: ShoppingBag },
        { id: 'Frete', label: 'Frete', icon: Truck },
        { id: 'Alimentação', label: 'Alimentação', icon: Utensils },
        { id: 'Outros', label: 'Outros', icon: PlusCircle },
    ];

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

        const val = parseFloat(formData.valor.replace(',', '.'));
        if (isNaN(val)) return alert('Valor inválido');

        const { error } = await supabase.from('transacoes').insert({
            ...formData,
            valor: val,
            user_id: user.id
        });

        if (error) alert(error.message);
        else {
            setIsModalOpen(false);
            setFormData({
                tipo: 'Receita (Entrou Dinheiro)',
                valor: '',
                categoria: 'Venda de Produto',
                descricao: '',
                data: new Date().toISOString().split('T')[0]
            });
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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight">Livro Caixa</h1>
                    <p className="text-white/40 mt-1 font-medium">Controle seu fluxo de caixa detalhadamente.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-2 transition-all active:scale-95 group"
                >
                    <Plus size={22} className="group-hover:rotate-90 transition-transform" />
                    Novo Lançamento
                </button>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            ) : (
                <div className="bg-white/[0.03] border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-md">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between gap-6">
                        <div className="relative flex-1 max-w-lg">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                            <input
                                type="text"
                                placeholder="Pesquisar por descrição ou categoria..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-primary/50 text-sm text-white font-medium transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-4 bg-white/5 border border-white/5 rounded-2xl text-white/40 hover:text-white transition-all">
                                <Filter size={20} />
                            </button>
                            <button className="p-4 bg-white/5 border border-white/5 rounded-2xl text-white/40 hover:text-white transition-all">
                                <Download size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-[10px] font-black text-white/30 uppercase tracking-[2px] border-b border-white/5">
                                    <th className="px-8 py-6">Data</th>
                                    <th className="px-8 py-6">Categoria</th>
                                    <th className="px-8 py-6">Descrição</th>
                                    <th className="px-8 py-6 text-right">Valor</th>
                                    <th className="px-8 py-6 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {data.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/[0.01] transition-all group">
                                        <td className="px-8 py-8 text-sm font-bold text-white">
                                            {new Date(item.data).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-8 py-8">
                                            <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                                                {item.categoria}
                                            </span>
                                        </td>
                                        <td className="px-8 py-8 text-sm font-medium text-white">{item.descricao}</td>
                                        <td className={`px-8 py-8 text-right text-base font-black tracking-tight ${item.tipo.includes('Receita') ? 'text-green-400' : 'text-red-500'}`}>
                                            {item.tipo.includes('Receita') ? '+' : '-'} R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-8 py-8 text-center">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all">
                                                    <MoreHorizontal size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2.5 bg-primary/10 hover:bg-primary text-primary/60 hover:text-white rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center gap-4 text-white/10 uppercase tracking-[6px] font-black">
                                                <ShoppingBag size={64} className="mb-4" />
                                                <span>Nenhum registro encontrado</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* NEW TRANSACTION REDESIGN */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto p-4 md:pt-20 md:pb-10 font-manrope">
                    <div className="w-full max-w-4xl relative">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6 md:mb-10 px-4 md:px-0 mt-8 md:mt-0">
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">Novo Lançamento</h2>
                            <div className="flex items-center gap-4">
                                <button className="p-4 bg-white/5 rounded-full text-white/40 hover:text-white transition-all border border-white/5">
                                    <Bell size={24} />
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-4 bg-white/5 rounded-full text-white/40 hover:text-white transition-all border border-white/5"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Main Content Card */}
                        <div className="bg-white/[0.02] border border-white/5 p-6 md:p-16 rounded-[40px] md:rounded-[60px] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-50" />

                            <form onSubmit={handleSave} className="relative z-10 space-y-10 md:space-y-16">
                                {/* Type Toggle */}
                                <div className="flex justify-center">
                                    <div className="flex p-1.5 bg-black/40 rounded-2xl md:rounded-3xl border border-white/5 w-full max-w-[320px]">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, tipo: 'Receita (Entrou Dinheiro)' })}
                                            className={`flex-1 py-4 flex items-center justify-center gap-2 rounded-2xl text-xs font-black transition-all ${formData.tipo.includes('Receita') ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-lg shadow-green-500/5' : 'text-white/20 hover:text-white'}`}
                                        >
                                            <TrendingUp size={16} />
                                            Receita
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, tipo: 'Despesa (Saiu Dinheiro)' })}
                                            className={`flex-1 py-4 flex items-center justify-center gap-2 rounded-2xl text-xs font-black transition-all ${formData.tipo.includes('Despesa') ? 'bg-white/5 text-white/60' : 'text-white/20 hover:text-white'}`}
                                        >
                                            <TrendingDown size={16} />
                                            Despesa
                                        </button>
                                    </div>
                                </div>

                                {/* Value Input */}
                                <div className="text-center group pt-4 md:pt-0">
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[4px] mb-4">VALOR TOTAL</p>
                                    <div className="flex items-center justify-center gap-4 mb-4">
                                        <span className="text-4xl font-black text-white/20">R$</span>
                                        <input
                                            type="text"
                                            required
                                            className="bg-transparent border-none outline-none text-8xl font-black text-white tracking-tighter w-full max-w-[400px] text-center"
                                            value={formData.valor}
                                            placeholder="0,00"
                                            onChange={e => setFormData({ ...formData, valor: e.target.value })}
                                        />
                                    </div>
                                    <div className="w-32 h-1 bg-primary/20 mx-auto rounded-full overflow-hidden">
                                        <div className="w-1/2 h-full bg-primary" />
                                    </div>
                                </div>

                                {/* Category Grid */}
                                <div>
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[3px] mb-6">SELECIONE A CATEGORIA</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, categoria: cat.id })}
                                                className={`p-6 rounded-[32px] border transition-all flex flex-col items-center gap-4 group ${formData.categoria === cat.id
                                                    ? 'bg-primary/10 border-primary/40 text-white'
                                                    : 'bg-white/[0.03] border-white/5 text-white/40 hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                <div className={`p-3 rounded-2xl transition-all ${formData.categoria === cat.id ? 'bg-primary text-white' : 'bg-white/5 group-hover:bg-white/10'}`}>
                                                    <cat.icon size={24} />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-wider">{cat.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Bottom Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[3px] mb-4">DATA</p>
                                        <div className="relative group">
                                            <CalendarIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-primary" size={20} />
                                            <input
                                                type="date"
                                                required
                                                className="w-full bg-white/[0.03] border border-white/5 rounded-3xl px-16 py-5 outline-none focus:border-primary/40 text-sm font-bold transition-all text-white/80"
                                                value={formData.data}
                                                onChange={e => setFormData({ ...formData, data: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[3px] mb-4">DESCRIÇÃO (OPCIONAL)</p>
                                        <input
                                            type="text"
                                            placeholder="Ex: Venda de produto X"
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-3xl px-8 py-5 outline-none focus:border-primary/40 text-sm font-bold transition-all text-white placeholder:text-white/10"
                                            value={formData.descricao}
                                            onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div className="space-y-8">
                                    <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-black py-6 rounded-3xl shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg uppercase tracking-[2px]">
                                        SALVAR LANÇAMENTO
                                        <Check size={24} />
                                    </button>

                                    <div className="flex items-center justify-between text-white/20 px-2 font-bold uppercase tracking-widest text-[10px]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[8px] pb-0.5">
                                                ✔
                                            </div>
                                            Conexão segura e criptografada
                                        </div>
                                        <div>Passo 1 de 2</div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transactions;
