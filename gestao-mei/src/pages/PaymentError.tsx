import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, MessageSquare } from 'lucide-react';

const PaymentError: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Limpa a intenção de compra para não ficar preso no loop
    localStorage.removeItem('pending_purchase_price_id');
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-manrope">
      <div className="w-full max-w-lg bg-white/[0.02] border border-white/5 rounded-[40px] p-10 text-center backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-8 border border-red-500/20">
          <XCircle size={40} />
        </div>

        <h2 className="text-3xl font-black text-white mb-4">Pagamento Não Concluído</h2>
        <p className="text-white/60 font-medium mb-10 leading-relaxed">
          Parece que houve um problema ou o pagamento foi cancelado. Não se preocupe, nenhuma cobrança foi realizada e você continua com acesso ao plano atual.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-5 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} /> VOLTAR PARA O DASHBOARD
          </button>
          
          <a
            href="https://wa.me/5511999999999" // TODO: Atualizar com link de suporte real
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare size={18} /> FALAR COM SUPORTE
          </a>
        </div>

        <p className="mt-8 text-[10px] text-white/20 font-black uppercase tracking-[3px]">
          SISTEMA DE PAGAMENTO SEGURO VIA STRIPE
        </p>
      </div>
    </div>
  );
};

export default PaymentError;
