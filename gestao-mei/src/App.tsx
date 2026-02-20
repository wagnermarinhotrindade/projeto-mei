import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) return null;

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
        </Router>
    );
}

export default App;
