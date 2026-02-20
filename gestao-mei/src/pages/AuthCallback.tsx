import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import { startStripeCheckout } from '../lib/stripe';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const intent = localStorage.getItem('intentToPurchase') || localStorage.getItem('pendingPriceId');

                if (intent) {
                    localStorage.removeItem('intentToPurchase');
                    localStorage.removeItem('pendingPriceId');
                    const success = await startStripeCheckout(intent, session.user.id, session.user.email || '');
                    if (success) return;
                }

                const currentParams = new URLSearchParams(window.location.search);
                const search = currentParams.toString();
                navigate(`/dashboard${search ? `?${search}` : ''}`, { replace: true });
            }
        };

        handleAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session && event === 'SIGNED_IN') {
                handleAuth();
            } else if (event === 'SIGNED_OUT') {
                navigate('/auth', { replace: true });
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-manrope">
            <div className="text-center p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
                <Loader2 className="animate-spin text-primary mx-auto mb-6" size={48} />
                <h2 className="text-2xl font-black text-white mb-2">Quase lá!</h2>
                <p className="text-white/60 font-bold">Verificando sua conta e preparando seu dashboard...</p>
                <div className="mt-8 w-48 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
                    <div className="h-full bg-primary animate-progress shadow-[0_0_10px_rgba(246,85,85,0.5)]" />
                </div>
            </div>
        </div>
    );
};

export default AuthCallback;
