import React, { useState, useEffect } from 'react';
import {
    User,
    Bell,
    Lock,
    Shield,
    CreditCard,
    Camera,
    Save,
    ChevronRight,
    LogOut,
    Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('users_profile')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows'
                console.error(error);
            } else if (data) {
                setName(data.nome_completo || "");
                setCompanyName(data.nome_empresa || "");
            }
            setIsLoading(false);
        };

        fetchProfile();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const triggerUpload = () => {
        document.getElementById('profile-upload')?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('users_profile')
            .upsert({
                id: user.id,
                nome_completo: name,
                nome_empresa: companyName,
            });

        if (error) {
            alert('Erro ao salvar: ' + error.message);
        } else {
            alert('Configurações salvas com sucesso!');
        }
        setIsSaving(false);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
            <div>
                <h1 className="text-4xl font-black tracking-tight">Configurações</h1>
                <p className="text-white/40 mt-1 font-medium">Gerencie sua conta e preferências do sistema.</p>
            </div>

            {isLoading ? (
                <div className="h-[40vh] flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Profile Sidebar */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[40px] text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                            <div className="relative inline-block mb-6">
                                <input
                                    type="file"
                                    id="profile-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <div
                                    onClick={triggerUpload}
                                    className="w-24 h-24 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center text-white/20 cursor-pointer hover:bg-white/10 transition-all overflow-hidden"
                                >
                                    {profileImage ? (
                                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} />
                                    )}
                                </div>
                                <button
                                    onClick={triggerUpload}
                                    className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl shadow-lg border-2 border-background hover:scale-110 transition-all"
                                >
                                    <Camera size={16} />
                                </button>
                            </div>
                            <h3 className="text-xl font-black">{name}</h3>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Plano Profissional</p>
                        </div>

                        <div className="bg-white/[0.03] border border-white/5 rounded-[32px] p-2">
                            {[
                                { icon: User, label: 'Perfil' },
                                { icon: Bell, label: 'Notificações' },
                                { icon: Shield, label: 'Privacidade' },
                                { icon: Lock, label: 'Segurança' },
                                { icon: CreditCard, label: 'Assinatura' },
                            ].map((item, i) => (
                                <button key={i} className={`flex items-center justify-between w-full p-4 rounded-2xl transition-all ${i === 0 ? 'bg-primary/10 text-primary' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                                    <div className="flex items-center gap-3">
                                        <item.icon size={18} />
                                        <span className="text-sm font-bold">{item.label}</span>
                                    </div>
                                    <ChevronRight size={14} className="opacity-40" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="md:col-span-2 space-y-6">
                        {/* General Info */}
                        <div className="bg-white/[0.03] border border-white/5 p-10 rounded-[40px] space-y-8">
                            <h2 className="text-xl font-black">Informações de Perfil</h2>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-white/20 uppercase tracking-widest mb-3">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary/50 text-white font-medium"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-white/20 uppercase tracking-widest mb-3">Nome da Empresa (MEI)</label>
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary/50 text-white font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="bg-white/[0.03] border border-white/5 p-10 rounded-[40px] space-y-8">
                            <h2 className="text-xl font-black">Notificações</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                    <div>
                                        <p className="text-sm font-bold">Notificações no Navegador</p>
                                        <p className="text-[10px] text-white/40 font-medium">Alertas sobre vencimento da DASN</p>
                                    </div>
                                    <button
                                        onClick={() => setNotifications(!notifications)}
                                        className={`w-12 h-6 rounded-full transition-all relative ${notifications ? 'bg-primary' : 'bg-white/10'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                    <div>
                                        <p className="text-sm font-bold">Alertas por E-mail</p>
                                        <p className="text-[10px] text-white/40 font-medium">Relatórios mensais de faturamento</p>
                                    </div>
                                    <button
                                        onClick={() => setEmailAlerts(!emailAlerts)}
                                        className={`w-12 h-6 rounded-full transition-all relative ${emailAlerts ? 'bg-primary' : 'bg-white/10'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${emailAlerts ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-red-400 hover:border-red-400/50 transition-all font-black text-xs uppercase tracking-widest"
                            >
                                <LogOut size={16} />
                                Encerrar Sessão
                            </button>

                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-10 py-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all font-black text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <Save size={16} />
                                )}
                                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
