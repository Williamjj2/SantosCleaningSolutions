#!/usr/bin/env python3
"""
Script para limpar reviews duplicados no Supabase
Mantém apenas o review mais recente de cada grupo de duplicatas
"""

import os
import sys
import asyncio
import httpx
from dotenv import load_dotenv
import json
import hashlib

load_dotenv()

async def clean_duplicates(dry_run=True):
    """
    Remove reviews duplicados mantendo apenas o mais recente
    dry_run=True: apenas mostra o que seria deletado sem deletar
    dry_run=False: deleta realmente
    """
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Erro: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados")
        return 1
    
    print("🔍 Buscando duplicatas no Supabase...")
    if dry_run:
        print("⚠️  MODO DRY-RUN: Nada será deletado, apenas mostrando o que seria feito")
    else:
        print("⚠️  MODO DESTRUTIVO: Reviews serão realmente deletados!")
    print()
    
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            # Buscar todos os reviews ativos
            response = await client.get(
                f"{supabase_url}/rest/v1/google_reviews",
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}"
                },
                params={
                    "select": "id,review_id,author_name,text,rating,review_time,review_timestamp,is_active",
                    "is_active": "eq.true",
                    "order": "review_time.desc"
                }
            )
            
            if response.status_code != 200:
                print(f"❌ Erro ao buscar reviews: {response.status_code}")
                return 1
            
            reviews = response.json()
            total_reviews = len(reviews)
            
            print(f"📊 Total de reviews encontrados: {total_reviews}")
            print()
            
            # Agrupar duplicatas por conteúdo
            content_groups = {}
            
            for review in reviews:
                author = review.get("author_name", "").strip().lower()
                text = review.get("text", "").strip()
                rating = review.get("rating", 0)
                
                # Normalização igual ao script de verificação
                text_normalized = " ".join(text.lower().split())
                # Usar apenas os primeiros 50 caracteres para comparação (como no show-all-reviews)
                # Isso ajuda a detectar duplicatas mesmo com pequenas diferenças no final
                content_key = f"{author}_{rating}_{text_normalized[:50]}"
                
                if content_key not in content_groups:
                    content_groups[content_key] = []
                
                content_groups[content_key].append(review)
            
            # Encontrar grupos com duplicatas (mais de 1 review)
            duplicate_groups = {k: v for k, v in content_groups.items() if len(v) > 1}
            
            if not duplicate_groups:
                print("✅ Nenhuma duplicata encontrada!")
                return 0
            
            print(f"⚠️  Encontrados {len(duplicate_groups)} grupos de duplicatas")
            print()
            
            # Processar cada grupo
            to_delete = []
            to_keep = []
            
            for content_key, group in duplicate_groups.items():
                # Ordenar por review_time (mais recente primeiro)
                def get_sort_key(x):
                    # Priorizar review_timestamp (int), depois review_time (string)
                    timestamp = x.get("review_timestamp")
                    if timestamp is not None:
                        return int(timestamp)
                    time_str = x.get("review_time") or ""
                    # Se for string, tentar converter ou usar timestamp 0
                    return 0 if not time_str else 0
                
                group_sorted = sorted(
                    group,
                    key=get_sort_key,
                    reverse=True
                )
                
                # Manter o mais recente
                keep = group_sorted[0]
                to_keep.append(keep)
                
                # Marcar os outros para deletar
                for dup in group_sorted[1:]:
                    to_delete.append(dup)
                
                # Mostrar informações
                print(f"📋 Grupo: {group_sorted[0].get('author_name')} - {group_sorted[0].get('rating')}⭐")
                print(f"   Texto: {group_sorted[0].get('text', '')[:60]}...")
                print(f"   Total no grupo: {len(group_sorted)}")
                print(f"   ✅ Manter: ID {keep['id']} (review_id: {keep.get('review_id', 'N/A')})")
                for dup in group_sorted[1:]:
                    print(f"   ❌ Deletar: ID {dup['id']} (review_id: {dup.get('review_id', 'N/A')})")
                print()
            
            print("=" * 60)
            print(f"RESUMO:")
            print(f"   Total de reviews: {total_reviews}")
            print(f"   Grupos de duplicatas: {len(duplicate_groups)}")
            print(f"   Reviews a manter: {len(to_keep)}")
            print(f"   Reviews a deletar: {len(to_delete)}")
            print("=" * 60)
            print()
            
            if not to_delete:
                print("✅ Nada para deletar!")
                return 0
            
            if dry_run:
                print("⚠️  MODO DRY-RUN: Nada foi deletado.")
                print("   Execute com --execute para realmente deletar")
                return 0
            
            # Confirmar antes de deletar
            print("⚠️  ATENÇÃO: Você está prestes a deletar reviews permanentemente!")
            print(f"   {len(to_delete)} reviews serão deletados")
            response = input("   Digite 'CONFIRMAR' para continuar: ")
            
            if response != "CONFIRMAR":
                print("❌ Operação cancelada")
                return 1
            
            # Deletar duplicatas
            deleted_count = 0
            error_count = 0
            
            print()
            print("🗑️  Deletando duplicatas...")
            
            for dup in to_delete:
                try:
                    delete_response = await client.delete(
                        f"{supabase_url}/rest/v1/google_reviews?id=eq.{dup['id']}",
                        headers={
                            "apikey": supabase_key,
                            "Authorization": f"Bearer {supabase_key}"
                        }
                    )
                    
                    if delete_response.status_code in [200, 204]:
                        deleted_count += 1
                        print(f"   ✅ Deletado ID {dup['id']}")
                    else:
                        error_count += 1
                        print(f"   ❌ Erro ao deletar ID {dup['id']}: {delete_response.status_code}")
                
                except Exception as e:
                    error_count += 1
                    print(f"   ❌ Erro ao deletar ID {dup['id']}: {str(e)}")
            
            print()
            print("=" * 60)
            print("RESULTADO:")
            print(f"   ✅ Deletados com sucesso: {deleted_count}")
            if error_count > 0:
                print(f"   ❌ Erros: {error_count}")
            print("=" * 60)
            
            return 0 if error_count == 0 else 1
            
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    dry_run = "--execute" not in sys.argv
    
    if not dry_run:
        print("⚠️  MODO DESTRUTIVO ATIVADO!")
        print("   Reviews serão realmente deletados do Supabase")
        print()
    
    exit_code = asyncio.run(clean_duplicates(dry_run=dry_run))
    sys.exit(exit_code)

