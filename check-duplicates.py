#!/usr/bin/env python3
"""
Script para verificar reviews duplicados no Supabase
Pode ser executado diretamente ou via API
"""

import os
import sys
import asyncio
import httpx
from dotenv import load_dotenv
import json

load_dotenv()

async def check_duplicates():
    """Verifica duplicatas no Supabase"""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Erro: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados")
        print("   Configure no arquivo .env")
        return
    
    print("🔍 Verificando duplicatas no Supabase...")
    print(f"   URL: {supabase_url}")
    print()
    
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            # Buscar todos os reviews
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
                print(f"   Resposta: {response.text}")
                return
            
            reviews = response.json()
            total_reviews = len(reviews)
            
            print(f"📊 Total de reviews ativos: {total_reviews}")
            print()
            
            # Verificar duplicatas por review_id
            review_ids_dict = {}
            duplicates_by_id = []
            
            for review in reviews:
                review_id = review.get("review_id")
                if review_id:
                    if review_id in review_ids_dict:
                        existing = review_ids_dict[review_id]
                        duplicates_by_id.append({
                            "review_id": review_id,
                            "author": review.get("author_name"),
                            "rating": review.get("rating"),
                            "duplicate_1_id": existing["id"],
                            "duplicate_1_time": existing.get("review_time"),
                            "duplicate_2_id": review["id"],
                            "duplicate_2_time": review.get("review_time")
                        })
                    else:
                        review_ids_dict[review_id] = review
            
            # Verificar duplicatas por conteúdo
            import hashlib
            content_hashes = {}
            duplicates_by_content = []
            
            for review in reviews:
                author = review.get("author_name", "").strip().lower()
                text = review.get("text", "").strip()
                rating = review.get("rating", 0)
                
                text_normalized = " ".join(text.lower().split())
                text_hash = hashlib.md5(text_normalized.encode()).hexdigest()[:12]
                content_key = f"{author}_{rating}_{text_hash}"
                
                if content_key in content_hashes:
                    existing = content_hashes[content_key]
                    if text_normalized == existing["text_normalized"]:
                        duplicates_by_content.append({
                            "author": review.get("author_name"),
                            "rating": rating,
                            "text_preview": text[:80] + "..." if len(text) > 80 else text,
                            "duplicate_1_id": existing["id"],
                            "duplicate_1_review_id": existing.get("review_id"),
                            "duplicate_2_id": review["id"],
                            "duplicate_2_review_id": review.get("review_id")
                        })
                else:
                    content_hashes[content_key] = {
                        "id": review["id"],
                        "review_id": review.get("review_id"),
                        "text_normalized": text_normalized
                    }
            
            # Exibir resultados
            print("=" * 60)
            print("RESULTADOS DA VERIFICAÇÃO")
            print("=" * 60)
            print()
            print(f"📊 Estatísticas:")
            print(f"   Total de reviews: {total_reviews}")
            print(f"   Únicos por review_id: {len(review_ids_dict)}")
            print(f"   Únicos por conteúdo: {len(content_hashes)}")
            print()
            
            if duplicates_by_id:
                print(f"⚠️  DUPLICADOS POR REVIEW_ID: {len(duplicates_by_id)}")
                print("-" * 60)
                for i, dup in enumerate(duplicates_by_id[:10], 1):  # Mostrar apenas os 10 primeiros
                    print(f"\n{i}. Review ID: {dup['review_id']}")
                    print(f"   Autor: {dup['author']}")
                    print(f"   Rating: {dup['rating']}⭐")
                    print(f"   Duplicata 1 - ID: {dup['duplicate_1_id']}, Time: {dup['duplicate_1_time']}")
                    print(f"   Duplicata 2 - ID: {dup['duplicate_2_id']}, Time: {dup['duplicate_2_time']}")
                if len(duplicates_by_id) > 10:
                    print(f"\n   ... e mais {len(duplicates_by_id) - 10} duplicatas")
                print()
            else:
                print("✅ Nenhuma duplicata encontrada por review_id")
                print()
            
            if duplicates_by_content:
                print(f"⚠️  DUPLICADOS POR CONTEÚDO: {len(duplicates_by_content)}")
                print("-" * 60)
                for i, dup in enumerate(duplicates_by_content[:10], 1):
                    print(f"\n{i}. Autor: {dup['author']}")
                    print(f"   Rating: {dup['rating']}⭐")
                    print(f"   Texto: {dup['text_preview']}")
                    print(f"   Duplicata 1 - ID: {dup['duplicate_1_id']}, Review ID: {dup['duplicate_1_review_id']}")
                    print(f"   Duplicata 2 - ID: {dup['duplicate_2_id']}, Review ID: {dup['duplicate_2_review_id']}")
                if len(duplicates_by_content) > 10:
                    print(f"\n   ... e mais {len(duplicates_by_content) - 10} duplicatas")
                print()
            else:
                print("✅ Nenhuma duplicata encontrada por conteúdo")
                print()
            
            # Salvar resultados em arquivo JSON
            results = {
                "summary": {
                    "total_reviews": total_reviews,
                    "unique_by_review_id": len(review_ids_dict),
                    "unique_by_content": len(content_hashes),
                    "duplicates_by_review_id": len(duplicates_by_id),
                    "duplicates_by_content": len(duplicates_by_content)
                },
                "duplicates_by_review_id": duplicates_by_id,
                "duplicates_by_content": duplicates_by_content
            }
            
            with open("duplicates-report.json", "w", encoding="utf-8") as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
            
            print("💾 Resultados salvos em: duplicates-report.json")
            print()
            
            if duplicates_by_id or duplicates_by_content:
                print("⚠️  RECOMENDAÇÃO:")
                print("   Existem duplicatas no banco. Considere:")
                print("   1. Verificar o arquivo duplicates-report.json para detalhes")
                print("   2. Limpar duplicatas mantendo apenas o mais recente")
                print("   3. Verificar a lógica de geração de review_id no webhook")
                return 1
            else:
                print("✅ Nenhuma duplicata encontrada!")
                return 0
                
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(check_duplicates())
    sys.exit(exit_code)




