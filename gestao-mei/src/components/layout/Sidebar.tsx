import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    FileBarChart,
    Users,
    Settings,
    LogOut,
    Gem,
    User,
    X,
    MessageSquare,
    FileText
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    profile?: any;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, profile }) => {
    const navigate = useNavigate();

    // Mapping plan names for display
    const getPlanoLabel = (p: string) => {
        const planos: Record<string, string> = {
            'gratis': 'Plano Gratuito',
            'pro': 'MEI Pro',
            'elite': 'MEI Elite',
            'elite_pro': 'Elite Pro'
        };
        return planos[p] || 'MEI Ativo';
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: ShoppingCart, label: 'Lançamentos', path: '/transactions' },
        { icon: FileText, label: 'Emissor NF-e/NFS-e', path: '/emitter', badge: 'Novo' },
        { icon: FileBarChart, label: 'Relatórios', path: '/reports' },
        { icon: Users, label: 'Clientes', path: '/clients' },
        { icon: Settings, label: 'Configurações', path: '/settings' },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    return (
        <aside className={`fixed left-0 top-0 h-screen w-64 bg-zinc-950 border-r border-white/5 flex flex-col p-6 z-50 transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}>
            <div className="flex items-center justify-between gap-3 mb-10">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Gestão MEI" className="h-10 object-contain" />
                </div>

                {/* Close Button Mobile */}
                <button
                    onClick={onClose}
                    className="md:hidden p-2 bg-white/5 border border-white/5 rounded-xl text-white/40 hover:text-white transition-all"
                >
                    <X size={18} />
                </button>
            </div>

            <nav className="flex-1 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <item.icon size={20} className="transition-transform group-hover:scale-110" />
                        <span className="font-bold text-sm tracking-tight flex-1">{item.label}</span>
                        {item.badge && (
                            <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[8px] font-black uppercase rounded-md border border-primary/20 animate-pulse">
                                {item.badge}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto space-y-4">
                {/* User Profile Card */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white/40 overflow-hidden border border-white/5">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={24} />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-white/90 leading-none truncate">{profile?.nome_completo || 'Perfil'}</p>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1 truncate">{getPlanoLabel(profile?.plano)}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/20 hover:text-primary transition-all group w-full text-left"
                >
                    <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
                    <span className="font-bold text-sm">Sair</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
