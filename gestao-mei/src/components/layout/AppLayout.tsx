import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Zap } from 'lucide-react';
import Sidebar from './Sidebar';
import { supabase } from '../../lib/supabase';
import { startStripeCheckout } from '../../lib/stripe';

const AppLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isPro, setIsPro] = useState(true); // Default to true to avoid flash
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkPlan = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUser(user);

            const { data: profile } = await supabase
                .from('users_profile')
                .select('plano')
                .eq('id', user.id)
                .single();

            setIsPro(profile?.plano === 'pro');
        };
        checkPlan();
    }, []);

    const handleUpgrade = () => {
        if (user) {
            startStripeCheckout('price_1T2d6SLjW93jPn5yKFFhiedU', user.id, user.email || '');
        }
    };

    return (
        <div className="min-h-screen bg-background text-white relative flex overflow-x-hidden">
            {/* Overlay for mobile when sidebar is open */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 w-full min-h-screen transition-all duration-300 md:ml-64 p-4 md:p-8">
                {/* Mobile Header Menu Trigger */}
                <div className="flex md:hidden items-center justify-between mb-6 p-2 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary border border-primary/20">
                            <Menu size={18} onClick={() => setIsSidebarOpen(true)} className="cursor-pointer" />
                        </div>
                        <span className="font-black text-xs uppercase tracking-widest text-white/40">Gestão MEI</span>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>

                {/* Floating Upgrade Button */}
                {!isPro && (
                    <button
                        onClick={handleUpgrade}
                        className="fixed bottom-8 right-8 z-[100] bg-primary hover:bg-primary/90 text-white font-black px-6 py-4 rounded-2xl shadow-2xl shadow-primary/40 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 animate-bounce-subtle"
                    >
                        <Zap size={20} fill="currentColor" className="text-white" />
                        <span>⚡ Fazer Upgrade</span>
                    </button>
                )}
            </main>
        </div>
    );
};

export default AppLayout;
