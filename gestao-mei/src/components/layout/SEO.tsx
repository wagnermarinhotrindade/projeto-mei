import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    canonical?: string;
}

const SEO: React.FC<SEOProps> = ({ 
    title = 'Gestão MEI - Automação de Livro Caixa e DAS',
    description = 'O sistema definitivo para Microempreendedor Individual. Automatize seu livro caixa, controle o limite de faturamento e emita relatórios DASN em segundos.',
    canonical = 'https://meigestao.app.br/'
}) => {
    const siteTitle = title === 'Gestão MEI - Automação de Livro Caixa e DAS' 
        ? title 
        : `${title} | Gestão MEI`;

    return (
        <Helmet>
            <title>{siteTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonical} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content="https://meigestao.app.br/deshboard.PNG" />
            <meta property="og:type" content="website" />
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:title" content={siteTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content="https://meigestao.app.br/deshboard.PNG" />
        </Helmet>
    );
};

export default SEO;
