import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, FileBarChart, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: ReceiptText, label: 'Lançamentos', path: '/transactions' },
        { icon: FileBarChart, label: 'Relatórios', path: '/reports' },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white/5 border-r border-white/10 flex flex-col p-4 backdrop-blur-md z-50">
            <div className="flex items-center gap-3 px-4 py-8 mb-8 border-b border-white/5">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
                    M
                </div>
                <span className="font-extrabold text-xl tracking-tight">Gestão MEI</span>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'hover:bg-white/5 text-white/60 hover:text-white'
                            }`
                        }
                    >
                        <item.icon size={20} className="transition-transform group-hover:scale-110" />
                        <span className="font-semibold">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all mt-auto group w-full text-left"
            >
                <LogOut size={20} className="transition-transform group-hover:translate-x-1" />
                <span className="font-semibold">Sair</span>
            </button>
        </aside>
    );
};

export default Sidebar;
