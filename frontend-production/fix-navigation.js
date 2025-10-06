// Navigation Fix Script - Converte links para âncoras
(function() {
    'use strict';
    
    console.log('🔧 Aplicando correção de navegação...');
    
    // Função para scroll suave
    function smoothScrollTo(targetId) {
        if (targetId === 'top') {
            // Home vai para o topo da página
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    }
    
    // Função para interceptar cliques em links
    function interceptNavigationLinks() {
        // Selecionar todos os links de navegação
        const navLinks = document.querySelectorAll('a[href*="/about"], a[href*="/services"], a[href*="/contact"], a[href*="/home"]');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // Converter URLs para IDs de seção
            let targetId = '';
            if (href.includes('/home') || href === '/' || href === '') {
                targetId = 'top'; // Home vai para o topo
            } else if (href.includes('/about')) {
                targetId = 'about';
            } else if (href.includes('/services')) {
                targetId = 'services';
            } else if (href.includes('/contact')) {
                targetId = 'contact';
            }
            
            // Interceptar somente se a seção existir (ou for topo)
            const sectionExists = targetId === 'top' || !!document.getElementById(targetId);
            if (targetId && sectionExists) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log(`📍 Navegando para seção: ${targetId}`);
                    smoothScrollTo(targetId);
                });
            }
        });
    }
    
    // Função para criar seções se não existirem
    // Removida a injeção de seções placeholder para evitar conteúdo artificial
    
    // Função para adicionar CSS para scroll suave
    function addSmoothScrollCSS() {
        const style = document.createElement('style');
        style.innerHTML = `
            html {
                scroll-behavior: smooth;
            }
            
            .about-section, .services-section, .contact-section {
                min-height: 100vh;
                padding: 60px 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
            }
            
            .about-section {
                background: #f8f9fa;
            }
            
            .services-section {
                background: #e9ecef;
            }
            
            .contact-section {
                background: #dee2e6;
            }
            
            .about-section h2,
            .services-section h2,
            .contact-section h2 {
                font-size: 2.5rem;
                margin-bottom: 1rem;
                color: #333;
            }
            
            .about-section p,
            .services-section p,
            .contact-section p {
                font-size: 1.1rem;
                color: #666;
                max-width: 600px;
                margin: 0 auto;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Executar quando o DOM estiver pronto
    function init() {
        console.log('🚀 Inicializando correção de navegação...');
        
        // Adicionar CSS
        addSmoothScrollCSS();
        
        // Aguardar um pouco para o React carregar e então interceptar links
        setTimeout(() => {
            interceptNavigationLinks();
            console.log('✅ Navegação ajustada! Links com seções existentes rolam suavemente.');
        }, 1000);
    }
    
    // Executar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Re-executar após mudanças no DOM (para SPAs)
    const observer = new MutationObserver(() => {
        setTimeout(interceptNavigationLinks, 500);
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
})();
