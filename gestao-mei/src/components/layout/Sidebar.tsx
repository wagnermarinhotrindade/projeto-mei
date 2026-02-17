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
    User
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: ShoppingCart, label: 'Lançamentos', path: '/transactions' },
        { icon: FileBarChart, label: 'Relatórios', path: '/reports' },
        { icon: Settings, label: 'Configurações', path: '/settings' },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-background border-r border-white/5 flex flex-col p-6 z-50">
            <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group transition-all duration-300 hover:bg-primary hover:text-white border border-primary/20 cursor-pointer">
                    <Gem size={22} className="group-hover:rotate-12 transition-transform" />
                </div>
                <div>
                    <h1 className="font-extrabold text-lg leading-tight">Gestão MEI</h1>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-80">Profissional</p>
                </div>
            </div>

            <nav className="flex-1 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <item.icon size={20} className="transition-transform group-hover:scale-110" />
                        <span className="font-bold text-sm tracking-tight">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto space-y-4">
                {/* User Profile Card */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white/40 overflow-hidden border border-white/5">
                        <User size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-black text-white/90 leading-none">Ricardo Silva</p>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">MEI Ativo</p>
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
