import { supabase } from './supabase';

export const startStripeCheckout = async (priceId: string, userId: string, userEmail: string) => {
    try {
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
            body: {
                priceId: priceId,
                userId: userId,
                userEmail: userEmail
            }
        });

        if (error) throw error;

        if (data?.url) {
            window.location.href = data.url;
            return true;
        }
        return false;
    } catch (err) {
        console.error('Erro ao iniciar checkout:', err);
        alert('Erro ao iniciar processo de pagamento. Tente novamente em Configurações.');
        return false;
    }
};
