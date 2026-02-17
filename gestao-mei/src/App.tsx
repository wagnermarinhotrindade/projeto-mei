import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AppLayout from './components/layout/AppLayout';

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
                <Route
                    path="/login"
                    element={!session ? <Login /> : <Navigate to="/dashboard" replace />}
                />

                <Route element={session ? <AppLayout /> : <Navigate to="/login" replace />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/clients" element={<Placeholder title="Clientes" />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>

                <Route path="/" element={<Navigate to={session ? "/dashboard" : "/login"} replace />} />
            </Routes>
        </Router>
    );
}

export default App;
