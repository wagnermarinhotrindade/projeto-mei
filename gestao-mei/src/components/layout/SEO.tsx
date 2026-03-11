import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title?: string;
    description?: string;
    canonical?: string;
}

const SEO: React.FC<SEOProps> = ({ 
    title = 'Gestão MEI - Automação de Livro Caixa e DAS',
    description = 'O sistema definitivo para Microempreendedor Individual. Automatize seu livro caixa, controle o limite de faturamento e emita relatórios DASN em segundos.',
    canonical
}) => {
    const location = useLocation();
    const siteBase = 'https://meigestao.app.br';
    
    // Se não for fornecida uma canonical específica, gera uma baseada na rota atual
    const currentCanonical = canonical || `${siteBase}${location.pathname}${location.pathname.endsWith('/') ? '' : '/'}`;
    
    const siteTitle = title === 'Gestão MEI - Automação de Livro Caixa e DAS' 
        ? title 
        : `${title} | Gestão MEI`;

    return (
        <Helmet>
            <title>{siteTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={currentCanonical} />
            
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={currentCanonical} />
            <meta property="og:image" content={`${siteBase}/deshboard.PNG`} />
            <meta property="og:type" content="website" />
            
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:title" content={siteTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={`${siteBase}/deshboard.PNG`} />
        </Helmet>
    );
};

export default SEO;
