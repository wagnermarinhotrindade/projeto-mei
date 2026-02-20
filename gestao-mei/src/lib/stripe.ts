import { supabase } from './supabase';

export const startStripeCheckout = async (priceId: string, userId: string, userEmail: string) => {
    // 1. QUEBRA DE LOOP: Limpa intenção IMEDIATAMENTE antes de iniciar
    localStorage.removeItem('intentToPurchase');
    localStorage.removeItem('pendingPriceId');

    try {
        console.log('--- DEBUG STRIPE INICIO ---');
        console.log('Payload:', { priceId, userId, userEmail });

        const sessionResult = await supabase.auth.getSession();
        const session = sessionResult.data.session;

        if (!session) {
            throw new Error('Usuário não autenticado. Faça login novamente.');
        }

        const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
        const functionUrl = `${supabaseUrl}/functions/v1/create-checkout-session`;

        console.log('Chamando API diretamente via fetch:', functionUrl);

        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
            },
            body: JSON.stringify({ priceId, userId, userEmail })
        });

        console.log('Resposta HTTP Status:', response.status);

        const data = await response.json();
        console.log('Dados recebidos da API:', data);

        if (!response.ok) {
            throw new Error(data.error || `Erro de rede (${response.status})`);
        }

        if (data?.url) {
            console.log('Redirecionando para Stripe:', data.url);
            window.location.href = data.url;
            return true;
        } else {
            throw new Error('A API retornou sucesso mas não forneceu uma URL de checkout.');
        }

    } catch (err: any) {
        console.error('--- DEBUG STRIPE FALHA ---');
        console.error(err);
        const msg = err.message || 'Erro na comunicação com a Stripe';
        alert(`Erro Crítico no Pagamento:\n${msg}\n\nO loop foi interrompido. Você pode tentar novamente em Configurações.`);
        return false;
    }
};
