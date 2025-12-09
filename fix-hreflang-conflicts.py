#!/usr/bin/env python3
"""
Corrige conflitos de hreflang - garantir consistência entre canonical e hreflang
"""

import os
import re

# Páginas que precisam de correção
pages_to_fix = [
    'frontend-production/book.html',
    'frontend-production/contact.html',
    'frontend-production/services.html',
    'frontend-production/guides/deep-cleaning.html',
    'frontend-production/guides/eco-friendly.html',
    'frontend-production/guides/moving.html',
    'frontend-production/johns-creek-house-cleaning/index.html',
    'frontend-production/legal/cancellation-policy.html',
    'frontend-production/legal/privacy-policy.html',
    'frontend-production/legal/terms-of-service.html'
]

def fix_hreflang_conflicts(file_path):
    """Corrige conflitos entre canonical e hreflang URLs"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Extrair o canonical URL
    canonical_match = re.search(r'<link rel="canonical" href="([^"]+)"', content)
    if not canonical_match:
        print(f"⚠️  Canonical não encontrado: {file_path}")
        return False
    
    canonical_url = canonical_match.group(1)
    
    # Garantir que hreflang usa exatamente o mesmo URL que canonical
    # Corrigir hreflang en-us
    content = re.sub(
        r'<link rel="alternate" hreflang="en-us" href="[^"]+"',
        f'<link rel="alternate" hreflang="en-us" href="{canonical_url}"',
        content
    )
    
    # Corrigir hreflang x-default
    content = re.sub(
        r'<link rel="alternate" hreflang="x-default" href="[^"]+"',
        f'<link rel="alternate" hreflang="x-default" href="{canonical_url}"',
        content
    )
    
    # Também garantir que og:url está consistente
    content = re.sub(
        r'<meta property="og:url" content="[^"]+"',
        f'<meta property="og:url" content="{canonical_url}"',
        content
    )
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Corrigido: {file_path} -> {canonical_url}")
        return True
    else:
        print(f"⚠️  Sem mudanças: {file_path}")
        return False

def main():
    print("=" * 60)
    print("CORRIGINDO CONFLITOS DE HREFLANG")
    print("=" * 60)
    print()
    
    fixed_count = 0
    for page in pages_to_fix:
        if os.path.exists(page):
            if fix_hreflang_conflicts(page):
                fixed_count += 1
        else:
            print(f"❌ Arquivo não encontrado: {page}")
    
    print()
    print(f"Total corrigido: {fixed_count}/{len(pages_to_fix)} páginas")

if __name__ == "__main__":
    main()


