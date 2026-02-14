import streamlit as st
import pandas as pd
from datetime import datetime
import time
from st_supabase_connection import SupabaseConnection

# --- CONFIGURAÇÃO DA PÁGINA ---
st.set_page_config(
    page_title="Contador MEI Pro", 
    page_icon="👮‍♂️", 
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- SISTEMA DE DESIGN (ANTI-GRAVITY v4.1) ---
st.markdown("""
<style>
    /* 1. FUNDO E TEXTO GERAL */
    .stApp {
        background-color: #0E1117;
    }
    /* Força títulos e textos principais a serem brancos */
    h1, h2, h3, h4, h5, h6, p, label, .stMarkdown {
        color: #FFFFFF !important;
    }
    
    /* CUIDADO: Mantém texto preto DENTRO dos cards brancos (se houver métricas) */
    [data-testid="stMetricValue"], [data-testid="stMetricLabel"] {
        color: #000000 !important;
    }

    /* 2. HEADER TRANSPARENTE (Para o botão do menu funcionar) */
    header[data-testid="stHeader"] {
        background: transparent !important;
        pointer-events: none; /* Deixa clicar no conteúdo abaixo dele */
    }

    /* 3. ESCONDER BARRA SUPERIOR (GitHub, Deploy, etc.) */
    [data-testid="stToolbar"] {
        display: none !important;
    }
    [data-testid="stDecoration"] {
        display: none !important;
    }

    /* 4. ESCONDER RODAPÉ E ÍCONES DE "VIEWER BADGE" (Coroa/Perfil) */
    footer {
        display: none !important;
    }
    #MainMenu {
        display: none !important;
    }
    /* O seletor mágico para a Coroa e Perfil */
    div[class*="viewerBadge"] {
        display: none !important;
    }

    /* 5. BOTÃO DE MENU (Sempre visível e clicável) */
    [data-testid="stSidebarCollapsedControl"] {
        display: block !important;
        pointer-events: auto; /* Reativa o clique no botão */
        color: #FFFFFF !important;
        background-color: #1E1E1E !important;
        border: 2px solid #FFFFFF !important;
        border-radius: 8px !important;
        z-index: 999999 !important;
        width: 50px !important;
        height: 50px !important;
        position: fixed !important;
        top: 10px !important;
        left: 10px !important;
    }
    [data-testid="stSidebarCollapsedControl"] svg {
        fill: #FFFFFF !important;
        stroke: #FFFFFF !important;
        width: 30px !important;
        height: 30px !important;
    }

    /* --- ESTILOS COMPLEMENTARES DO SISTEMA (FINANCIAL MODE) --- */
    .block-container { padding-top: 1rem; padding-bottom: 0rem; }
    
    [data-testid="stSidebar"] {
        background-color: #1E1E1E !important;
    }
    [data-testid="stSidebar"] * {
        color: white !important;
    }

    div[role="radiogroup"] label {
        color: white !important;
        font-weight: 500;
    }

    .metric-container {
        display: flex;
        gap: 20px;
        margin-bottom: 25px;
    }

    .metric-card {
        background-color: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        flex: 1;
        border-top: 5px solid #2e7d32;
    }

    .metric-label {
        color: #555 !important; /* Força cinza nos labels internos do card */
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        margin-bottom: 8px;
    }

    .metric-value {
        color: #000 !important; /* Força preto nos valores internos do card */
        font-size: 1.6rem;
        font-weight: 700;
    }

    .sidebar-footer {
        position: fixed;
        bottom: 15px;
        left: 15px;
        font-size: 0.75rem;
        color: #777;
    }
</style>
""", unsafe_allow_html=True)

# --- CONEXÃO COM O BANCO ---
@st.cache_resource
def get_client():
    try:
        return st.connection("supabase", type=SupabaseConnection)
    except Exception as e:
        st.error(f"Erro de conexão: {e}")
        return None

client = get_client()

# --- FUNÇÕES DE NEGÓCIO COM CACHE ---

@st.cache_data(ttl=60)
def carregar_transacoes(user_id):
    try:
        res = client.table("transacoes").select("*").eq("user_id", user_id).order("data", desc=True).execute()
        return pd.DataFrame(res.data) if res.data else pd.DataFrame()
    except:
        return pd.DataFrame()

def limpar_cache():
    st.cache_data.clear()

def salvar_transacao(user_id, data, tipo, valor, descricao, categoria):
    try:
        client.table("transacoes").insert({
            "user_id": user_id,
            "data": str(data),
            "tipo": tipo,
            "valor": valor,
            "descricao": descricao,
            "categoria": categoria
        }).execute()
        limpar_cache()
        return True
    except Exception as e:
        st.error(f"Erro ao salvar: {e}")
        return False

def excluir_transacao(tid):
    try:
        client.table("transacoes").delete().eq("id", tid).execute()
        limpar_cache()
        return True
    except Exception as e:
        st.error(f"Erro ao excluir: {e}")
        return False

def login_usuario(email, senha):
    try:
        res = client.auth.sign_in_with_password({"email": email, "password": senha})
        return res.user.id
    except:
        return None

# --- CONTROLE DE SESSÃO ---
if 'user_id' not in st.session_state:
    st.session_state.user_id = None

if not st.session_state.user_id:
    st.title("🔒 Login Contador MEI")
    t1, t2 = st.tabs(["Acessar", "Criar Conta"])
    with t1:
        with st.form("l"):
            email = st.text_input("E-mail")
            senha = st.text_input("Senha", type="password")
            if st.form_submit_button("Entrar", use_container_width=True):
                uid = login_usuario(email, senha)
                if uid:
                    st.session_state.user_id = uid
                    st.rerun()
                else:
                    st.error("Credenciais inválidas ou e-mail não confirmado.")
    with t2:
        with st.form("c"):
            n_email = st.text_input("Novo E-mail")
            n_senha = st.text_input("Nova Senha", type="password")
            if st.form_submit_button("Cadastrar", use_container_width=True):
                try:
                    client.auth.sign_up({"email": n_email, "password": n_senha})
                    st.success("Conta criada! Confirme seu e-mail para entrar.")
                except Exception as e:
                    st.error(f"Erro: {e}")
    st.stop()

# --- INTERFACE PRINCIPAL ---

with st.sidebar:
    st.markdown("### 👮‍♂️ Contador MEI")
    menu = st.radio("Menu de Navegação", ["Visão Geral (Dashboard)", "Lançar Novo", "Extrato Completo", "Declaração IRPF"])
    st.markdown("---")
    if st.button("🚪 Sair", use_container_width=True):
        st.session_state.user_id = None
        st.rerun()
    st.markdown('<div class="sidebar-footer">Sistema v4.1 - Anti-Gravity 🚀</div>', unsafe_allow_html=True)

df = carregar_transacoes(st.session_state.user_id)

if menu == "Visão Geral (Dashboard)":
    st.title("📊 Raio-X da Sua Empresa")
    
    if not df.empty:
        # Lógica de cálculo
        receitas = df[df['tipo'].str.contains("Receita", na=False)]['valor'].sum()
        despesas = df[df['tipo'].str.contains("Despesa", na=False)]['valor'].sum()
        lucro = receitas - despesas
        
        # Cards Customizados
        col1, col2, col3 = st.columns(3)
        with col1:
            st.markdown(f'<div class="metric-card"><div class="metric-label">Faturamento Anual</div><div class="metric-value">R$ {receitas:,.2f}</div></div>', unsafe_allow_html=True)
        with col2:
            st.markdown(f'<div class="metric-card" style="border-top-color: #c62828;"><div class="metric-label">Despesas Totais</div><div class="metric-value">R$ {despesas:,.2f}</div></div>', unsafe_allow_html=True)
        with col3:
            st.markdown(f'<div class="metric-card" style="border-top-color: #1976d2;"><div class="metric-label">Lucro Líquido</div><div class="metric-value">R$ {lucro:,.2f}</div></div>', unsafe_allow_html=True)
            
        st.markdown("---")
        st.subheader("📈 Progresso do Limite MEI (81k)")
        percent = min(receitas / 81000, 1.0)
        st.progress(percent)
        st.write(f"Você utilizou **{percent*100:.1f}%** do faturamento anual permitido.")
    else:
        st.info("Nenhum dado encontrado. Comece lançando suas movimentações!")

elif menu == "Lançar Novo":
    st.title("💰 Lançar Movimentação")
    with st.form("f_mov", clear_on_submit=True):
        tipo = st.selectbox("Tipo", ["Receita (Entrou Dinheiro)", "Despesa (Saiu Dinheiro)"])
        c1, c2 = st.columns(2)
        with c1:
            valor = st.number_input("Valor (R$)", min_value=0.0, step=0.01)
        with c2:
            data = st.date_input("Data", datetime.now())
        cat = st.selectbox("Categoria", ["Venda de Produto", "Prestação de Serviço", "Compra de Mercadoria", "Pagamento de Serviço", "Aluguel", "Energia/Água/Internet", "Pessoal (Retirada do Dono)", "Impostos (DAS)", "Outros"])
        desc = st.text_input("Descrição / Observação")
        
        if st.form_submit_button("Salvar Lançamento", use_container_width=True):
            if valor > 0:
                if salvar_transacao(st.session_state.user_id, data, tipo, valor, desc, cat):
                    st.success("Salvo com sucesso!")
                    time.sleep(0.5)
                    st.rerun()

elif menu == "Extrato Completo":
    st.title("📜 Livro Caixa Interativo")
    st.info("💡 Clique na lixeira 🗑️ para excluir um registro permanentemente.")
    
    if not df.empty:
        # Cabeçalho
        h1, h2, h3, h4, h5 = st.columns([1.5, 2, 3, 1.5, 1])
        h1.markdown("**Data**")
        h2.markdown("**Categoria**")
        h3.markdown("**Descrição**")
        h4.markdown("**Valor**")
        h5.markdown("**Ação**")
        st.markdown("---")
        
        # Loop de Linhas Interativas
        for idx, row in df.iterrows():
            c1, c2, c3, c4, c5 = st.columns([1.5, 2, 3, 1.5, 1])
            c1.write(row['data'])
            c2.write(row['categoria'])
            c3.write(row['descricao'])
            color = "green" if "Receita" in row['tipo'] else "red"
            c4.markdown(f":{color}[R$ {row['valor']:,.2f}]")
            if c5.button("🗑️", key=f"del_{row['id']}"):
                if excluir_transacao(row['id']):
                    st.rerun()
    else:
        st.write("Nada aqui ainda.")

elif menu == "Declaração IRPF":
    st.title("🦁 Gerador de Informe de Rendimentos (DIRPF)")
    
    if not df.empty:
        # 1. Lógica de Cálculo (Crucial)
        # Filtramos receitas e despesas
        df_receitas = df[df['tipo'].str.contains("Receita", na=False)]
        df_despesas = df[df['tipo'].str.contains("Despesa", na=False)]
        
        servico_total = df_receitas[df_receitas['categoria'] == "Prestação de Serviço"]['valor'].sum()
        # Comércio inclui "Venda de Produto" e qualquer outra categoria de receita que não seja serviço
        comercio_total = df_receitas[df_receitas['categoria'] != "Prestação de Serviço"]['valor'].sum()
        
        despesa_total = df_despesas['valor'].sum()
        lucro_real = (servico_total + comercio_total) - despesa_total
        
        # Cálculo da Isenção (Regra MEI)
        isencao_servico = servico_total * 0.32
        isencao_comercio = comercio_total * 0.08
        total_isento = isencao_servico + isencao_comercio
        
        # Base Tributável
        base_tributavel = max(lucro_real - total_isento, 0.0)
        
        # 2. Interface Visual (Layout Premium)
        st.subheader("📋 Memória de Cálculo")
        m1, m2, m3 = st.columns(3)
        m1.metric("Receita Bruta Total", f"R$ {servico_total + comercio_total:,.2f}")
        m2.metric("Despesas Comprovadas", f"R$ {despesa_total:,.2f}")
        m3.metric("Lucro Real da Empresa", f"R$ {lucro_real:,.2f}", delta=f"{lucro_real:,.2f}", delta_color="normal")
        
        st.markdown("---")
        st.subheader("💡 Parcela Isenta (Cálculo Automático)")
        c1, c2 = st.columns(2)
        with c1:
            st.info(f"**Serviços (32% de isenção):**\nR$ {isencao_servico:,.2f}")
        with c2:
            st.success(f"**Comércio/Vendas (8% de isenção):**\nR$ {isencao_comercio:,.2f}")
            
        st.markdown("---")
        st.subheader("🎯 Onde lançar no programa do IRPF?")
        
        st.success(f"""
        ### 1. Rendimentos Isentos e Não Tributáveis
        **Código 13.** Valor a Lançar: **R$ {total_isento:,.2f}**
        """)
        
        st.error(f"""
        ### 2. Rendimentos Tributáveis Recebidos de PJ
        Valor a Lançar: **R$ {base_tributavel:,.2f}**
        """)
        
        # 3. Botão de Exportação
        resumo_formatado = f"""RELATÓRIO DE RENDIMENTOS MEI - 2025
-------------------------------------------
RESUMO DE RECEITAS:
Serviços: R$ {servico_total:,.2f}
Comércio/Produtos: R$ {comercio_total:,.2f}
RECEITA BRUTA TOTAL: R$ {servico_total + comercio_total:,.2f}

RESUMO DE DESPESAS:
Despesas Comprovadas: R$ {despesa_total:,.2f}

RESULTADO:
Lucro Real da Empresa: R$ {lucro_real:,.2f}

PARA O IRPF (DIRPF):
1. Isentos (Cód 13): R$ {total_isento:,.2f}
2. Tributáveis: R$ {base_tributavel:,.2f}
-------------------------------------------
Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
"""
        st.download_button(
            label="📄 Baixar Relatório (.txt)",
            data=resumo_formatado,
            file_name="relatorio_irpf_2025.txt",
            mime="text/plain",
            use_container_width=True
        )
    else:
        st.info("⚠️ Lance suas movimentações para gerar o relatório de IRPF automaticamente.")
