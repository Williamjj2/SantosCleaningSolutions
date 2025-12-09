#!/usr/bin/env python3
"""
Script para mostrar todos os reviews do Supabase de forma detalhada
"""

import os
import sys
import asyncio
import httpx
from dotenv import load_dotenv
import json
from datetime import datetime

load_dotenv()

async def show_all_reviews():
    """Mostra todos os reviews do Supabase"""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Erro: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados")
        return 1
    
    print("🔍 Buscando todos os reviews do Supabase...")
    print(f"   URL: {supabase_url}")
    print()
    
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            # Buscar TODOS os reviews (ativos e inativos)
            response = await client.get(
                f"{supabase_url}/rest/v1/google_reviews",
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}"
                },
                params={
                    "select": "*",
                    "order": "review_time.desc"
                }
            )
            
            if response.status_code != 200:
                print(f"❌ Erro ao buscar reviews: {response.status_code}")
                print(f"   Resposta: {response.text}")
                return 1
            
            reviews = response.json()
            total_reviews = len(reviews)
            
            print("=" * 80)
            print(f"TOTAL DE REVIEWS NO SUPABASE: {total_reviews}")
            print("=" * 80)
            print()
            
            # Separar por status
            active_reviews = [r for r in reviews if r.get("is_active", True)]
            inactive_reviews = [r for r in reviews if not r.get("is_active", True)]
            
            print(f"📊 Reviews Ativos: {len(active_reviews)}")
            print(f"📊 Reviews Inativos: {len(inactive_reviews)}")
            print()
            
            # Mostrar todos os reviews ativos
            print("=" * 80)
            print("REVIEWS ATIVOS (os que aparecem no site):")
            print("=" * 80)
            print()
            
            for i, review in enumerate(active_reviews, 1):
                print(f"{i}. ID: {review.get('id')}")
                print(f"   Review ID: {review.get('review_id', 'N/A')}")
                print(f"   Autor: {review.get('author_name', 'N/A')}")
                print(f"   Rating: {review.get('rating', 'N/A')}⭐")
                print(f"   Data: {review.get('review_time', 'N/A')}")
                print(f"   Timestamp: {review.get('review_timestamp', 'N/A')}")
                text = review.get('text', '')
                text_preview = text[:100] + "..." if len(text) > 100 else text
                print(f"   Texto: {text_preview}")
                print(f"   Ativo: {review.get('is_active', True)}")
                print()
            
            # Verificar duplicatas por conteúdo
            print("=" * 80)
            print("VERIFICAÇÃO DE DUPLICATAS POR CONTEÚDO:")
            print("=" * 80)
            print()
            
            import hashlib
            content_map = {}
            
            for review in active_reviews:
                author = review.get("author_name", "").strip().lower()
                text = review.get("text", "").strip()
                rating = review.get("rating", 0)
                
                text_normalized = " ".join(text.lower().split())
                content_key = f"{author}_{rating}_{text_normalized[:50]}"
                
                if content_key not in content_map:
                    content_map[content_key] = []
                
                content_map[content_key].append(review)
            
            duplicates_found = False
            for content_key, group in content_map.items():
                if len(group) > 1:
                    duplicates_found = True
                    print(f"⚠️  DUPLICATA ENCONTRADA:")
                    print(f"   Autor: {group[0].get('author_name')}")
                    print(f"   Rating: {group[0].get('rating')}⭐")
                    print(f"   Texto: {group[0].get('text', '')[:60]}...")
                    print(f"   Reviews no grupo: {len(group)}")
                    for dup in group:
                        print(f"      - ID: {dup.get('id')}, Review ID: {dup.get('review_id', 'N/A')}, Time: {dup.get('review_time', 'N/A')}")
                    print()
            
            if not duplicates_found:
                print("✅ Nenhuma duplicata encontrada por conteúdo!")
                print()
            
            # Verificar duplicatas por review_id
            print("=" * 80)
            print("VERIFICAÇÃO DE DUPLICATAS POR REVIEW_ID:")
            print("=" * 80)
            print()
            
            review_id_map = {}
            for review in active_reviews:
                review_id = review.get("review_id")
                if review_id:
                    if review_id not in review_id_map:
                        review_id_map[review_id] = []
                    review_id_map[review_id].append(review)
            
            duplicates_by_id = False
            for review_id, group in review_id_map.items():
                if len(group) > 1:
                    duplicates_by_id = True
                    print(f"⚠️  DUPLICATA POR REVIEW_ID: {review_id}")
                    for dup in group:
                        print(f"      - ID: {dup.get('id')}, Autor: {dup.get('author_name')}, Time: {dup.get('review_time', 'N/A')}")
                    print()
            
            if not duplicates_by_id:
                print("✅ Nenhuma duplicata encontrada por review_id!")
                print()
            
            # Salvar em arquivo JSON
            output = {
                "total": total_reviews,
                "active": len(active_reviews),
                "inactive": len(inactive_reviews),
                "reviews": reviews
            }
            
            with open("all-reviews-supabase.json", "w", encoding="utf-8") as f:
                json.dump(output, f, indent=2, ensure_ascii=False, default=str)
            
            print("💾 Todos os reviews salvos em: all-reviews-supabase.json")
            print()
            
            return 0
            
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(show_all_reviews())
    sys.exit(exit_code)




