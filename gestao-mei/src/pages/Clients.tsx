import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Plus, 
    Search, 
    Mail, 
    Phone, 
    MapPin, 
    MoreVertical, 
    Trash2, 
    Edit2, 
    Loader2, 
    UserPlus,
    Tag,
    FileText,
    ChevronRight,
    SearchX
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Cliente {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    cnpj_cpf: string;
    endereco: string;
    tags: string[];
    notas: string;
    created_at: string;
}

const Clients: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState<Cliente[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        cnpj_cpf: '',
        endereco: '',
        notas: '',
        tags: [] as string[]
    });

    const fetchClients = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao buscar clientes:', error);
        } else {
            setClients(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            if (selectedClient) {
                const { error } = await supabase
                    .from('clientes')
                    .update(formData)
                    .eq('id', selectedClient.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('clientes')
                    .insert([{ ...formData, user_id: user.id }]);
                if (error) throw error;
            }

            fetchClients();
            handleCloseModal();
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            alert('Erro ao salvar cliente. Verifique os dados.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover este cliente?')) return;

        const { error } = await supabase
            .from('clientes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao deletar cliente:', error);
            alert('Não foi possível remover o cliente.');
        } else {
            setClients(clients.filter(c => c.id !== id));
        }
    };

    const handleEdit = (client: Cliente) => {
        setSelectedClient(client);
        setFormData({
            nome: client.nome,
            email: client.email || '',
            telefone: client.telefone || '',
            cnpj_cpf: client.cnpj_cpf || '',
            endereco: client.endereco || '',
            notas: client.notas || '',
            tags: client.tags || []
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedClient(null);
        setFormData({
            nome: '',
            email: '',
            telefone: '',
            cnpj_cpf: '',
            endereco: '',
            notas: '',
            tags: []
        });
    };

    const filteredClients = clients.filter(c => 
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.cnpj_cpf?.includes(searchTerm)
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Base de Clientes</h1>
                    <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">Gerencie sua carteira de forma profissional</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary hover:bg-primary/90 text-white font-black px-6 py-4 rounded-2xl flex items-center gap-3 transition-all hover:-translate-y-1 shadow-xl shadow-primary/20 active:scale-95"
                >
                    <UserPlus size={20} />
                    <span>Novo Cliente</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-xl">
                {/* Search Bar */}
                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row gap-6">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nome, email ou CPF/CNPJ..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="py-24 flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-primary" size={48} />
                        <p className="text-white/40 font-black uppercase tracking-widest text-xs">Sincronizando contatos...</p>
                    </div>
                ) : filteredClients.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.02]">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest">Cliente</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest">Contato</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest">Documento</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredClients.map((client) => (
                                    <tr key={client.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20">
                                                    {client.nome.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-black text-white">{client.nome}</p>
                                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-0.5">Ativo</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-white/40">
                                                    <Mail size={12} className="shrink-0" />
                                                    <span className="text-xs font-bold truncate max-w-[200px]">{client.email || '—'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-white/40">
                                                    <Phone size={12} className="shrink-0" />
                                                    <span className="text-xs font-bold truncate">{client.telefone || '—'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-black text-white/60 uppercase tracking-widest">
                                                {client.cnpj_cpf || 'SEM DOC'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(client)}
                                                    className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(client.id)}
                                                    className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-24 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-white/20 mx-auto mb-6">
                            <SearchX size={32} />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">Nenhum cliente encontrado</h3>
                        <p className="text-white/40 font-medium text-sm max-w-xs mx-auto">
                            Experimente mudar os termos da busca ou adicione um novo cliente.
                        </p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#121212] border border-white/10 rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-10">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-2xl font-black text-white">{selectedClient ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</h2>
                                    <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">Página de Gestão de Contatos</p>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-3 bg-white/5 rounded-2xl text-white/20 hover:text-white transition-all"
                                >
                                    <Plus className="rotate-45" size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Nome Completo / Razão Social *</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                                            value={formData.nome}
                                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">E-mail</label>
                                        <input
                                            type="email"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Telefone</label>
                                        <input
                                            type="text"
                                            placeholder="(00) 00000-0000"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                                            value={formData.telefone}
                                            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">CPF / CNPJ</label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                                            value={formData.cnpj_cpf}
                                            onChange={(e) => setFormData({ ...formData, cnpj_cpf: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Endereço</label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                                            value={formData.endereco}
                                            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Notas Internas</label>
                                        <textarea
                                            rows={3}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-white/20 resize-none"
                                            value={formData.notas}
                                            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full bg-primary hover:bg-primary/90 text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <Loader2 className="animate-spin" size={24} />
                                    ) : (
                                        <>
                                            <Plus size={24} />
                                            <span>{selectedClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clients;
