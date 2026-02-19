import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Preserva os query params (como priceId) ao navegar
                navigate(`/dashboard${window.location.search}`, { replace: true });
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth Event:", event);
            if (session) {
                navigate(`/dashboard${window.location.search}`, { replace: true });
            } else if (event === 'SIGNED_OUT') {
                navigate('/auth', { replace: true });
            }
        });

        // Timeout de segurança reduzido para 3s e com redirecionamento baseado no estado atual
        const timer = setTimeout(async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                navigate(`/dashboard${window.location.search}`, { replace: true });
            } else {
                navigate('/auth', { replace: true });
            }
        }, 3000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
        };
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
