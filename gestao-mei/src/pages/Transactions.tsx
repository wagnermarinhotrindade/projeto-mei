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
    TrendingDown,
    Sparkles,
    Upload,
    RefreshCw,
    Paperclip,
    Lock,
    Fuel,
    Stethoscope,
    Receipt,
    Tag,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { startStripeCheckout } from '../lib/stripe';

const SUPABASE_FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL?.replace('.supabase.co', '.supabase.co/functions/v1') || '';

interface FormData {
    tipo: string;
    valor: string;
    categoria: string;
    descricao: string;
    data: string;
    tipo_receita: 'servico' | 'comercio' | '';
    is_recorrente: boolean;
    recurrence_day: string;
}

const Transactions: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState<FormData>({
        tipo: 'Receita (Entrou Dinheiro)',
        valor: '',
        categoria: 'Venda de Produto',
        descricao: '',
        data: new Date().toISOString().split('T')[0],
        tipo_receita: 'comercio',
        is_recorrente: false,
        recurrence_day: String(new Date().getDate()),
    });
    const [comprovante, setComprovante] = useState<File | null>(null);
    const [uploadPreview, setUploadPreview] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
    const [limitReason, setLimitReason] = useState('');
    const [user, setUser] = useState<any>(null);
    const [isPro, setIsPro] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    const handleUpgrade = async () => {
        if (!user) return;
        setCheckoutLoading(true);
        try {
            const success = await startStripeCheckout('price_1T2d6SLjW93jPn5ye6wN7Ptg', user.id, user.email || '');
            if (!success) setCheckoutLoading(false);
        } catch (error) {
            setCheckoutLoading(false);
        }
    };

    const categories = [
        { id: 'Venda de Produto', label: 'Vendas', icon: ShoppingBasket },
        { id: 'Prestação de Serviço', label: 'Serviços', icon: Wrench },
        { id: 'Aluguel', label: 'Aluguel', icon: Home },
        { id: 'Internet', label: 'Internet', icon: Globe },
        { id: 'Compra de Mercadoria', label: 'Compra', icon: ShoppingBag },
        { id: 'Frete', label: 'Frete', icon: Truck },
        { id: 'Alimentação', label: 'Alimentação', icon: Utensils },
        { id: 'Combustível', label: 'Combustível', icon: Fuel },
        { id: 'Saúde', label: 'Saúde', icon: Stethoscope },
        { id: 'Impostos (DAS)', label: 'DAS/Impostos', icon: Receipt },
        { id: 'Outros', label: 'Outros', icon: PlusCircle },
    ];

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUser(user);

        const { data: profile } = await supabase
            .from('users_profile')
            .select('plano')
            .eq('id', user.id)
            .single();

        setIsPro(profile?.plano === 'pro');

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

    const resetForm = () => {
        setFormData({
            tipo: 'Receita (Entrou Dinheiro)',
            valor: '',
            categoria: 'Venda de Produto',
            descricao: '',
            data: new Date().toISOString().split('T')[0],
            tipo_receita: 'comercio',
            is_recorrente: false,
            recurrence_day: String(new Date().getDate()),
        });
        setComprovante(null);
        setUploadPreview(null);
        setEditingId(null);
    };

    const handleEdit = (item: any) => {
        setFormData({
            tipo: item.tipo,
            valor: String(item.valor).replace('.', ','),
            categoria: item.categoria,
            descricao: item.descricao || '',
            data: item.data,
            tipo_receita: item.tipo_receita || '',
            is_recorrente: item.is_recorrente || false,
            recurrence_day: String(item.recurrence_day || new Date().getDate()),
        });
        setEditingId(item.id);
        setUploadPreview(item.comprovante_url || null);
        setIsModalOpen(true);
        setActiveMenuId(null);
    };

    // --- IA: Categorizar com palavras-chave ---
    const handleCategorizarIA = async () => {
        if (!formData.descricao.trim()) {
            alert('Digite uma descrição para usar a IA de categorização.');
            return;
        }
        setIsAiLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/categorize-transaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({ descricao: formData.descricao }),
            });
            if (response.ok) {
                const result = await response.json();
                setFormData(prev => ({
                    ...prev,
                    categoria: result.categoria || prev.categoria,
                    tipo_receita: result.tipo_receita || prev.tipo_receita,
                    tipo: result.tipo === 'receita'
                        ? 'Receita (Entrou Dinheiro)'
                        : result.tipo === 'despesa'
                        ? 'Despesa (Saiu Dinheiro)'
                        : prev.tipo,
                }));
            }
        } catch (err) {
            console.error('Erro na categorização IA:', err);
        }
        setIsAiLoading(false);
    };

    // --- Upload de comprovante ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setComprovante(file);
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => setUploadPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setUploadPreview(null);
        }
    };

    const uploadComprovante = async (userId: string): Promise<string | null> => {
        if (!comprovante) return null;
        const ext = comprovante.name.split('.').pop();
        const path = `${userId}/${Date.now()}.${ext}`;
        const { error } = await supabase.storage
            .from('comprovantes')
            .upload(path, comprovante, { contentType: comprovante.type });
        if (error) { console.error('Upload error:', error); return null; }
        const { data: urlData } = supabase.storage.from('comprovantes').getPublicUrl(path);
        return urlData?.publicUrl || null;
    };

    // --- Salvar lançamento ---
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setIsSubmitting(true);

        // Verificação de plano
        const { data: profile } = await supabase
            .from('users_profile')
            .select('plano')
            .eq('id', user.id)
            .single();

        const userIsPro = profile?.plano === 'pro';

        if (!userIsPro) {
            const { count } = await supabase
                .from('transacoes')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            const { data: transacoes } = await supabase
                .from('transacoes')
                .select('valor')
                .eq('user_id', user.id);

            const totalVolume = transacoes?.reduce((acc, t) => acc + t.valor, 0) || 0;
            const currentVal = parseFloat(formData.valor.replace(',', '.'));

            if (count !== null && count >= 20) {
                setLimitReason('Você atingiu o limite de 20 lançamentos do seu plano gratuito.');
                setIsLimitModalOpen(true);
                setIsSubmitting(false);
                return;
            }
            if (totalVolume + currentVal > 1000) {
                setLimitReason(`O plano gratuito permite movimentação de até R$ 1.000,00. Seu volume atual já é R$ ${totalVolume.toLocaleString('pt-BR')}.`);
                setIsLimitModalOpen(true);
                setIsSubmitting(false);
                return;
            }
        }

        const val = parseFloat(formData.valor.replace(',', '.'));
        if (isNaN(val)) { alert('Valor inválido'); setIsSubmitting(false); return; }

        // Upload do comprovante (somente Pro)
        let comprovante_url: string | null = null;
        if (userIsPro && comprovante) {
            comprovante_url = await uploadComprovante(user.id);
        }

        const payload: any = {
            tipo: formData.tipo,
            valor: val,
            categoria: formData.categoria,
            descricao: formData.descricao,
            data: formData.data,
            user_id: user.id,
            comprovante_url,
            tipo_receita: formData.tipo.includes('Receita') ? (formData.tipo_receita || null) : null,
            is_recorrente: formData.is_recorrente,
            recurrence_day: formData.is_recorrente ? parseInt(formData.recurrence_day) : null,
        };

        let result;
        if (editingId) {
            result = await supabase
                .from('transacoes')
                .update(payload)
                .eq('id', editingId)
                .eq('user_id', user.id); // Proteção: só edita se for o dono
        } else {
            result = await supabase.from('transacoes').insert(payload);
        }

        if (result.error) {
            alert(result.error.message);
        } else {
            setIsModalOpen(false);
            resetForm();
            fetchData();
        }
        setIsSubmitting(false);
    };

    const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir?')) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('transacoes')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id); // Proteção: só deleta se for o dono
        
        if (error) alert(error.message);
        else fetchData();
        setActiveMenuId(null);
    };

    const filteredData = data.filter(item =>
        !searchTerm ||
        item.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const faturamentoTotal = data
        .filter(t => t.tipo?.includes('Receita'))
        .reduce((acc, t) => acc + (t.valor || 0), 0);
    
    const isLimitReached = !isPro && faturamentoTotal >= 1000;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight">Livro Caixa</h1>
                    <p className="text-white/40 mt-1 font-medium">Controle seu fluxo de caixa detalhadamente.</p>
                </div>
                {isLimitReached ? (
                    <button
                        onClick={handleUpgrade}
                        className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black px-8 py-3 rounded-2xl shadow-xl shadow-red-600/20 flex flex-col items-center justify-center transition-all active:scale-95 group text-sm relative overflow-hidden"
                    >
                        <span className="flex items-center gap-2 z-10"><Lock size={16} /> Limite de R$ 1000 atingido.</span>
                        <span className="text-[10px] uppercase tracking-widest font-bold opacity-80 z-10">Migre para o Pro para continuar</span>
                    </button>
                ) : (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-2 transition-all active:scale-95 group"
                    >
                        <Plus size={22} className="group-hover:rotate-90 transition-transform" />
                        Novo Lançamento
                    </button>
                )}
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
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
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
                                    <th className="px-8 py-6">Tipo</th>
                                    <th className="px-8 py-6 text-right">Valor</th>
                                    <th className="px-8 py-6 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {filteredData.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/[0.01] transition-all group">
                                        <td className="px-8 py-6 text-sm font-bold text-white">
                                            {new Date(item.data).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                                                {item.categoria}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-medium text-white">
                                            <div className="flex items-center gap-2">
                                                {item.descricao}
                                                {item.comprovante_url && (
                                                    <button 
                                                        onClick={() => setViewingImageUrl(item.comprovante_url)}
                                                        className="p-1 hover:bg-white/10 rounded-md transition-all text-primary"
                                                        aria-label="Ver comprovante"
                                                    >
                                                        {item.comprovante_url.toLowerCase().endsWith('.pdf') ? <Paperclip size={14} /> : <Search size={14} />}
                                                    </button>
                                                )}
                                                {item.is_recorrente && (
                                                    <RefreshCw size={12} className="text-white/30" aria-label="Recorrente" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {item.tipo_receita && (
                                                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${item.tipo_receita === 'servico' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'}`}>
                                                    {item.tipo_receita === 'servico' ? 'Serviço' : 'Comércio'}
                                                </span>
                                            )}
                                        </td>
                                        <td className={`px-8 py-6 text-right text-base font-black tracking-tight ${item.tipo?.includes('Receita') ? 'text-green-400' : 'text-red-500'}`}>
                                            {item.tipo?.includes('Receita') ? '+' : '-'} R$ {item.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex items-center justify-center gap-2 relative">
                                                <button 
                                                    onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                                                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all"
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>
                                                
                                                {activeMenuId === item.id && (
                                                    <div className="absolute right-full mr-2 z-50 bg-zinc-900 border border-white/10 rounded-2xl p-2 shadow-2xl min-w-[140px] animate-in fade-in slide-in-from-right-2">
                                                        <button 
                                                            onClick={() => handleEdit(item)}
                                                            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                                        >
                                                            <Sparkles size={14} className="text-primary" /> Editar
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(item.id)}
                                                            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500/70 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                                                        >
                                                            <Trash2 size={14} /> Excluir
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredData.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-24 text-center">
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

            {/* ===== VISUALIZADOR DE COMPROVANTE (MODAL) ===== */}
            {viewingImageUrl && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 md:p-10 animate-in fade-in zoom-in duration-300">
                    <button 
                        onClick={() => setViewingImageUrl(null)}
                        className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-10"
                    >
                        <X size={24} />
                    </button>
                    <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
                        {viewingImageUrl.toLowerCase().endsWith('.pdf') ? (
                            <iframe src={viewingImageUrl} className="w-full h-full rounded-2xl border border-white/10" />
                        ) : (
                            <img 
                                src={viewingImageUrl} 
                                alt="Comprovante" 
                                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl shadow-black/50 border border-white/5" 
                            />
                        )}
                    </div>
                </div>
            )}

            {/* ===== MODAL DE NOVO LANÇAMENTO ===== */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto p-4 md:pt-10 md:pb-10 font-manrope">
                    <div className="w-full max-w-4xl relative">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6 md:mb-8 px-4 md:px-0 mt-8 md:mt-0">
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                                {editingId ? 'Editar Lançamento' : 'Novo Lançamento'}
                            </h2>
                            <div className="flex items-center gap-4">
                                {editingId && (
                                    <span className="bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Editando Registro</span>
                                )}
                                <button
                                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                                    className="p-4 bg-white/5 rounded-full text-white/40 hover:text-white transition-all border border-white/5"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-white/[0.02] border border-white/5 p-6 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />

                            <form onSubmit={handleSave} className="relative z-10 space-y-8 md:space-y-12">
                                {/* Type Toggle */}
                                <div className="flex justify-center">
                                    <div className="flex p-1.5 bg-black/40 rounded-2xl border border-white/5 w-full max-w-[320px]">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, tipo: 'Receita (Entrou Dinheiro)', tipo_receita: 'comercio' })}
                                            className={`flex-1 py-4 flex items-center justify-center gap-2 rounded-2xl text-xs font-black transition-all ${formData.tipo.includes('Receita') ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-lg shadow-green-500/5' : 'text-white/20 hover:text-white'}`}
                                        >
                                            <TrendingUp size={16} /> Receita
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, tipo: 'Despesa (Saiu Dinheiro)', tipo_receita: '' })}
                                            className={`flex-1 py-4 flex items-center justify-center gap-2 rounded-2xl text-xs font-black transition-all ${formData.tipo.includes('Despesa') ? 'bg-white/5 text-white/60' : 'text-white/20 hover:text-white'}`}
                                        >
                                            <TrendingDown size={16} /> Despesa
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
                                            className="bg-transparent border-none outline-none text-7xl md:text-8xl font-black text-white tracking-tighter w-full max-w-[380px] text-center"
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
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[3px] mb-4">SELECIONE A CATEGORIA</p>
                                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => {
                                                    const isExpense = ['Aluguel', 'Internet', 'Compra de Mercadoria', 'Frete', 'Alimentação', 'Combustível', 'Saúde', 'Impostos (DAS)'].includes(cat.id);
                                                    setFormData({ 
                                                        ...formData, 
                                                        categoria: cat.id,
                                                        tipo: isExpense ? 'Despesa (Saiu Dinheiro)' : formData.tipo,
                                                        tipo_receita: isExpense ? '' : formData.tipo_receita
                                                    });
                                                }}
                                                className={`p-4 rounded-[24px] border transition-all flex flex-col items-center gap-3 group ${formData.categoria === cat.id
                                                    ? 'bg-primary/10 border-primary/40 text-white'
                                                    : 'bg-white/[0.03] border-white/5 text-white/40 hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                <div className={`p-2.5 rounded-xl transition-all ${formData.categoria === cat.id ? 'bg-primary text-white' : 'bg-white/5 group-hover:bg-white/10'}`}>
                                                    <cat.icon size={18} />
                                                </div>
                                                <span className="text-[9px] font-black uppercase tracking-wider text-center leading-tight">{cat.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* tipo_receita (só para receitas) */}
                                {formData.tipo.includes('Receita') && (
                                    <div>
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[3px] mb-4 flex items-center gap-2">
                                            <Tag size={12} /> TIPO DE RECEITA (DASN-SIMEI)
                                        </p>
                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, tipo_receita: 'servico' })}
                                                className={`flex-1 py-4 px-6 rounded-2xl border text-sm font-black transition-all ${formData.tipo_receita === 'servico' ? 'bg-blue-500/10 border-blue-500/40 text-blue-400' : 'bg-white/[0.03] border-white/5 text-white/40 hover:bg-white/5 hover:text-white'}`}
                                            >
                                                🔧 Prestação de Serviço
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, tipo_receita: 'comercio' })}
                                                className={`flex-1 py-4 px-6 rounded-2xl border text-sm font-black transition-all ${formData.tipo_receita === 'comercio' ? 'bg-purple-500/10 border-purple-500/40 text-purple-400' : 'bg-white/[0.03] border-white/5 text-white/40 hover:bg-white/5 hover:text-white'}`}
                                            >
                                                🛒 Venda / Comércio
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Bottom Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[3px] mb-3">DATA</p>
                                        <div className="relative group">
                                            <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" size={18} />
                                            <input
                                                type="date"
                                                required
                                                className="w-full bg-white/[0.03] border border-white/5 rounded-3xl px-14 py-5 outline-none focus:border-primary/40 text-sm font-bold transition-all text-white/80"
                                                value={formData.data}
                                                onChange={e => setFormData({ ...formData, data: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[3px] mb-3">DESCRIÇÃO</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Ex: Venda produto X, Posto Rodocel..."
                                                className="flex-1 bg-white/[0.03] border border-white/5 rounded-3xl px-6 py-5 outline-none focus:border-primary/40 text-sm font-bold transition-all text-white placeholder:text-white/10"
                                                value={formData.descricao}
                                                onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleCategorizarIA}
                                                disabled={isAiLoading}
                                                title="Categorizar com IA"
                                                className="p-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-2xl text-primary transition-all flex-shrink-0 flex items-center justify-center"
                                            >
                                                {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                            </button>
                                        </div>
                                        <p className="text-[9px] text-primary/60 font-bold mt-1.5 ml-2">✨ Clique no ícone para categorizar automaticamente</p>
                                    </div>
                                </div>

                                {/* Upload de Comprovante */}
                                {isPro && (
                                    <div>
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[3px] mb-3 flex items-center gap-2">
                                            <Upload size={12} /> COMPROVANTE (OPCIONAL)
                                        </p>
                                        <div>
                                            <label className={`flex items-center justify-center gap-3 p-5 rounded-3xl border-2 border-dashed cursor-pointer transition-all ${comprovante ? 'border-primary/40 bg-primary/5' : 'border-white/10 bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04]'}`}>
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp,application/pdf"
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                />
                                                {uploadPreview ? (
                                                    <div className="relative group">
                                                        <img src={uploadPreview} alt="Preview" className="h-24 w-auto rounded-2xl object-cover border border-white/10" />
                                                        <div className="absolute inset-0 bg-green-500/20 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Check size={24} className="text-white" />
                                                        </div>
                                                        <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-green-400 font-black uppercase tracking-widest whitespace-nowrap">Upload Pronto</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload size={20} className="text-white/30" />
                                                        <span className="text-white/40 text-sm font-bold">
                                                            {comprovante ? comprovante.name : 'Arraste ou clique para enviar (JPG, PNG ou PDF)'}
                                                        </span>
                                                    </>
                                                )}
                                            </label>
                                            {comprovante && (
                                                <div className="flex items-center gap-4 mt-4 ml-2">
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                                                        <Check size={12} className="text-green-400" />
                                                        <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Arquivo Selecionado</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => { setComprovante(null); setUploadPreview(null); }}
                                                        className="text-[10px] text-red-400/60 hover:text-red-400 font-bold transition-colors"
                                                    >
                                                        Remover
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Toggle de Recorrência */}
                                <div>
                                    <div className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/5 rounded-3xl">
                                        <div className="flex items-center gap-3">
                                            <RefreshCw size={18} className={formData.is_recorrente ? 'text-primary' : 'text-white/30'} />
                                            <div>
                                                <p className="text-sm font-black text-white">Lançamento Recorrente</p>
                                                <p className="text-xs text-white/40 font-bold">Gera automaticamente todo mês</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, is_recorrente: !formData.is_recorrente })}
                                            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${formData.is_recorrente ? 'bg-primary' : 'bg-white/10'}`}
                                        >
                                            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${formData.is_recorrente ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    {formData.is_recorrente && (
                                        <div className="mt-3 px-5">
                                            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-2">DIA DO MÊS PARA RENOVAR</p>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="31"
                                                    value={formData.recurrence_day}
                                                    onChange={e => setFormData({ ...formData, recurrence_day: e.target.value })}
                                                    className="w-24 bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-white font-black text-center outline-none focus:border-primary/40"
                                                />
                                                <span className="text-white/40 text-sm font-bold">de cada mês</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary hover:bg-primary/90 text-white font-black py-6 rounded-3xl shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg uppercase tracking-[2px] disabled:opacity-60"
                                >
                                    {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <><Check size={24} /> SALVAR LANÇAMENTO</>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* LIMIT REACHED MODAL */}
            {isLimitModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 font-manrope">
                    <div className="w-full max-w-md bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-[40px] p-10 text-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary mx-auto mb-8 border border-primary/20 group-hover:scale-110 transition-transform">
                            {checkoutLoading ? <Loader2 className="animate-spin" size={40} /> : <Zap size={40} fill="currentColor" />}
                        </div>
                        <h2 className="text-3xl font-black mb-4">Limite Atingido!</h2>
                        <p className="text-white/60 font-medium mb-10 leading-relaxed text-sm">
                            {limitReason} 🚀 <span className="text-white">Desbloqueie o Gestão MEI por 1 ano</span> e profissionalize seu negócio com lançamentos ilimitados, upload de comprovantes, relatórios DASN e suporte prioritário por apenas <span className="text-white font-bold text-lg block mt-2">R$ 197,00</span>
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={handleUpgrade}
                                disabled={checkoutLoading}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 text-lg uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                {checkoutLoading ? <Loader2 className="animate-spin" size={20} /> : 'Assinar Anual (R$ 197)'}
                            </button>
                            <button
                                onClick={() => setIsLimitModalOpen(false)}
                                disabled={checkoutLoading}
                                className="w-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white py-5 rounded-2xl font-bold transition-all text-sm"
                            >
                                Agora não
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transactions;
