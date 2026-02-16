import React, { useState } from 'react';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigate('/dashboard');
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Confirme seu e-mail para ativar a conta!');
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao processar autenticação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 font-manrope text-white">
            <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-xl backdrop-blur-sm">
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 text-white font-bold text-2xl">
                        MEI
                    </div>
                </div>

                <h2 className="text-3xl font-extrabold text-center mb-2">
                    {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
                </h2>
                <p className="text-white/60 text-center mb-8">
                    {isLogin ? 'Gerencie suas finanças com facilidade' : 'Comece a organizar seu negócio hoje'}
                </p>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-semibold text-center">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleAuth}>
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-white/80">E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-white"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-white/80">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-white"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : isLogin ? (
                            <>
                                <LogIn size={20} />
                                Entrar
                            </>
                        ) : (
                            <>
                                <UserPlus size={20} />
                                Cadastrar
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-primary hover:text-primary/80 text-sm font-semibold transition-colors disabled:opacity-50"
                        disabled={loading}
                    >
                        {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
