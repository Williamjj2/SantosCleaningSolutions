#!/usr/bin/env python3
"""
Corrige erros de structured data nas páginas
"""

import os
import json
import re

# Páginas que precisam de correção
pages_to_fix = [
    'frontend-production/areas/alpharetta/index.html',
    'frontend-production/areas/atlanta/index.html',
    'frontend-production/areas/brookhaven/index.html',
    'frontend-production/areas/buckhead/index.html',
    'frontend-production/areas/druid-hills/index.html',
    'frontend-production/areas/dunwoody/index.html',
    'frontend-production/areas/johns-creek/index.html',
    'frontend-production/areas/marietta/index.html',
    'frontend-production/areas/sandy-springs/index.html',
    'frontend-production/areas/smyrna/index.html',
    'frontend-production/areas/vinings/index.html',
    'frontend-production/dunwoody-house-cleaning/index.html',
    'frontend-production/vinings-house-cleaning/index.html'
]

def fix_structured_data(file_path):
    """Corrige erros no JSON-LD structured data"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 1. Corrigir URLs no JSON-LD para terminar com /
    # Para páginas /areas/xxx/
    if '/areas/' in file_path:
        city = file_path.split('/areas/')[1].split('/')[0]
        # Corrigir URL no LocalBusiness schema
        content = re.sub(
            r'"url": "https://santoscsolutions\.com/areas/' + city + r'"',
            f'"url": "https://santoscsolutions.com/areas/{city}/"',
            content
        )
    
    # Para páginas /xxx-house-cleaning/
    elif '-house-cleaning/' in file_path:
        city = file_path.split('/')[-2]  # dunwoody-house-cleaning ou vinings-house-cleaning
        # Corrigir URL no LocalBusiness schema
        content = re.sub(
            r'"url": "https://santoscsolutions\.com/' + city + r'"',
            f'"url": "https://santoscsolutions.com/{city}/"',
            content
        )
    
    # 2. Adicionar postalCode que está faltando em algumas páginas
    postal_codes = {
        'alpharetta': '30009',
        'atlanta': '30303',
        'brookhaven': '30319',
        'buckhead': '30305',
        'druid-hills': '30306',
        'dunwoody': '30338',
        'johns-creek': '30097',
        'marietta': '30060',
        'sandy-springs': '30328',
        'smyrna': '30080',
        'vinings': '30339'
    }
    
    # Detectar cidade
    city = None
    if '/areas/' in file_path:
        city = file_path.split('/areas/')[1].split('/')[0]
    elif 'dunwoody-house-cleaning' in file_path:
        city = 'dunwoody'
    elif 'vinings-house-cleaning' in file_path:
        city = 'vinings'
    
    if city and city in postal_codes:
        # Adicionar postalCode se não existir
        if '"postalCode"' not in content:
            # Adicionar após addressCountry
            content = re.sub(
                r'("addressCountry": "US")',
                r'\1,\n    "postalCode": "' + postal_codes[city] + '"',
                content
            )
    
    # 3. Corrigir capitalização em areaServed
    content = re.sub(
        r'"name": "([a-z\-]+), GA"',
        lambda m: f'"name": "{m.group(1).replace("-", " ").title()}, GA"',
        content
    )
    
    # 4. Adicionar aggregateRating se não existir (com dados consistentes)
    if '"aggregateRating"' not in content and '"priceRange"' in content:
        # Adicionar após openingHours
        content = re.sub(
            r'("openingHours": "Mo-Fr 08:00-18:00")',
            r'\1,\n  "aggregateRating": {\n    "@type": "AggregateRating",\n    "ratingValue": "4.8",\n    "reviewCount": "22"\n  }',
            content
        )
    
    # 5. Remover vírgulas extras antes de }
    content = re.sub(r',(\s*\})', r'\1', content)
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Corrigido: {file_path}")
        return True
    else:
        print(f"⚠️  Sem mudanças: {file_path}")
        return False

def main():
    print("=" * 60)
    print("CORRIGINDO ERROS DE STRUCTURED DATA")
    print("=" * 60)
    print()
    
    fixed_count = 0
    for page in pages_to_fix:
        if os.path.exists(page):
            if fix_structured_data(page):
                fixed_count += 1
        else:
            print(f"❌ Arquivo não encontrado: {page}")
    
    print()
    print(f"Total corrigido: {fixed_count}/{len(pages_to_fix)} páginas")

if __name__ == "__main__":
    main()


