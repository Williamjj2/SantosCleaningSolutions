/**
 * Add Blog Link to Navigation
 * This script injects "Blog" into the existing React navbar
 */
(function () {
    'use strict';

    function addBlogLink() {
        // Find the navigation container (React renders nav links)
        const nav = document.querySelector('nav');
        if (!nav) return false;

        // Check if Blog link already exists
        if (nav.querySelector('a[href="/blog"]') || nav.querySelector('a[href="/blog/"]')) {
            return true;
        }

        // Find the nav links container
        const navLinks = nav.querySelectorAll('a');
        if (navLinks.length === 0) return false;

        // Find "Contact" link to insert before it
        let contactLink = null;
        let servicesLink = null;

        navLinks.forEach(link => {
            const text = link.textContent.toLowerCase().trim();
            if (text === 'contact' || text === 'contato') {
                contactLink = link;
            }
            if (text === 'services' || text === 'serviços') {
                servicesLink = link;
            }
        });

        // Create the Blog link
        const blogLink = document.createElement('a');
        blogLink.href = '/blog/';
        blogLink.textContent = 'Blog';

        // Copy styling from an existing link
        const referenceLink = servicesLink || contactLink || navLinks[0];
        if (referenceLink) {
            // Copy all classes
            blogLink.className = referenceLink.className;

            // Copy inline styles if any
            blogLink.style.cssText = referenceLink.style.cssText;
        }

        // Insert the Blog link
        if (contactLink && contactLink.parentNode) {
            // Insert before Contact
            contactLink.parentNode.insertBefore(blogLink, contactLink);
            console.log('✅ Blog link added to navbar (before Contact)');
            return true;
        } else if (servicesLink && servicesLink.nextSibling) {
            // Insert after Services
            servicesLink.parentNode.insertBefore(blogLink, servicesLink.nextSibling);
            console.log('✅ Blog link added to navbar (after Services)');
            return true;
        } else if (navLinks.length > 0) {
            // Append to the end of nav links
            const lastLink = navLinks[navLinks.length - 1];
            if (lastLink.parentNode) {
                // If last link is a button (like "Get Quote"), insert before it
                if (lastLink.textContent.toLowerCase().includes('quote') ||
                    lastLink.textContent.toLowerCase().includes('book') ||
                    lastLink.classList.contains('btn') ||
                    lastLink.querySelector('button')) {
                    lastLink.parentNode.insertBefore(blogLink, lastLink);
                } else {
                    lastLink.parentNode.appendChild(blogLink);
                }
                console.log('✅ Blog link added to navbar');
                return true;
            }
        }

        return false;
    }

    function addBlogToMobileMenu() {
        // Find mobile menu (usually hidden by default)
        const mobileMenus = document.querySelectorAll('[class*="mobile"], [class*="drawer"], [class*="sidebar"], [class*="menu"]');

        mobileMenus.forEach(menu => {
            // Check if it has nav links
            const links = menu.querySelectorAll('a');
            if (links.length > 2) {
                // Check if Blog already exists
                let hasBlog = false;
                links.forEach(link => {
                    if (link.href.includes('/blog')) hasBlog = true;
                });

                if (!hasBlog) {
                    // Find a good place to add it
                    links.forEach(link => {
                        if (link.textContent.toLowerCase().includes('contact')) {
                            const blogLink = document.createElement('a');
                            blogLink.href = '/blog/';
                            blogLink.textContent = 'Blog';
                            blogLink.className = link.className;
                            link.parentNode.insertBefore(blogLink, link);
                            console.log('✅ Blog link added to mobile menu');
                        }
                    });
                }
            }
        });
    }

    function init() {
        // Try immediately
        let success = addBlogLink();

        // If not successful, retry a few times (React may not have rendered yet)
        if (!success) {
            let attempts = 0;
            const maxAttempts = 10;
            const interval = setInterval(() => {
                attempts++;
                success = addBlogLink();
                if (success || attempts >= maxAttempts) {
                    clearInterval(interval);
                    if (!success) {
                        console.log('⚠️ Could not add Blog link - navbar not found');
                    }
                }
            }, 500);
        }

        // Also try to add to mobile menu
        setTimeout(addBlogToMobileMenu, 2000);
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Also watch for React re-renders
    const observer = new MutationObserver(() => {
        addBlogLink();
    });

    // Start observing after a short delay
    setTimeout(() => {
        const root = document.getElementById('root');
        if (root) {
            observer.observe(root, { childList: true, subtree: true });
        }
    }, 1000);
})();
