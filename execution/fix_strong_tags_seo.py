#!/usr/bin/env python3
"""
Fix strong/bold tag SEO issues identified in Seobility crawl (92% → 95%+ target).

P2a: Blogs residenciais com muitas tags <strong> → converte para <span style="font-weight:600">
P2b: Blogs commercial com <strong> muito longos em Related Articles → remove wrapper
P2c: Woodstock e Duluth (many + too long + duplicate) → converte para <span>
"""

import os
import re

BASE = "/Users/williamjesus/Site Oficial/SantosCleaningSolutions/dist/public"

# ─── P2a + P2c: Converter TODAS as <strong> para <span style="font-weight:600"> ─────
# (resolve: many tags, too long, duplicate)
convert_targets = [
    # P2a — residenciais com >10 strong tags
    "blog/deep-cleaning-suwanee-homeowners/index.html",          # 45 tags
    "blog/move-out-cleaning-brookhaven-apartments/index.html",   # 30 tags
    "blog/deep-cleaning-checklist-roswell-homeowners/index.html",# 16 tags
    "blog/pet-friendly-cleaning-brookhaven/index.html",          # 12 tags
    "blog/milton-kitchen-cleaning/index.html",                   # 12 tags
    "blog/post-construction-cleaning-decatur-new-builds/index.html", # 11 tags
    "blog/post-construction-cleaning-dunwoody/index.html",       # 11 tags
    "blog/allergy-proof-decatur-home/index.html",                # 10 tags
    "blog/commercial/index.html",                                # unknown

    # P2c — many + too long + duplicate
    "blog/woodstock-window-cleaning-guide-2026/index.html",
    "blog/duluth-carpet-cleaning-guide-2026/index.html",
]

# ─── P2b: Remover <strong> wrapper dos títulos de Related Articles (too long) ────
# Apenas nos 4 blogs commercial — substitui os títulos específicos
commercial_long_strongs = [
    (
        '<strong>Office Cleaning Cost in Atlanta: 2026 Pricing Guide by Square Footage</strong>',
        'Office Cleaning Cost in Atlanta: 2026 Pricing Guide by Square Footage'
    ),
    (
        '<strong>How to Choose a Commercial Cleaning Company: 12-Point Checklist</strong>',
        'How to Choose a Commercial Cleaning Company: 12-Point Checklist'
    ),
    (
        '<strong>Green Cleaning for Schools: Protecting Kids Without Harsh Chemicals</strong>',
        'Green Cleaning for Schools: Protecting Kids Without Harsh Chemicals'
    ),
    (
        '<strong>HIPAA-Aware Medical Office Cleaning: A Complete Guide</strong>',
        'HIPAA-Aware Medical Office Cleaning: A Complete Guide'
    ),
    (
        '<strong>Commercial Cleaning Insurance Explained: What You Need to Know</strong>',
        'Commercial Cleaning Insurance Explained: What You Need to Know'
    ),
    (
        '<strong>How to Choose a Commercial Cleaning Company</strong>',
        'How to Choose a Commercial Cleaning Company'
    ),
]

commercial_targets = [
    "blog/commercial/hipaa-compliant-medical-office-cleaning-guide/index.html",
    "blog/commercial/how-to-choose-commercial-cleaning-company-checklist/index.html",
    "blog/commercial/green-cleaning-schools-atlanta/index.html",
    "blog/commercial/commercial-cleaning-insurance-explained/index.html",
]


def convert_strong_to_span(content):
    """Converte <strong> → <span style="font-weight:600"> e </strong> → </span>.
    Opera somente no conteúdo após <body — seguro para JSON-LD e head.
    """
    # Split on <body para tratar head e body separadamente
    body_split = re.split(r'(<body[^>]*>)', content, maxsplit=1, flags=re.IGNORECASE)
    if len(body_split) < 3:
        # Fallback: substituição global (safe porque blogs não têm <strong> em JSON)
        new = content.replace('<strong>', '<span style="font-weight:600">')
        new = new.replace('</strong>', '</span>')
        return new

    head_part = body_split[0] + body_split[1]  # antes do <body> inclusive
    body_part = body_split[2]

    # Substituir apenas no body
    body_part = body_part.replace('<strong>', '<span style="font-weight:600">')
    body_part = body_part.replace('</strong>', '</span>')

    return head_part + body_part


def apply_commercial_fixes(content):
    """Remove <strong> wrapper de títulos longos em Related Articles."""
    for old, new in commercial_long_strongs:
        content = content.replace(old, new)
    return content


# ─── Executar P2a + P2c ───────────────────────────────────────────────────────
print("\n=== P2a + P2c: Convertendo <strong> → <span style=\"font-weight:600\"> ===")
for rel_path in convert_targets:
    full_path = os.path.join(BASE, rel_path)
    if not os.path.exists(full_path):
        print(f"  ⚠️  NÃO ENCONTRADO: {rel_path}")
        continue

    with open(full_path, 'r', encoding='utf-8') as f:
        original = f.read()

    count_before = original.count('<strong>')
    new_content = convert_strong_to_span(original)
    count_after = new_content.count('<strong>')

    if original != new_content:
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  ✅ {rel_path}: {count_before} strong → {count_after} (span)")
    else:
        print(f"  — {rel_path}: sem mudanças ({count_before} strong)")


# ─── Executar P2b ─────────────────────────────────────────────────────────────
print("\n=== P2b: Removendo <strong> wrappers longos dos blogs commercial ===")
for rel_path in commercial_targets:
    full_path = os.path.join(BASE, rel_path)
    if not os.path.exists(full_path):
        print(f"  ⚠️  NÃO ENCONTRADO: {rel_path}")
        continue

    with open(full_path, 'r', encoding='utf-8') as f:
        original = f.read()

    new_content = apply_commercial_fixes(original)

    if original != new_content:
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  ✅ {rel_path}: long strongs removidos")
    else:
        print(f"  — {rel_path}: nenhum long strong encontrado")


# ─── Verificação final ────────────────────────────────────────────────────────
print("\n=== Verificação: contagem de <strong> pós-fix ===")
all_targets = list(set(convert_targets + commercial_targets))
for rel_path in sorted(all_targets):
    full_path = os.path.join(BASE, rel_path)
    if not os.path.exists(full_path):
        continue
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    count = content.count('<strong>')
    flag = " ⚠️ AINDA ALTO" if count > 5 else " ✅"
    print(f"  {count:3d} strong | {rel_path}{flag}")

print("\nConcluído.")
