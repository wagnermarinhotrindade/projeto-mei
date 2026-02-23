import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { supabase } from './lib/supabase';
import { Loader2 } from 'lucide-react';
import { startStripeCheckout } from './lib/stripe';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import AuthCallback from './pages/AuthCallback';

const Placeholder = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-white/20">
        <h1 className="text-4xl font-black uppercase tracking-[10px]">{title}</h1>
        <p className="mt-4 font-bold tracking-widest">EM DESENVOLVIMENTO</p>
    </div>
);

function App() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        const checkIntent = async (user: any) => {
            // REGRA ESTRITA: Captura a intenção no Provider ANTES de liberar rotas
            const pendingPrice = localStorage.getItem('checkout_price_id');
            if (pendingPrice && pendingPrice.startsWith('price_') && user) {
                console.log('Porteiro: Intenção detectada, redirecionando para Stripe...');
                localStorage.removeItem('checkout_price_id');
                setIsRedirecting(true);

                try {
                    await startStripeCheckout(pendingPrice, user.id, user.email || '');
                    return true;
                } catch (err) {
                    console.error('Erro no Porteiro (Stripe):', err);
                    setIsRedirecting(false);
                    return false;
                }
                return true; // Houve intercepção
            }
            return false;
        };

        const initializeAuth = async () => {
            const { data: { session: initialSession } } = await supabase.auth.getSession();
            setSession(initialSession);

            if (initialSession?.user) {
                const intercepted = await checkIntent(initialSession.user);
                if (intercepted) return; // Mantém loading/isRedirecting para evitar loop
            }

            setLoading(false);
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            setSession(currentSession);

            if (currentSession?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
                const intercepted = await checkIntent(currentSession.user);
                if (intercepted) return;
            }

            if (event === 'SIGNED_OUT') {
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading || isRedirecting) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center font-manrope">
                <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl text-center">
                    <Loader2 className="animate-spin text-primary mx-auto mb-6" size={48} />
                    <h2 className="text-2xl font-black text-white mb-2">Processando acesso...</h2>
                    <p className="text-white/60 font-bold">Autenticando e preparando seu ambiente...</p>
                    <div className="mt-8 w-48 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
                        <div className="h-full bg-primary animate-progress shadow-[0_0_10px_rgba(246,85,85,0.5)]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route
                    path="/auth"
                    element={!session ? <Login /> : <Navigate to="/dashboard" replace />}
                />
                <Route path="/auth/callback" element={<AuthCallback />} />

                <Route element={session ? <AppLayout /> : <Navigate to="/auth" replace />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/clients" element={<Placeholder title="Clientes" />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>
            </Routes>
            <Analytics />
        </Router>
    );
}

export default App;
