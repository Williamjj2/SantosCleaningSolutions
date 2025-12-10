/**
 * Add Blog Link to Navigation
 * Injects "Blog" link into the React navbar after page load
 */
(function () {
    'use strict';

    // Configuration
    const BLOG_URL = '/blog/';
    const BLOG_TEXT = 'Blog';

    function findNavLinks() {
        // React creates the navigation links as <a> elements inside the header
        // Look for the desktop navigation area
        const header = document.querySelector('header');
        if (!header) return null;

        // Find all anchor links in the header that are navigation items
        const allLinks = header.querySelectorAll('a');
        const navLinks = [];

        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            const text = link.textContent.trim().toLowerCase();

            // These are nav links (not the phone/CTA button)
            if (href === '/' ||
                href === '/about' ||
                href === '/services' ||
                href === '/contact') {
                navLinks.push(link);
            }
        });

        return navLinks;
    }

    function createBlogLink(referenceLink) {
        const blogLink = document.createElement('a');
        blogLink.href = BLOG_URL;
        blogLink.textContent = BLOG_TEXT;

        // Copy the exact class name from the reference link
        if (referenceLink && referenceLink.className) {
            blogLink.className = referenceLink.className;
        }

        return blogLink;
    }

    function addBlogToDesktopNav() {
        const header = document.querySelector('header');
        if (!header) return false;

        // Check if blog already exists
        const existingBlog = header.querySelector('a[href="/blog"], a[href="/blog/"]');
        if (existingBlog) return true;

        // Find the hidden desktop nav (lg:flex)
        const desktopNav = header.querySelector('nav.hidden.lg\\:flex, nav[class*="lg:flex"].hidden');
        if (!desktopNav) {
            // Try alternative: find nav with space-x-8 class
            const altNav = header.querySelector('nav[class*="space-x-8"]');
            if (altNav) {
                return addBlogToNav(altNav);
            }
            return false;
        }

        return addBlogToNav(desktopNav);
    }

    function addBlogToNav(navElement) {
        // Find the Contact link
        const links = navElement.querySelectorAll('a');
        let contactLink = null;
        let servicesLink = null;

        links.forEach(link => {
            const text = link.textContent.trim().toLowerCase();
            if (text === 'contact' || text === 'contato' || text === 'contacto') {
                contactLink = link;
            }
            if (text === 'services' || text === 'serviços' || text === 'servicios') {
                servicesLink = link;
            }
        });

        // Create the blog link
        const blogLink = createBlogLink(contactLink || servicesLink || links[0]);

        // Insert before Contact or after Services
        if (contactLink) {
            contactLink.parentNode.insertBefore(blogLink, contactLink);
            console.log('✅ Blog link added to navbar (before Contact)');
            return true;
        } else if (servicesLink && servicesLink.nextSibling) {
            servicesLink.parentNode.insertBefore(blogLink, servicesLink.nextSibling);
            console.log('✅ Blog link added to navbar (after Services)');
            return true;
        }

        return false;
    }

    function addBlogToMobileMenu() {
        // Find mobile menu (appears when hamburger is clicked)
        const mobileMenus = document.querySelectorAll('[class*="lg:hidden"][class*="glass"]');

        mobileMenus.forEach(menu => {
            // Check if blog already exists
            if (menu.querySelector('a[href="/blog"], a[href="/blog/"]')) return;

            const nav = menu.querySelector('nav');
            if (nav) {
                const links = nav.querySelectorAll('a');
                let contactLink = null;

                links.forEach(link => {
                    const text = link.textContent.trim().toLowerCase();
                    if (text === 'contact' || text === 'contato' || text === 'contacto') {
                        contactLink = link;
                    }
                });

                if (contactLink) {
                    const blogLink = createBlogLink(contactLink);
                    contactLink.parentNode.insertBefore(blogLink, contactLink);
                    console.log('✅ Blog link added to mobile menu');
                }
            }
        });
    }

    function tryAddBlog() {
        return addBlogToDesktopNav();
    }

    function init() {
        let success = tryAddBlog();

        // If not successful, retry
        if (!success) {
            let attempts = 0;
            const maxAttempts = 20;
            const interval = setInterval(() => {
                attempts++;
                success = tryAddBlog();

                // Also try mobile menu each time
                addBlogToMobileMenu();

                if (success || attempts >= maxAttempts) {
                    clearInterval(interval);
                    if (!success && attempts >= maxAttempts) {
                        console.log('⚠️ Could not add Blog link to navbar after', maxAttempts, 'attempts');
                    }
                }
            }, 300);
        }
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Watch for React re-renders that might remove our link
    const observer = new MutationObserver(() => {
        setTimeout(() => {
            tryAddBlog();
            addBlogToMobileMenu();
        }, 100);
    });

    // Start observing after initial load
    setTimeout(() => {
        const root = document.getElementById('root');
        if (root) {
            observer.observe(root, {
                childList: true,
                subtree: true
            });
        }
    }, 2000);
})();
