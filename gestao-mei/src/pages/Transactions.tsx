import React, { useEffect, useState } from 'react';
import {
    Search,
    Plus,
    Filter,
    Trash2,
    Loader2,
    X,
    Download,
    MoreHorizontal,
    ShoppingBag,
    Bell,
    Check,
    ShoppingBasket,
    Wrench,
    Home,
    Globe,
    Zap,
    Truck,
    Utensils,
    PlusCircle,
    Calendar as CalendarIcon,
    TrendingUp,
    TrendingDown,
    Sparkles,
    Upload,
    RefreshCw,
    Paperclip,
    Lock,
    Fuel,
    Stethoscope,
    Receipt,
    Tag,
    HelpCircle,
    Camera,
    Info,
    QrCode,
} from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { supabase } from '../lib/supabase';
import { startStripeCheckout } from '../lib/stripe';

const SUPABASE_FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL?.replace('.supabase.co', '.supabase.co/functions/v1') || '';

interface FormData {
    tipo: string;
    valor: string;
    categoria: string;
    descricao: string;
    data: string;
    tipo_receita: 'servico' | 'comercio' | '';
    is_recorrente: boolean;
    recurrence_day: string;
}

const Transactions: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState<FormData>({
        tipo: 'Receita (Entrou Dinheiro)',
        valor: '',
        categoria: 'Venda de Produto',
        descricao: '',
        data: new Date().toISOString().split('T')[0],
        tipo_receita: 'comercio',
        is_recorrente: false,
        recurrence_day: String(new Date().getDate()),
    });
    const [comprovante, setComprovante] = useState<File | null>(null);
    const [uploadPreview, setUploadPreview] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
    const [limitReason, setLimitReason] = useState('');
    const [user, setUser] = useState<any>(null);
    const [isPro, setIsPro] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const [ocrFeedback, setOcrFeedback] = useState<string | null>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isNfceLoading, setIsNfceLoading] = useState(false);
    const [scanningState, setScanningState] = useState<'scanning' | 'detected' | 'error'>('scanning');

    const handleUpgrade = async (priceId: string = 'price_1T2cFGLjW93jPn5yJDSCAKev') => {
        if (!user) return;
        setCheckoutLoading(true);
        try {
            // Salva intenção para o Porteiro do Stripe no App.tsx
            localStorage.setItem('pending_purchase_price_id', priceId);
            const success = await startStripeCheckout(priceId, user.id, user.email || '');
            if (!success) setCheckoutLoading(false);
        } catch (error) {
            setCheckoutLoading(false);
        }
    };

    const categories = [
        { id: 'Venda de Produto', label: 'Vendas', icon: ShoppingBasket },
        { id: 'Prestação de Serviço', label: 'Serviços', icon: Wrench },
        { id: 'Aluguel', label: 'Aluguel', icon: Home },
        { id: 'Internet', label: 'Internet', icon: Globe },
        { id: 'Compra de Mercadoria', label: 'Compra', icon: ShoppingBag },
        { id: 'Frete', label: 'Frete', icon: Truck },
        { id: 'Alimentação', label: 'Alimentação', icon: Utensils },
        { id: 'Combustível', label: 'Combustível', icon: Fuel },
        { id: 'Saúde', label: 'Saúde', icon: Stethoscope },
        { id: 'Impostos (DAS)', label: 'DAS/Impostos', icon: Receipt },
        { id: 'Outros', label: 'Outros', icon: PlusCircle },
    ];

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUser(user);

        const { data: profile } = await supabase
            .from('users_profile')
            .select('plano, plan_status')
            .eq('id', user.id)
            .single();

        if (profile) {
            // SEGURANÇA: Verificação robusta de Pro baseada em plano e status
            const isActive = profile.plan_status === 'active' || profile.plan_status === 'pro';
            const isProPlan = ['pro', 'elite', 'elite_pro'].includes(profile.plano || '');
            setIsPro(isActive && isProPlan);
        }

        const { data, error } = await supabase
            .from('transacoes')
            .select('*')
            .eq('user_id', user.id)
            .order('data', { ascending: false });

        if (error) console.error(error);
        else setData(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- QR Code Scanner Lifecycle ---
    const playSuccessSound = () => {
        try {
            // Vibração (Android/Chrome)
            if (navigator.vibrate) {
                navigator.vibrate(200);
            }

            // Som de Bipe usando Web Audio API (evita carregar arquivos externos)
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                const context = new AudioContextClass();
                const oscillator = context.createOscillator();
                const gain = context.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(1200, context.currentTime); // Pitch alto para bipe
                
                gain.gain.setValueAtTime(0, context.currentTime);
                gain.gain.linearRampToValueAtTime(0.1, context.currentTime + 0.01);
                gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.15);
                
                oscillator.connect(gain);
                gain.connect(context.destination);
                
                oscillator.start();
                oscillator.stop(context.currentTime + 0.2);
            }
        } catch (e) {
            console.warn("Feedback tátil/sonoro falhou", e);
        }
    };

    useEffect(() => {
        let html5QrCode: Html5Qrcode | null = null;
        
        const startScanner = async () => {
            if (isScannerOpen) {
                await new Promise(resolve => setTimeout(resolve, 100));
                const element = document.getElementById("reader");
                if (!element) return;

                html5QrCode = new Html5Qrcode("reader");
                
                const config = { 
                    fps: 30, 
                    qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
                        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                        const size = Math.floor(minEdge * 0.75);
                        return { width: size, height: size };
                    },
                    formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ],
                    disableFlip: false,
                    videoConstraints: {
                        facingMode: "environment",
                        focusMode: 'continuous',
                        width: { exact: 1280 },
                        height: { exact: 720 }
                    },
                    aspectRatio: 1.0
                };
                
                try {
                    await html5QrCode.start(
                        { facingMode: "environment" },
                        config,
                        (decodedText: string) => {
                            const isSefazUrl = decodedText.toLowerCase().includes('sefaz') && decodedText.toLowerCase().includes('.gov.br');
                            if (isSefazUrl || decodedText.startsWith('http')) { 
                                // Detecção imediata - Trava o visual
                                setScanningState('detected');
                                playSuccessSound();
                                
                                // Aguarda o feedback visual (verde) antes de processar
                                setTimeout(() => {
                                    handleNfceScan(decodedText);
                                    html5QrCode?.stop().then(() => {
                                        setIsScannerOpen(false);
                                        setScanningState('scanning');
                                    });
                                }, 600);
                            }
                        },
                        (errorMessage: string) => {
                            // Silenciar logs de não encontrado para performance
                        } 
                    );

                } catch (err) {
                    console.error("Scanner fallback:", err);
                    try {
                        await html5QrCode?.start(
                            { facingMode: "user" },
                            { fps: 30, qrbox: { width: 250, height: 250 } },
                            (decodedText: string) => {
                                if (decodedText.startsWith('http')) {
                                    playSuccessSound();
                                    handleNfceScan(decodedText);
                                    html5QrCode?.stop().then(() => setIsScannerOpen(false));
                                }
                            },
                            () => {}
                        );
                    } catch (e) {
                        setIsScannerOpen(false);
                    }
                }
            }
        };

        startScanner();

        return () => {
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().catch(() => {});
            }
        };
    }, [isScannerOpen]);

    const handleNfceScan = async (url: string) => {
        if (!url.startsWith('http')) {
            alert('QR Code inválido. Aponte para uma nota fiscal (NFC-e).');
            return;
        }

        setIsNfceLoading(true);
        setOcrFeedback(null);
        
        // --- EXTRAÇÃO DIRETA (Instantânea) ---
        try {
            const urlObj = new URL(url);
            const params = new URLSearchParams(urlObj.search);
            
            let valorDireto = params.get('vNF');
            let dataDireta = params.get('dhEmi');
            const pParam = params.get('p') || params.get('param');

            // Lógica para SEFAZ-AP e outros que usam campo pipe-separated 'p'
            // Se não temos valorDireto mas temos pParam, tentamos extrair a chave
            if (!valorDireto && pParam) {
                const parts = pParam.split('|');
                const chave = parts[0];
                if (chave && (chave.length === 44 || chave.length === 40)) {
                    // Extraímos ano/mês da chave de acesso (posições fixas 2-4 e 4-6)
                    const ano = "20" + chave.substring(2, 4);
                    const mes = chave.substring(4, 6);
                    dataDireta = `${ano}-${mes}-01`;
                    console.log("Data aproximada extraída da Chave:", dataDireta);
                }
            }

            // Se a data estiver em Hexadecimal ou formatada (ISO)
            if (dataDireta && dataDireta.length > 8) {
                if (dataDireta.includes('T')) {
                    dataDireta = dataDireta.split('T')[0];
                }
            }

            if (valorDireto || dataDireta) {
                setFormData(prev => ({
                    ...prev,
                    valor: valorDireto ? valorDireto.replace('.', ',') : prev.valor,
                    data: dataDireta || prev.data,
                    tipo: 'Despesa (Saiu Dinheiro)',
                    categoria: 'Compra de Mercadoria'
                }));
                // Feedback imediato de leitura direta
                setOcrFeedback('Valores extraídos instantaneamente!');
            }
        } catch (e) {
            console.log("Erro na extração direta, seguindo para API...");
        }
        
        // --- CHAMADA API (Para validação completa e Captcha se necessário) ---
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/process-nfce`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({ url }),
            });

            if (response.ok) {
                const result = await response.json();
                
                const hasData = result.valor !== '0,00';
                
                setFormData(prev => ({
                    ...prev,
                    valor: (result.valor && result.valor !== '0,00') ? result.valor : prev.valor,
                    data: result.data || prev.data,
                    descricao: result.descricao || prev.descricao,
                    tipo: 'Despesa (Saiu Dinheiro)',
                    categoria: 'Compra de Mercadoria'
                }));

                if (hasData) {
                    setOcrFeedback('Informações confirmadas pela SEFAZ!');
                } else {
                    setOcrFeedback('Nota com Captcha. Verifique o valor extraído.');
                }
                
                setTimeout(() => setOcrFeedback(null), 8000);
            } else {
                // Se a extração direta falhou e a API também, avisamos
                if (!setFormData) { // simplificação de lógica de erro
                    const error = await response.json();
                    alert('Erro ao processar nota: ' + (error.error || 'Tente novamente.'));
                }
            }
        } catch (err) {
            console.error('Erro no processamento NFC-e:', err);
            // Não alertamos erro se a extração direta já funcionou
        } finally {
            setIsNfceLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            tipo: 'Receita (Entrou Dinheiro)',
            valor: '',
            categoria: 'Venda de Produto',
            descricao: '',
            data: new Date().toISOString().split('T')[0],
            tipo_receita: 'comercio',
            is_recorrente: false,
            recurrence_day: String(new Date().getDate()),
        });
        setComprovante(null);
        setUploadPreview(null);
        setEditingId(null);
    };

    const handleEdit = (item: any) => {
        setFormData({
            tipo: item.tipo,
            valor: String(item.valor).replace('.', ','),
            categoria: item.categoria,
            descricao: item.descricao || '',
            data: item.data,
            tipo_receita: item.tipo_receita || '',
            is_recorrente: item.is_recorrente || false,
            recurrence_day: String(item.recurrence_day || new Date().getDate()),
        });
        setEditingId(item.id);
        setUploadPreview(item.comprovante_url || null);
        setIsModalOpen(true);
        setActiveMenuId(null);
    };

    // --- IA: Categorizar com palavras-chave ---
    const handleCategorizarIA = async () => {
        if (!formData.descricao.trim()) {
            alert('Digite uma descrição para usar a IA de categorização.');
            return;
        }
        setIsAiLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/categorize-transaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({ descricao: formData.descricao }),
            });
            if (response.ok) {
                const result = await response.json();
                setFormData(prev => ({
                    ...prev,
                    categoria: result.categoria || prev.categoria,
                    tipo_receita: result.tipo_receita || prev.tipo_receita,
                    tipo: result.tipo === 'receita'
                        ? 'Receita (Entrou Dinheiro)'
                        : result.tipo === 'despesa'
                        ? 'Despesa (Saiu Dinheiro)'
                        : prev.tipo,
                }));
            }
        } catch (err) {
            console.error('Erro na categorização IA:', err);
        }
        setIsAiLoading(false);
    };

    // --- OCR: Extração de dados do comprovante ---
    const processarComprovante = async (file: File) => {
        if (!file.type.startsWith('image/')) return;
        
        setIsOcrLoading(true);
        setOcrFeedback(null);
        
        try {
            const worker = await createWorker('por');
            const { data: { text } } = await worker.recognize(file);
            await worker.terminate();

            console.log('Texto extraído:', text);
            const updates: Partial<FormData> = {};
            const upperText = text.toUpperCase();

            // Inteligência de Fluxo: Identificar se é um comprovante de pagamento ou de bancos conhecidos
            const bancos = ['NUBANK', 'ITAU', 'BRADESCO', 'SANTANDER', 'INTER', 'C6', 'BANCO DO BRASIL', 'CAIXA ECONÔMICA'];
            const isBanco = bancos.some(b => upperText.includes(b));

            if (upperText.includes('COMPROVANTE DE PAGAMENTO') || upperText.includes('COMPROVANTE DE TRANSFERENCIA') || isBanco) {
                // REGRA DE OURO: Se é comprovante de banco ou pagamento, é DESPESA
                updates.tipo = 'Despesa (Saiu Dinheiro)';
            }

            // 1. Extrair Valor
            // Padrões: R$ 123,45 | 123,45 | R$123.45 | Total: 123,45
            const valorMatch = text.match(/(?:R\$|VALOR|TOTAL|PAGO|PAGAR)\s*[:]?\s*(\d+(?:\.\d{3})*,\d{2})/i) || 
                               text.match(/(\d+(?:\.\d{3})*,\d{2})/);
            if (valorMatch) updates.valor = valorMatch[1];
            
            // 2. Extrair Data
            // Suporte a: 10/10/2023 | 10-10-2023 | 08 MAR 2026 | 08 DE MARÇO DE 2026
            const meses: Record<string, string> = {
                'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04', 'mai': '05', 'jun': '06',
                'jul': '07', 'ago': '08', 'set': '09', 'out': '10', 'nov': '11', 'dez': '12',
                'janeiro': '01', 'fevereiro': '02', 'março': '03', 'marco': '03', 'abril': '04', 'maio': '05', 'junho': '06',
                'julho': '07', 'agosto': '08', 'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
            };

            // Padrão numérico: DD/MM/YYYY ou DD/MM/YY
            const dataNumMatch = text.match(/(\d{2})[/-](\d{2})[/-](\d{2,4})/);
            
            // Padrão textual: DD MMM YYYY ou DD de MMM de YYYY
            const dataTextMatch = text.match(/(\d{2})\s*(?:de\s*)?([a-zA-ZçÇ]{3,})\s*(?:de\s*)?(\d{4})/i);

            if (dataNumMatch) {
                const day = dataNumMatch[1];
                const month = dataNumMatch[2];
                const year = dataNumMatch[3].length === 2 ? `20${dataNumMatch[3]}` : dataNumMatch[3];
                updates.data = `${year}-${month}-${day}`;
            } else if (dataTextMatch) {
                const day = dataTextMatch[1];
                const monthName = dataTextMatch[2].toLowerCase().substring(0, 3);
                const month = meses[monthName] || meses[dataTextMatch[2].toLowerCase()];
                const year = dataTextMatch[3];
                if (month) {
                    updates.data = `${year}-${month}-${day}`;
                }
            }

            // 3. Extrair Descrição (Geralmente a primeira linha ou nome fantasia)
            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
            let descricao = lines[0];
            
            if (descricao && (descricao.toUpperCase().includes('CUPOM') || descricao.toUpperCase().includes('COMPROVANTE') || descricao.toUpperCase().includes('EXTRATO'))) {
                descricao = lines[1] || descricao;
            }
            if (descricao) updates.descricao = descricao;

            // 4. Categorização Inteligente baseada na descrição extraída
            if (descricao) {
                const lowerDesc = descricao.toLowerCase();
                if (lowerDesc.includes('internet') || lowerDesc.includes('vivo') || lowerDesc.includes('claro') || lowerDesc.includes('oi')) {
                    updates.categoria = 'Internet';
                    updates.tipo = 'Despesa (Saiu Dinheiro)';
                } else if (lowerDesc.includes('posto') || lowerDesc.includes('shell') || lowerDesc.includes('ipiranga') || lowerDesc.includes('combustivel') || lowerDesc.includes('gasolina')) {
                    updates.categoria = 'Combustível';
                    updates.tipo = 'Despesa (Saiu Dinheiro)';
                } else if (lowerDesc.includes('mercado') || lowerDesc.includes('extra') || lowerDesc.includes('pao de acucar') || lowerDesc.includes('carrefour') || lowerDesc.includes('supermercado')) {
                    updates.categoria = 'Alimentação';
                    updates.tipo = 'Despesa (Saiu Dinheiro)';
                } else if (lowerDesc.includes('aluguel') || lowerDesc.includes('locacao') || lowerDesc.includes('imobiliaria')) {
                    updates.categoria = 'Aluguel';
                    updates.tipo = 'Despesa (Saiu Dinheiro)';
                } else if (lowerDesc.includes('venda') || lowerDesc.includes('cliente') || lowerDesc.includes('pagamento recebido')) {
                    // Regra de Ouro: Só sugere Venda se o tipo não tiver sido forçado para Despesa pelo Banco/Comprovante
                    if (updates.tipo !== 'Despesa (Saiu Dinheiro)') {
                        updates.categoria = 'Venda de Produto';
                        updates.tipo = 'Receita (Entrou Dinheiro)';
                    }
                }
            }

            // Fallback: Se for despesa e não tiver categoria definida, usa 'Outros'
            if (updates.tipo === 'Despesa (Saiu Dinheiro)' && !updates.categoria) {
                updates.categoria = 'Outros';
            }

            if (Object.keys(updates).length > 0) {
                // Se a data foi extraída, ela será aplicada, sobrepondo a data atual/padrão
                setFormData(prev => ({ ...prev, ...updates }));
                setOcrFeedback('Dados extraídos do comprovante. Por favor, revise os campos destacados.');
                setTimeout(() => setOcrFeedback(null), 8000);
            }

        } catch (error) {
            console.error('Erro no processamento OCR:', error);
        } finally {
            setIsOcrLoading(false);
        }
    };

    // --- Upload de comprovante ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setComprovante(file);
        
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setUploadPreview(ev.target?.result as string);
                processarComprovante(file);
            };
            reader.readAsDataURL(file);
        } else {
            setUploadPreview(null);
        }
    };

    const uploadComprovante = async (userId: string): Promise<string | null> => {
        if (!comprovante) return null;
        const ext = comprovante.name.split('.').pop();
        const path = `${userId}/${Date.now()}.${ext}`;
        const { error } = await supabase.storage
            .from('comprovantes')
            .upload(path, comprovante, { contentType: comprovante.type });
        if (error) { console.error('Upload error:', error); return null; }
        const { data: urlData } = supabase.storage.from('comprovantes').getPublicUrl(path);
        return urlData?.publicUrl || null;
    };

    // --- Salvar lançamento ---
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setIsSubmitting(true);

        // Verificação de plano COM STATUS ATIVO
        const { data: profile } = await supabase
            .from('users_profile')
            .select('plano, plan_status')
            .eq('id', user.id)
            .single();

        const isActive = profile?.plan_status === 'active' || profile?.plan_status === 'pro';
        const isProPlan = ['pro', 'elite', 'elite_pro'].includes(profile?.plano || '');
        const userIsPro = isActive && isProPlan;

        if (!userIsPro) {
            const { count } = await supabase
                .from('transacoes')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            const { data: transacoes } = await supabase
                .from('transacoes')
                .select('valor')
                .eq('user_id', user.id);

            const totalVolume = transacoes?.reduce((acc, t) => acc + t.valor, 0) || 0;
            const currentVal = parseFloat(formData.valor.replace(',', '.'));

            if (count !== null && count >= 20) {
                setLimitReason('Você atingiu o limite de 20 lançamentos do seu plano gratuito.');
                setIsLimitModalOpen(true);
                setIsSubmitting(false);
                return;
            }
            if (totalVolume + currentVal > 1000) {
                setLimitReason(`O plano gratuito permite movimentação de até R$ 1.000,00. Seu volume atual já é R$ ${totalVolume.toLocaleString('pt-BR')}.`);
                setIsLimitModalOpen(true);
                setIsSubmitting(false);
                return;
            }
        }

        const val = parseFloat(formData.valor.replace(',', '.'));
        if (isNaN(val)) { alert('Valor inválido'); setIsSubmitting(false); return; }

        // Upload do comprovante (somente Pro)
        let comprovante_url = editingId ? (data.find(d => d.id === editingId)?.comprovante_url || null) : null;
        
        if (userIsPro && comprovante) {
            comprovante_url = await uploadComprovante(user.id);
        }

        const payload: any = {
            tipo: formData.tipo,
            valor: val,
            categoria: formData.categoria,
            descricao: formData.descricao,
            data: formData.data,
            user_id: user.id,
            comprovante_url,
            tipo_receita: formData.tipo.includes('Receita') ? (formData.tipo_receita || null) : null,
            is_recorrente: formData.is_recorrente,
            recurrence_day: formData.is_recorrente ? parseInt(formData.recurrence_day) : null,
        };

        let result;
        if (editingId) {
            result = await supabase
                .from('transacoes')
                .update(payload)
                .eq('id', editingId)
                .eq('user_id', user.id); // Proteção: só edita se for o dono
        } else {
            result = await supabase.from('transacoes').insert(payload);
        }

        if (result.error) {
            alert(result.error.message);
        } else {
            setIsModalOpen(false);
            resetForm();
            fetchData();
        }
        setIsSubmitting(false);
    };

    const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);
    const [isGeneratingSignedUrl, setIsGeneratingSignedUrl] = useState(false);

    const handleViewComprovante = async (url: string) => {
        if (!url) return;
        
        // Se já for uma URL data: (preview local), usa direto
        if (url.startsWith('data:')) {
            setViewingImageUrl(url);
            return;
        }

        setIsGeneratingSignedUrl(true);
        try {
            // Extrair o path da URL do Supabase
            // Formato esperado: .../storage/v1/object/public/comprovantes/PATH
            const parts = url.split('/comprovantes/');
            if (parts.length > 1) {
                const path = parts[1];
                const { data, error } = await supabase.storage
                    .from('comprovantes')
                    .createSignedUrl(path, 3600); // 1 hora de validade
                
                if (error) throw error;
                if (data?.signedUrl) {
                    setViewingImageUrl(data.signedUrl);
                }
            } else {
                // Se não conseguir parsear, tenta usar a URL original (fallback)
                setViewingImageUrl(url);
            }
        } catch (error) {
            console.error('Erro ao gerar URL assinada:', error);
            // Fallback para a URL original em caso de erro
            setViewingImageUrl(url);
        } finally {
            setIsGeneratingSignedUrl(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir?')) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('transacoes')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id); // Proteção: só deleta se for o dono
        
        if (error) alert(error.message);
        else fetchData();
        setActiveMenuId(null);
    };

    const filteredData = data.filter(item =>
        !searchTerm ||
        item.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const faturamentoTotal = data
        .filter(t => t.tipo?.includes('Receita'))
        .reduce((acc, t) => acc + (t.valor || 0), 0);
    
    const isLimitReached = !isPro && faturamentoTotal >= 1000;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight">Livro Caixa</h1>
                    <p className="text-white/40 mt-1 font-medium">Controle seu fluxo de caixa detalhadamente.</p>
                </div>
                {isLimitReached ? (
                    <button
                        onClick={() => handleUpgrade()}
                        className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black px-8 py-3 rounded-2xl shadow-xl shadow-red-600/20 flex flex-col items-center justify-center transition-all active:scale-95 group text-sm relative overflow-hidden"
                    >
                        <span className="flex items-center gap-2 z-10"><Lock size={16} /> Limite de R$ 1000 atingido.</span>
                        <span className="text-[10px] uppercase tracking-widest font-bold opacity-80 z-10">Migre para o Pro para continuar</span>
                    </button>
                ) : (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-2 transition-all active:scale-95 group"
                    >
                        <Plus size={22} className="group-hover:rotate-90 transition-transform" />
                        Novo Lançamento
                    </button>
                )}
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            ) : (
                <div className="bg-white/[0.03] border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-md">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between gap-6">
                        <div className="relative flex-1 max-w-lg">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                            <input
                                type="text"
                                placeholder="Pesquisar por descrição ou categoria..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-primary/50 text-sm text-white font-medium transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-4 bg-white/5 border border-white/5 rounded-2xl text-white/40 hover:text-white transition-all">
                                <Filter size={20} />
                            </button>
                            <button className="p-4 bg-white/5 border border-white/5 rounded-2xl text-white/40 hover:text-white transition-all">
                                <Download size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-[10px] font-black text-white/30 uppercase tracking-[2px] border-b border-white/5">
                                    <th className="px-8 py-6">Data</th>
                                    <th className="px-8 py-6">Categoria</th>
                                    <th className="px-8 py-6">Descrição</th>
                                    <th className="px-8 py-6">Tipo</th>
                                    <th className="px-8 py-6 text-right">Valor</th>
                                    <th className="px-8 py-6 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {filteredData.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/[0.01] transition-all group">
                                        <td className="px-8 py-6 text-sm font-bold text-white">
                                            {new Date(item.data).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                                                {item.categoria}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-medium text-white">
                                            <div className="flex items-center gap-2">
                                                {item.descricao}
                                                {item.comprovante_url && (
                                                    <button 
                                                        onClick={() => handleViewComprovante(item.comprovante_url)}
                                                        className="p-1.5 bg-primary/10 hover:bg-primary/20 rounded-lg transition-all text-primary flex items-center justify-center group/icon disabled:opacity-50"
                                                        title="Ver comprovante"
                                                        disabled={isGeneratingSignedUrl}
                                                    >
                                                        {isGeneratingSignedUrl ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Search size={14} className="group-hover/icon:scale-110 transition-transform" />
                                                        )}
                                                    </button>
                                                )}
                                                {item.is_recorrente && (
                                                    <RefreshCw size={12} className="text-white/30" aria-label="Recorrente" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {item.tipo_receita && (
                                                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${item.tipo_receita === 'servico' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'}`}>
                                                    {item.tipo_receita === 'servico' ? 'Serviço' : 'Comércio'}
                                                </span>
                                            )}
                                        </td>
                                        <td className={`px-8 py-6 text-right text-base font-black tracking-tight ${item.tipo?.includes('Receita') ? 'text-green-400' : 'text-red-500'}`}>
                                            {item.tipo?.includes('Receita') ? '+' : '-'} {item.valor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex items-center justify-center gap-2 relative">
                                                <button 
                                                    onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                                                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all"
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>
                                                
                                                {activeMenuId === item.id && (
                                                    <div className="absolute right-full mr-2 z-50 bg-zinc-900 border border-white/10 rounded-2xl p-2 shadow-2xl min-w-[140px] animate-in fade-in slide-in-from-right-2">
                                                        <button 
                                                            onClick={() => handleEdit(item)}
                                                            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                                        >
                                                            <Sparkles size={14} className="text-primary" /> Editar
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(item.id)}
                                                            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500/70 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                                                        >
                                                            <Trash2 size={14} /> Excluir
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredData.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center gap-4 text-white/10 uppercase tracking-[6px] font-black">
                                                <ShoppingBag size={64} className="mb-4" />
                                                <span>Nenhum registro encontrado</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ===== VISUALIZADOR DE COMPROVANTE (MODAL) ===== */}
            {viewingImageUrl && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 md:p-10 animate-in fade-in zoom-in duration-300">
                    <button 
                        onClick={() => setViewingImageUrl(null)}
                        className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-10"
                    >
                        <X size={24} />
                    </button>
                    <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
                        {viewingImageUrl.toLowerCase().endsWith('.pdf') ? (
                            <iframe src={viewingImageUrl} className="w-full h-full rounded-2xl border border-white/10" />
                        ) : (
                            <img 
                                src={viewingImageUrl} 
                                alt="Comprovante" 
                                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl shadow-black/50 border border-white/5" 
                            />
                        )}
                    </div>
                </div>
            )}

            {/* ===== MODAL DE NOVO LANÇAMENTO ===== */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto p-4 md:pt-10 md:pb-10 font-manrope">
                    <div className="w-full max-w-4xl relative">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6 md:mb-8 px-4 md:px-0 mt-8 md:mt-0">
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                                {editingId ? 'Editar Lançamento' : 'Novo Lançamento'}
                            </h2>
                            <div className="flex items-center gap-4">
                                {editingId && (
                                    <span className="bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Editando Registro</span>
                                )}
                                <button
                                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                                    className="p-4 bg-white/5 rounded-full text-white/40 hover:text-white transition-all border border-white/5"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-white/[0.02] border border-white/5 p-6 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />

                            {/* Alerta de OCR */}
                            {ocrFeedback && (
                                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 relative z-20">
                                    <Sparkles className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-blue-200 leading-relaxed">
                                        {ocrFeedback}
                                    </p>
                                    <button onClick={() => setOcrFeedback(null)} className="ml-auto p-1 hover:bg-white/10 rounded-lg transition-colors">
                                        <X className="w-4 h-4 text-blue-400/50 hover:text-blue-400" />
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleSave} className="relative z-10 space-y-8 md:space-y-12">
                                {/* Type Toggle */}
                                <div className="flex justify-center">
                                    <div className="flex p-1.5 bg-black/40 rounded-2xl border border-white/5 w-full max-w-[320px]">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, tipo: 'Receita (Entrou Dinheiro)', tipo_receita: 'comercio' })}
                                            className={`flex-1 py-4 flex items-center justify-center gap-2 rounded-2xl text-xs font-black transition-all ${formData.tipo.includes('Receita') ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-lg shadow-green-500/5' : 'text-white/20 hover:text-white'}`}
                                        >
                                            <TrendingUp size={16} /> Receita
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, tipo: 'Despesa (Saiu Dinheiro)', tipo_receita: '' })}
                                            className={`flex-1 py-4 flex items-center justify-center gap-2 rounded-2xl text-xs font-black transition-all ${formData.tipo.includes('Despesa') ? 'bg-white/5 text-white/60' : 'text-white/20 hover:text-white'}`}
                                        >
                                            <TrendingDown size={16} /> Despesa
                                        </button>
                                    </div>
                                </div>

                                {/* Value Input */}
                                <div className="text-center group pt-4 md:pt-0">
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[4px] mb-4">VALOR TOTAL</p>
                                    <div className="flex items-center justify-center gap-4 mb-4">
                                        <span className="text-4xl font-black text-white/20">R$</span>
                                        <input
                                            type="text"
                                            required
                                            className="bg-transparent border-none outline-none text-7xl md:text-8xl font-black text-white tracking-tighter w-full max-w-[380px] text-center"
                                            value={formData.valor}
                                            placeholder="0,00"
                                            onChange={e => setFormData({ ...formData, valor: e.target.value })}
                                        />
                                    </div>
                                    <div className="w-32 h-1 bg-primary/20 mx-auto rounded-full overflow-hidden">
                                        <div className="w-1/2 h-full bg-primary" />
                                    </div>
                                </div>

                                {/* Category Grid */}
                                <div>
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[3px] mb-4">SELECIONE A CATEGORIA</p>
                                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => {
                                                    const isExpense = ['Aluguel', 'Internet', 'Compra de Mercadoria', 'Frete', 'Alimentação', 'Combustível', 'Saúde', 'Impostos (DAS)'].includes(cat.id);
                                                    setFormData({ 
                                                        ...formData, 
                                                        categoria: cat.id,
                                                        tipo: isExpense ? 'Despesa (Saiu Dinheiro)' : formData.tipo,
                                                        tipo_receita: isExpense ? '' : formData.tipo_receita
                                                    });
                                                }}
                                                className={`p-4 rounded-[24px] border transition-all flex flex-col items-center gap-3 group ${formData.categoria === cat.id
                                                    ? 'bg-primary/10 border-primary/40 text-white'
                                                    : 'bg-white/[0.03] border-white/5 text-white/40 hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                <div className={`p-2.5 rounded-xl transition-all ${formData.categoria === cat.id ? 'bg-primary text-white' : 'bg-white/5 group-hover:bg-white/10'}`}>
                                                    <cat.icon size={18} />
                                                </div>
                                                <span className="text-[9px] font-black uppercase tracking-wider text-center leading-tight">{cat.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* tipo_receita (só para receitas) */}
                                {formData.tipo.includes('Receita') && (
                                    <div>
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[3px] mb-4 flex items-center gap-2">
                                            <Tag size={12} /> TIPO DE RECEITA (DASN-SIMEI)
                                        </p>
                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, tipo_receita: 'servico' })}
                                                className={`flex-1 py-4 px-6 rounded-2xl border text-sm font-black transition-all ${formData.tipo_receita === 'servico' ? 'bg-blue-500/10 border-blue-500/40 text-blue-400' : 'bg-white/[0.03] border-white/5 text-white/40 hover:bg-white/5 hover:text-white'}`}
                                            >
                                                🔧 Prestação de Serviço
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, tipo_receita: 'comercio' })}
                                                className={`flex-1 py-4 px-6 rounded-2xl border text-sm font-black transition-all ${formData.tipo_receita === 'comercio' ? 'bg-purple-500/10 border-purple-500/40 text-purple-400' : 'bg-white/[0.03] border-white/5 text-white/40 hover:bg-white/5 hover:text-white'}`}
                                            >
                                                🛒 Venda / Comércio
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Bottom Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[3px] mb-3">DATA</p>
                                        <div className="relative group">
                                            <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" size={18} />
                                            <input
                                                type="date"
                                                required
                                                className="w-full bg-white/[0.03] border border-white/5 rounded-3xl px-14 py-5 outline-none focus:border-primary/40 text-sm font-bold transition-all text-white/80"
                                                value={formData.data}
                                                onChange={e => setFormData({ ...formData, data: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[3px] mb-3">DESCRIÇÃO</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Ex: Venda produto X, Posto Rodocel..."
                                                className="flex-1 bg-white/[0.03] border border-white/5 rounded-3xl px-6 py-5 outline-none focus:border-primary/40 text-sm font-bold transition-all text-white placeholder:text-white/10"
                                                value={formData.descricao}
                                                onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleCategorizarIA}
                                                disabled={isAiLoading}
                                                title="Categorizar com IA"
                                                className="p-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-2xl text-primary transition-all flex-shrink-0 flex items-center justify-center"
                                            >
                                                {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                            </button>
                                        </div>
                                        <p className="text-[9px] text-primary/60 font-bold mt-1.5 ml-2">✨ Clique no ícone para categorizar automaticamente</p>
                                    </div>
                                </div>

                                {/* Automação de Lançamento: Foto ou QR Code */}
                                <div>
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[3px] mb-3 flex items-center gap-2">
                                            <Sparkles size={12} className="text-primary" /> AUTOMAÇÃO DE LANÇAMENTO
                                            <button 
                                                type="button"
                                                onClick={() => setShowHelpModal(true)}
                                                className="ml-1 p-1 hover:bg-white/10 rounded-full transition-colors text-primary"
                                                title="Dicas para Automação"
                                            >
                                                <HelpCircle size={14} />
                                            </button>
                                        </p>
                                        
                                        <div className="flex flex-col gap-4">
                                            <div className="flex gap-4">
                                                {/* Botão FOTO */}
                                                <div className="flex-1 relative">
                                                    <label 
                                                        onClick={() => !isPro && handleUpgrade()}
                                                        className={`flex flex-col items-center justify-center gap-3 p-8 rounded-3xl border-2 border-dashed transition-all relative overflow-hidden ${!isPro ? 'border-white/5 bg-white/[0.01] cursor-not-allowed grayscale' : 'border-white/10 bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04] cursor-pointer'}`}
                                                    >
                                                        <input
                                                            type="file"
                                                            onChange={handleFileChange}
                                                            accept="image/*,.pdf"
                                                            className="hidden"
                                                            disabled={!isPro}
                                                        />
                                                        {!isPro && (
                                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 p-2 text-center">
                                                                <Lock size={16} className="text-primary mb-1" />
                                                                <span className="text-[8px] font-black text-white uppercase tracking-tighter">Pro</span>
                                                            </div>
                                                        )}
                                                        <Camera size={28} className={!isPro ? 'text-white/10' : 'text-primary/60'} />
                                                        <span className="text-xs font-black uppercase tracking-widest text-white/60">📷 Foto</span>
                                                    </label>
                                                </div>

                                                {/* Botão QR CODE */}
                                                <div className="flex-1 relative">
                                                    <button 
                                                        type="button"
                                                        onClick={() => isPro ? setIsScannerOpen(true) : handleUpgrade()}
                                                        className={`w-full flex flex-col items-center justify-center gap-3 p-8 rounded-3xl border-2 border-dashed transition-all relative overflow-hidden ${!isPro ? 'border-white/5 bg-white/[0.01] cursor-not-allowed grayscale' : 'border-white/10 bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04] cursor-pointer'}`}
                                                    >
                                                        {!isPro && (
                                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 p-2 text-center">
                                                                <Lock size={16} className="text-primary mb-1" />
                                                                <span className="text-[8px] font-black text-white uppercase tracking-tighter">Pro</span>
                                                            </div>
                                                        )}
                                                        <QrCode size={28} className={!isPro ? 'text-white/10' : 'text-primary/60'} />
                                                        <span className="text-xs font-black uppercase tracking-widest text-white/60">📱 QR Code</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Preview de Upload */}
                                            {uploadPreview && !isScannerOpen && (
                                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in">
                                                    <div className="flex items-center gap-4">
                                                        <img src={uploadPreview} alt="Preview" className="h-12 w-12 rounded-lg object-cover border border-white/10" />
                                                        <div>
                                                            <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Arquivo Carregado</p>
                                                            <p className="text-xs font-bold text-white/60 truncate max-w-[150px]">{comprovante?.name}</p>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        type="button"
                                                        onClick={() => { setComprovante(null); setUploadPreview(null); }}
                                                        className="p-2 hover:bg-red-500/10 text-red-400/60 hover:text-red-400 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}

                                            {/* Container do Scanner */}
                                            {isScannerOpen && (
                                                <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 animate-in fade-in duration-300">
                                                    <div className="w-full max-w-sm">
                                                        <div className="flex items-center justify-between mb-8">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                                                                    <QrCode size={20} />
                                                                </div>
                                                                <h3 className="text-xl font-black text-white">Scanner NFC-e</h3>
                                                            </div>
                                                            <button 
                                                                onClick={() => setIsScannerOpen(false)}
                                                                className="p-2 hover:bg-white/5 rounded-xl transition-all text-white/40 hover:text-white"
                                                            >
                                                                <X size={24} />
                                                            </button>
                                                        </div>
                                                        
                                                        {/* Fix: Container and reader styling - More "open" for better field of view */}
                                                        <div className={`mx-auto w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] rounded-[40px] overflow-hidden border-2 transition-all duration-300 shadow-[0_0_50px_rgba(246,85,85,0.2)] bg-black relative ${scanningState === 'detected' ? 'border-green-500 scale-105 shadow-[0_0_60px_rgba(34,197,94,0.4)]' : 'border-primary/30'}`}>
                                                            {/* Ajuste de Contraste Automático Elevado */}
                                                            <div id="reader" className="w-full h-full [&>video]:object-cover [&>video]:contrast-[1.5] [&>video]:brightness-[1.1] [&>video]:saturate-[1.2]"></div>
                                                            
                                                            {/* Scanning Line Animation Overlay */}
                                                            <div className={`absolute top-0 left-0 w-full h-1 shadow-[0_0_15px_rgba(246,85,85,0.8)] z-50 animate-scanner-line pointer-events-none transition-colors ${scanningState === 'detected' ? 'bg-green-500 shadow-green-500/80' : 'bg-primary'}`} />
                                                            
                                                            {/* Feedback de Detecção (Quadrado Verde) */}
                                                            {scanningState === 'detected' && (
                                                                <div className="absolute inset-4 border-4 border-green-500 rounded-3xl z-50 animate-pulse bg-green-500/10" />
                                                            )}

                                                            {/* Subtle Corner Markers instead of heavy border */}
                                                            <div className="absolute inset-8 border border-white/10 rounded-3xl pointer-events-none" />
                                                        </div>

                                                        <p className="mt-8 text-center text-xs text-white/40 font-bold leading-relaxed px-6 mb-6">
                                                            Posicione o <span className="text-white font-black">QR Code no centro do quadrado</span> para leitura instantânea.
                                                        </p>

                                                        <div className="flex flex-col gap-3">
                                                            <button 
                                                                onClick={() => {
                                                                    setIsScannerOpen(false);
                                                                    // Simula o clique no input de arquivo escondido no TransactionForm
                                                                    const ocrInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                                                                    ocrInput?.click();
                                                                }}
                                                                className="w-full py-6 text-white text-xs font-black uppercase tracking-widest bg-primary border border-primary/20 rounded-2xl hover:bg-primary/80 transition-all shadow-[0_0_20px_rgba(246,85,85,0.3)]"
                                                            >
                                                                📸 Tirar Foto da Nota (OCR)
                                                            </button>
                                                        </div>

                                                        <div className="mt-8 flex justify-center opacity-20">
                                                            <div className="flex gap-1 items-center">
                                                                <span className="text-[9px] font-black uppercase tracking-tighter mr-2">Estabilizando Foco</span>
                                                                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                                                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Feedback de Carregamento (OCR ou NFCE) */}
                                            {(isOcrLoading || isNfceLoading) && (
                                                <div className="flex items-center gap-3 px-6 py-4 bg-primary/5 border border-primary/10 rounded-2xl animate-pulse">
                                                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-[2px]">
                                                        {isNfceLoading ? 'Processando nota fiscal com inteligência...' : 'Analisando comprovante com IA...'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                </div>


                                {/* Toggle de Recorrência */}
                                <div>
                                    <div className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/5 rounded-3xl">
                                        <div className="flex items-center gap-3">
                                            <RefreshCw size={18} className={formData.is_recorrente ? 'text-primary' : 'text-white/30'} />
                                            <div>
                                                <p className="text-sm font-black text-white">Lançamento Recorrente</p>
                                                <p className="text-xs text-white/40 font-bold">Gera automaticamente todo mês</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, is_recorrente: !formData.is_recorrente })}
                                            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${formData.is_recorrente ? 'bg-primary' : 'bg-white/10'}`}
                                        >
                                            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${formData.is_recorrente ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    {formData.is_recorrente && (
                                        <div className="mt-3 px-5">
                                            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-2">DIA DO MÊS PARA RENOVAR</p>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="31"
                                                    value={formData.recurrence_day}
                                                    onChange={e => setFormData({ ...formData, recurrence_day: e.target.value })}
                                                    className="w-24 bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-white font-black text-center outline-none focus:border-primary/40"
                                                />
                                                <span className="text-white/40 text-sm font-bold">de cada mês</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary hover:bg-primary/90 text-white font-black py-6 rounded-3xl shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg uppercase tracking-[2px] disabled:opacity-60"
                                >
                                    {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <><Check size={24} /> SALVAR LANÇAMENTO</>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* LIMIT REACHED MODAL - REDESIGNED PRO PREMIUM */}
            {isLimitModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 font-manrope animate-in fade-in zoom-in duration-300">
                    <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-[40px] p-10 text-center shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                        {/* Premium Glow Effects */}
                        <div className="absolute top-0 left-1/4 w-40 h-40 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2" />
                        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-primary/10 rounded-full blur-[80px] translate-y-1/2" />
                        
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-gradient-to-br from-primary/30 to-primary/5 rounded-[30px] flex items-center justify-center text-primary mx-auto mb-10 border border-primary/20 shadow-2xl shadow-primary/20 group-hover:scale-105 transition-all duration-500">
                                {checkoutLoading ? <Loader2 className="animate-spin" size={48} /> : <Sparkles size={48} className="animate-pulse" />}
                            </div>

                            <h2 className="text-3xl font-black mb-4 text-white tracking-tight">Evolua para o Pro</h2>
                            <p className="text-white/60 font-medium mb-10 leading-relaxed text-sm px-4">
                                {limitReason} <br/><br/>
                                <span className="text-white">Desbloqueie o Gestão MEI por 1 ano</span> e profissionalize seu negócio com lançamentos ilimitados, radar preditivo e suporte prioritário.
                                <span className="text-white font-black text-xl block mt-4 tracking-tighter shadow-primary/10">Só R$ 197,00 / ano</span>
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => handleUpgrade('price_1T2cFGLjW93jPn5ym1q6ZEDe')}
                                    disabled={checkoutLoading}
                                    className="w-full bg-gradient-to-r from-primary to-[#ff8c7a] hover:brightness-110 text-white font-black py-5 rounded-2xl shadow-2xl shadow-primary/30 transition-all active:scale-95 text-lg uppercase tracking-widest flex items-center justify-center gap-2 group/btn"
                                >
                                    {checkoutLoading ? <Loader2 className="animate-spin" size={24} /> : (
                                        <>
                                            <span>Assinar Anual</span>
                                            <Zap size={20} fill="currentColor" className="group-hover/btn:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => handleUpgrade('price_1T2cFGLjW93jPn5yJDSCAKev')}
                                    disabled={checkoutLoading}
                                    className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-5 rounded-2xl transition-all text-sm border border-white/5"
                                >
                                    {checkoutLoading ? <Loader2 className="animate-spin" size={20} /> : 'Plano Mensal (R$ 19,90)'}
                                </button>

                                <button
                                    onClick={() => setIsLimitModalOpen(false)}
                                    disabled={checkoutLoading}
                                    className="w-full text-white/30 hover:text-white/60 py-2 transition-all text-xs font-bold uppercase tracking-widest"
                                >
                                    Agora não, obrigado
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* HELP MODAL */}
            {showHelpModal && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 font-manrope animate-in fade-in duration-300">
                    <div className="w-full max-w-lg bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-[40px] p-8 md:p-10 shadow-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                                    <Sparkles size={24} />
                                </div>
                                <h2 className="text-2xl font-black">Dicas para Automação</h2>
                            </div>
                            <button 
                                onClick={() => setShowHelpModal(false)}
                                className="p-2 hover:bg-white/5 rounded-xl transition-all text-white/40 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <p className="text-white/40 text-sm font-bold uppercase tracking-widest border-b border-white/5 pb-2">Guia: Como tirar a Foto Perfeita</p>
                            
                            <div className="space-y-5">
                                <div className="flex gap-4 group">
                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black group-hover:bg-primary group-hover:border-primary transition-all shrink-0">1</div>
                                    <div>
                                        <h4 className="text-sm font-black text-white/80 group-hover:text-white transition-colors">Iluminação é Tudo</h4>
                                        <p className="text-xs text-white/40 font-medium leading-relaxed">Tire a foto em um local bem iluminado. Sombras sobre o valor ou a data podem confundir a leitura de centavos.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 group">
                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black group-hover:bg-primary group-hover:border-primary transition-all shrink-0">2</div>
                                    <div>
                                        <h4 className="text-sm font-black text-white/80 group-hover:text-white transition-colors">Enquadramento Reto</h4>
                                        <p className="text-xs text-white/40 font-medium leading-relaxed">Mantenha o celular paralelo ao papel ou à tela. Fotos inclinadas dificultam a extração do texto em colunas.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 group">
                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black group-hover:bg-primary group-hover:border-primary transition-all shrink-0">3</div>
                                    <div>
                                        <h4 className="text-sm font-black text-white/80 group-hover:text-white transition-colors">Foco no Cabeçalho e Totais</h4>
                                        <p className="text-xs text-white/40 font-medium leading-relaxed">Certifique-se de que o título (ex: "Comprovante de Pagamento") e o Valor Total estejam nítidos.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 group">
                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black group-hover:bg-primary group-hover:border-primary transition-all shrink-0">4</div>
                                    <div>
                                        <h4 className="text-sm font-black text-white/80 group-hover:text-white transition-colors">Evite Amassados</h4>
                                        <p className="text-xs text-white/40 font-medium leading-relaxed">Se o recibo for de papel térmico, tente esticá-lo. Dobras em cima da data são a maior causa de erros.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 group">
                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black group-hover:bg-primary group-hover:border-primary transition-all shrink-0">5</div>
                                    <div>
                                        <h4 className="text-sm font-black text-white/80 group-hover:text-white transition-colors text-primary flex items-center gap-2"><Zap size={14} fill="currentColor" /> Print Screen</h4>
                                        <p className="text-xs text-white/40 font-medium leading-relaxed">Para comprovantes de apps (como Nubank), o Print Screen é sempre a melhor opção: qualidade 100% legível.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowHelpModal(false)}
                            className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-5 rounded-2xl transition-all mt-10 uppercase tracking-widest text-xs"
                        >
                            Entendi, vamos lá
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Versão do Scanner para forçar atualização no cache da Vercel: 2026-03-11_v2.0
export const SCANNER_VERSION = "2.0.1";

export default Transactions;
