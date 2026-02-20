import { supabase } from './supabase';

export const startStripeCheckout = async (priceId: string, userId: string, userEmail: string) => {
    // 1. QUEBRA DE LOOP: Limpa intenção IMEDIATAMENTE antes de iniciar
    localStorage.removeItem('intentToPurchase');
    localStorage.removeItem('pendingPriceId');

    try {
        console.log('Iniciando Checkout para:', { priceId, userId, userEmail });

        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
            body: {
                priceId: priceId,
                userId: userId,
                userEmail: userEmail
            }
        });

        if (error) {
            console.error('Erro retornado pela Edge Function:', error);
            throw new Error(error.message || 'Erro desconhecido na função Supabase');
        }

        if (data?.url) {
            console.log('URL de Checkout gerada:', data.url);
            window.location.href = data.url;
            return true;
        } else {
            console.error('Resposta da API sem URL:', data);
            throw new Error('A API não retornou uma URL de checkout válida.');
        }
    } catch (err: any) {
        console.error('Falha Crítica no Checkout:', err);
        // 2. TRATAMENTO DE ERRO EXPLÍCITO: Exibe mensagem real do erro
        const msg = err.message || 'Erro na comunicação com a Stripe';
        alert(`Erro ao iniciar pagamento: ${msg}\n\nPor favor, tente novamente ou contate o suporte.`);
        return false;
    }
};
