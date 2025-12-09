from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import os
import uuid
import httpx
import base64
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Santos Cleaning Solutions API")

ALLOWED_ORIGINS = [
    "https://santoscsolutions.com",
    "https://www.santoscsolutions.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection with short timeout (won't block if MongoDB is down)
client = AsyncIOMotorClient(
    os.getenv("MONGO_URL", "mongodb://localhost:27017"),
    serverSelectionTimeoutMS=2000,  # 2 seconds timeout
    connectTimeoutMS=2000,
    socketTimeoutMS=2000
)
db = client.santos_cleaning

# Security
security = HTTPBearer()

# Pydantic models
class ContactRequest(BaseModel):
    name: str
    phone: str
    email: EmailStr
    message: Optional[str] = ""
    sms_consent: bool
    language: str = "en"
    source: str = "website"

class ServiceBooking(BaseModel):
    customer_name: str
    email: EmailStr
    phone: str
    service_type: str
    preferred_date: str
    preferred_time: str
    address: str
    special_instructions: Optional[str] = ""
    estimated_price: Optional[float] = None

class Review(BaseModel):
    author_name: str
    rating: int
    text: str
    service_type: Optional[str] = None
    verified: bool = False

class ReviewWebhook(BaseModel):
    """Modelo para receber reviews do n8n webhook - mantém compatibilidade total"""
    action: str
    timestamp: str
    business_name: str
    total_reviews: int
    average_rating: float
    user_ratings_total: int
    reviews: List[dict]

class ServiceType(BaseModel):
    name: str
    description: str
    base_price: float
    duration_hours: int
    includes: List[str]
    active: bool = True

# Pydantic models para leads
class LeadUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    assigned_to: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Santos Cleaning Solutions API"}

@app.get("/api/health")
async def health_check():
    try:
        # Test database connection (optional, won't fail if MongoDB is down)
        await db.command("ping")
        return {"status": "healthy", "database": "connected", "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        # MongoDB down, but API still works for Supabase endpoints
        return {"status": "healthy", "database": "disconnected", "message": "MongoDB offline, Supabase endpoints operational", "timestamp": datetime.utcnow().isoformat()}

# Contact form submission
@app.post("/api/contact")
async def submit_contact(contact: ContactRequest):
    try:
        # Dados do lead
        lead_data = {
            "name": contact.name,
            "phone": contact.phone,
            "email": contact.email,
            "message": contact.message or "",
            "sms_consent": contact.sms_consent,
            "language": contact.language,
            "source": contact.source,
            "status": "new"
        }
        
        # Tentar salvar no Supabase primeiro
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if supabase_url and supabase_key:
            async with httpx.AsyncClient() as client:
                try:
                    # Inserir lead no Supabase
                    supabase_response = await client.post(
                        f"{supabase_url}/rest/v1/leads",
                        headers={
                            "apikey": supabase_key,
                            "Authorization": f"Bearer {supabase_key}",
                            "Content-Type": "application/json",
                            "Prefer": "return=representation"
                        },
                        json=lead_data
                    )
                    
                    if supabase_response.status_code in [200, 201]:
                        supabase_data = supabase_response.json()
                        lead_id = supabase_data[0]["id"] if supabase_data else str(uuid.uuid4())
                        print(f"✅ Lead salvo no Supabase: {contact.name} - {contact.email}")
                    else:
                        print(f"❌ Erro Supabase: {supabase_response.status_code} - {supabase_response.text}")
                        raise Exception("Supabase error")
                        
                except Exception as supabase_error:
                    print(f"❌ Erro conectando ao Supabase: {str(supabase_error)}")
                    # Fallback para MongoDB
                    contact_data = {
                        **contact.dict(),
                        "id": str(uuid.uuid4()),
                        "created_at": datetime.utcnow(),
                        "status": "new",
                        "user_agent": "",
                        "ip_address": ""
                    }
                    result = await db.contacts.insert_one(contact_data)
                    lead_id = contact_data["id"]
                    print(f"⚠️ Fallback MongoDB: Lead salvo - {contact.name}")
        else:
            print("❌ Supabase não configurado, usando MongoDB")
            # Fallback para MongoDB se Supabase não configurado
            contact_data = {
                **contact.dict(),
                "id": str(uuid.uuid4()),
                "created_at": datetime.utcnow(),
                "status": "new",
                "user_agent": "",
                "ip_address": ""
            }
            result = await db.contacts.insert_one(contact_data)
            lead_id = contact_data["id"]
        
        # TODO: Enviar notificação por email/SMS/webhook
        print(f"📬 Novo lead recebido: {contact.name} ({contact.email}) - Fonte: {contact.source}")
        
        return {
            "success": True,
            "message": "Contact request submitted successfully",
            "id": lead_id
        }
    except Exception as e:
        print(f"❌ Erro geral ao salvar lead: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to submit contact: {str(e)}")

# Get reviews from Supabase
@app.get("/api/reviews")
async def get_reviews():
    """
    Busca reviews do Supabase para exibir no frontend
    Mantém compatibilidade total com frontend existente
    """
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            print("⚠️ Supabase não configurado, retornando reviews padrão")
            return {
                "reviews": []
            }
        
        async with httpx.AsyncClient(timeout=10) as client:
            # Buscar reviews do Supabase ordenados por data
            response = await client.get(
                f"{supabase_url}/rest/v1/google_reviews",
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}"
                },
                params={
                    "select": "author_name,rating,text,relative_time_description,profile_photo_url,review_time,review_id",
                    "order": "review_time.desc",
                    "limit": "100",  # Buscar mais para filtrar duplicatas
                    "is_active": "eq.true"
                }
            )
            
            if response.status_code == 200:
                supabase_reviews = response.json()
                
                if supabase_reviews:
                    print(f"✅ {len(supabase_reviews)} reviews carregados do Supabase")
                    
                    # Deduplicação: remover reviews duplicados
                    import hashlib
                    seen_review_ids = set()
                    seen_content = set()
                    unique_reviews = []
                    
                    for review in supabase_reviews:
                        # Primeiro, verificar por review_id (mais confiável)
                        review_id = review.get("review_id")
                        if review_id and review_id in seen_review_ids:
                            continue  # Pular duplicata por review_id
                        
                        # Se não tem review_id ou é único, verificar por conteúdo
                        author = review.get("author_name", "").strip().lower()
                        text = review.get("text", "").strip()
                        rating = review.get("rating", 0)
                        
                        # Normalizar texto para comparação
                        text_normalized = " ".join(text.lower().split())
                        content_hash = hashlib.md5(f"{author}_{rating}_{text_normalized}".encode()).hexdigest()
                        
                        if content_hash in seen_content:
                            continue  # Pular duplicata por conteúdo
                        
                        # É único, adicionar
                        if review_id:
                            seen_review_ids.add(review_id)
                        seen_content.add(content_hash)
                        unique_reviews.append(review)
                    
                    if len(supabase_reviews) != len(unique_reviews):
                        print(f"⚠️ Removidos {len(supabase_reviews) - len(unique_reviews)} reviews duplicados")
                    
                    # Limitar a 50 reviews únicos
                    unique_reviews = unique_reviews[:50]
                    
                    # Formatar reviews para o frontend
                    formatted_reviews = []
                    for review in unique_reviews:
                        formatted_reviews.append({
                            "author_name": review.get("author_name", "Anonymous"),
                            "rating": review.get("rating", 5),
                            "text": review.get("text", ""),
                            "relative_time_description": review.get("relative_time_description", "Recently"),
                            "profile_photo_url": review.get("profile_photo_url") or f"https://ui-avatars.com/api/?name={review.get('author_name', 'User').replace(' ', '+')}&background=4285F4&color=fff&size=128&font-size=0.6&bold=true"
                        })
                    
                    return {"reviews": formatted_reviews}
                else:
                    print("⚠️ Nenhum review encontrado no Supabase, retornando dados padrão")
            else:
                print(f"❌ Erro ao buscar reviews do Supabase: {response.status_code}")
                print(f"❌ Resposta: {response.text}")
        
        # Fallback para reviews padrão
        return {
            "reviews": []
        }
        
    except Exception as e:
        print(f"❌ Erro crítico ao buscar reviews: {str(e)}")
        # Fallback seguro
        return {
            "reviews": []
        }

# Get reviews statistics for the dashboard panel
@app.get("/api/reviews/stats")
async def get_reviews_stats():
    """
    Calcula estatísticas dos reviews para o painel dinâmico
    Retorna média, total de reviews, distribuição de estrelas, etc.
    """
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            print("⚠️ Supabase não configurado, retornando stats padrão")
            return {
                "average_rating": 4.8,
                "total_reviews": 47,
                "rating_distribution": {"5": 40, "4": 5, "3": 1, "2": 1, "1": 0},
                "last_updated": datetime.utcnow().isoformat()
            }
        
        async with httpx.AsyncClient(timeout=10) as client:
            # Buscar todos os reviews para calcular estatísticas
            response = await client.get(
                f"{supabase_url}/rest/v1/google_reviews",
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}"
                },
                params={
                    "select": "rating,review_time",
                    "is_active": "eq.true"
                }
            )
            
            if response.status_code == 200:
                all_reviews = response.json()
                
                if all_reviews:
                    # Calcular estatísticas
                    total_reviews = len(all_reviews)
                    ratings = [review.get("rating", 5) for review in all_reviews if review.get("rating")]
                    
                    if ratings:
                        average_rating = round(sum(ratings) / len(ratings), 1)
                        
                        # Distribuição de estrelas
                        rating_distribution = {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}
                        for rating in ratings:
                            rating_key = str(rating)
                            if rating_key in rating_distribution:
                                rating_distribution[rating_key] += 1
                        
                        # Encontrar o review mais recente
                        latest_review_time = max([review.get("review_time", "") for review in all_reviews], default="")
                        
                        stats = {
                            "average_rating": average_rating,
                            "total_reviews": total_reviews,
                            "rating_distribution": rating_distribution,
                            "latest_review_time": latest_review_time,
                            "last_updated": datetime.utcnow().isoformat(),
                            "source": "supabase"
                        }
                        
                        print(f"✅ Stats calculados: {average_rating}⭐ ({total_reviews} reviews)")
                        return stats
                    else:
                        print("⚠️ Nenhum rating válido encontrado")
                else:
                    print("⚠️ Nenhum review encontrado para calcular stats")
            else:
                print(f"❌ Erro ao buscar reviews para stats: {response.status_code}")
        
        # Fallback para stats padrão
        return {
            "average_rating": 4.8,
            "total_reviews": 47,
            "rating_distribution": {"5": 40, "4": 5, "3": 1, "2": 1, "1": 0},
            "last_updated": datetime.utcnow().isoformat(),
            "source": "fallback"
        }
        
    except Exception as e:
        print(f"❌ Erro crítico ao calcular stats: {str(e)}")
        # Fallback seguro
        return {
            "average_rating": 4.8,
            "total_reviews": 47,
            "rating_distribution": {"5": 40, "4": 5, "3": 1, "2": 1, "1": 0},
            "last_updated": datetime.utcnow().isoformat(),
            "source": "error_fallback"
        }

# Service types
@app.get("/api/services")
async def get_services():
    try:
        services = await db.service_types.find({"active": True}, {"_id": 0}).to_list(length=None)
        return {"services": services}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching services: {str(e)}")

# Book a service
@app.post("/api/bookings")
async def create_booking(booking: ServiceBooking):
    try:
        booking_data = {
            **booking.dict(),
            "id": str(uuid.uuid4()),
            "created_at": datetime.utcnow(),
            "status": "pending",
            "confirmation_sent": False
        }
        
        result = await db.bookings.insert_one(booking_data)
        
        return {
            "success": True,
            "message": "Booking request submitted successfully",
            "booking_id": booking_data["id"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create booking: {str(e)}")

# Add a review
@app.post("/api/reviews")
async def add_review(review: Review):
    try:
        review_data = {
            **review.dict(),
            "id": str(uuid.uuid4()),
            "created_at": datetime.utcnow(),
            "approved": False  # Requires admin approval
        }
        
        result = await db.reviews.insert_one(review_data)
        
        return {
            "success": True,
            "message": "Review submitted for approval",
            "id": review_data["id"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit review: {str(e)}")

# Webhook para receber reviews do n8n - NOVA FUNCIONALIDADE
@app.post("/api/webhook/reviews-update")
async def receive_reviews_webhook(webhook_data: ReviewWebhook):
    """
    Recebe reviews do n8n e salva no Supabase
    Mantém 100% de compatibilidade com sistema existente
    """
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        print(f"🔔 Webhook recebido: {webhook_data.total_reviews} reviews de {webhook_data.business_name}")
        print(f"⭐ Rating médio: {webhook_data.average_rating}")
        
        if not supabase_url or not supabase_key:
            print("⚠️ Supabase não configurado, retornando sucesso sem salvar")
            return {
                "success": True,
                "message": "Reviews recebidos (Supabase não configurado)",
                "reviews_count": webhook_data.total_reviews,
                "average_rating": webhook_data.average_rating
            }
        
        reviews_saved = 0
        reviews_skipped = 0
        reviews_errors = 0
        
        async with httpx.AsyncClient(timeout=30) as client:
            for review in webhook_data.reviews:
                try:
                    # Gerar ID único e consistente
                    import re
                    import hashlib
                    
                    author_clean = review.get('author_name', 'anonymous').strip().lower()
                    author_clean = re.sub(r'[^a-z0-9_]+', '_', author_clean)  # Normalizar caracteres
                    review_timestamp = review.get('review_time', webhook_data.timestamp)
                    
                    # Converter timestamp para segundos Unix (arredondar para evitar variações)
                    try:
                        dt = datetime.fromisoformat(review_timestamp.replace('Z', '+00:00'))
                        # Arredondar para o minuto mais próximo para evitar duplicatas por segundos
                        timestamp_seconds = int(dt.replace(second=0, microsecond=0).timestamp())
                    except:
                        timestamp_seconds = int(datetime.now().replace(second=0, microsecond=0).timestamp())
                    
                    # Usar hash do texto também para garantir unicidade
                    text_normalized = " ".join(review.get('text', '').strip().lower().split())
                    text_hash = hashlib.md5(text_normalized.encode()).hexdigest()[:8]
                    review_id = f"gp_{author_clean}_{timestamp_seconds}_{text_hash}"
                    
                    # Verificar se review já existe por review_id
                    check_by_id_response = await client.get(
                        f"{supabase_url}/rest/v1/google_reviews",
                        headers={
                            "apikey": supabase_key,
                            "Authorization": f"Bearer {supabase_key}"
                        },
                        params={
                            "select": "review_id",
                            "review_id": f"eq.{review_id}",
                            "limit": "1"
                        }
                    )
                    
                    if check_by_id_response.status_code == 200 and len(check_by_id_response.json()) > 0:
                        reviews_skipped += 1
                        print(f"⏭️ Review já existe (por review_id): {review_id}")
                        continue
                    
                    # Verificar também por conteúdo (autor + texto + rating) para evitar duplicatas
                    # mesmo com review_id diferente
                    author = review.get('author_name', '').strip().lower()
                    text = review.get('text', '').strip()
                    rating = review.get('rating', 0)
                    
                    # Buscar reviews com mesmo autor e rating
                    check_by_content_response = await client.get(
                        f"{supabase_url}/rest/v1/google_reviews",
                        headers={
                            "apikey": supabase_key,
                            "Authorization": f"Bearer {supabase_key}"
                        },
                        params={
                            "select": "id,author_name,text,rating",
                            "author_name": f"ilike.{author}",
                            "rating": f"eq.{rating}",
                            "is_active": "eq.true",
                            "limit": "10"
                        }
                    )
                    
                    if check_by_content_response.status_code == 200:
                        existing_reviews = check_by_content_response.json()
                        text_normalized_new = " ".join(text.lower().split())
                        
                        is_duplicate = False
                        for existing in existing_reviews:
                            existing_text = existing.get('text', '').strip()
                            existing_text_normalized = " ".join(existing_text.lower().split())
                            
                            # Comparar textos normalizados (ignorar diferenças de espaços)
                            if existing_text_normalized == text_normalized_new:
                                is_duplicate = True
                                reviews_skipped += 1
                                print(f"⏭️ Review já existe (por conteúdo): {author} - ID {existing.get('id')}")
                                break
                        
                        if is_duplicate:
                            continue
                    
                    # Preparar dados para Supabase - compatível com estrutura existente
                    review_data = {
                        "review_id": review_id,
                        "author_name": review.get("author_name", "Cliente Anônimo")[:255],
                        "author_url": review.get("author_url"),
                        "language": review.get("language", "pt")[:10],
                        "profile_photo_url": review.get("profile_photo_url") or f"https://ui-avatars.com/api/?name={review.get('author_name', 'Cliente')}&background=4285F4&color=fff&size=128",
                        "rating": max(1, min(5, review.get("rating", 5))),  # Garantir range 1-5
                        "relative_time_description": review.get("relative_time_description", "Recente")[:100],
                        "text": review.get("text", "")[:5000],
                        "review_time": review.get("review_time"),
                        "review_timestamp": timestamp_seconds,
                        "translated": review.get("translated", False),
                        "original_language": review.get("original_language", review.get("language", "pt"))[:10],
                        "original_text": review.get("text", "")[:5000],
                        "is_active": True,
                        "is_featured": review.get("rating", 5) >= 4,  # 4+ estrelas são featured
                        "response_from_owner": None,
                        "response_time": None,
                        "helpful_count": 0
                    }
                    
                    # Inserir review no Supabase
                    insert_response = await client.post(
                        f"{supabase_url}/rest/v1/google_reviews",
                        headers={
                            "apikey": supabase_key,
                            "Authorization": f"Bearer {supabase_key}",
                            "Content-Type": "application/json",
                            "Prefer": "return=minimal"
                        },
                        json=review_data
                    )
                    
                    if insert_response.status_code in [200, 201]:
                        reviews_saved += 1
                        print(f"✅ Review salvo: {review.get('author_name', 'Anônimo')} - {review.get('rating', 5)}⭐")
                    else:
                        reviews_errors += 1
                        print(f"❌ Erro ao salvar review: {insert_response.status_code} - {insert_response.text}")
                        
                except Exception as review_error:
                    reviews_errors += 1
                    print(f"❌ Erro processando review individual: {str(review_error)}")
                    continue
        
        # Resposta completa com estatísticas
        result = {
            "success": True,
            "message": f"Webhook processado com sucesso",
            "total_received": webhook_data.total_reviews,
            "reviews_saved": reviews_saved,
            "reviews_skipped": reviews_skipped,
            "reviews_errors": reviews_errors,
            "business_name": webhook_data.business_name,
            "average_rating": webhook_data.average_rating,
            "user_ratings_total": webhook_data.user_ratings_total,
            "timestamp": webhook_data.timestamp
        }
        
        print(f"📊 RESULTADO: {reviews_saved} salvos, {reviews_skipped} duplicatas, {reviews_errors} erros")
        return result
        
    except Exception as e:
        error_msg = f"Erro crítico no webhook: {str(e)}"
        print(f"❌ {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

# Endpoint para listar leads
@app.get("/api/leads")
async def get_leads(
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """
    Lista leads com filtros opcionais
    """
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            # Fallback para MongoDB
            query = {}
            if status:
                query["status"] = status
            
            contacts = await db.contacts.find(query).sort("created_at", -1).skip(offset).limit(limit).to_list(length=None)
            total = await db.contacts.count_documents(query)
            
            # Converter para formato padrão
            leads = []
            for contact in contacts:
                contact["_id"] = str(contact["_id"])
                leads.append(contact)
            
            return {
                "leads": leads,
                "total": total,
                "offset": offset,
                "limit": limit
            }
        
        # Usar Supabase
        async with httpx.AsyncClient() as client:
            # Construir query string
            params = {
                "select": "*",
                "order": "created_at.desc",
                "offset": offset,
                "limit": limit
            }
            
            if status:
                params["status"] = f"eq.{status}"
            
            query_string = "&".join([f"{k}={v}" for k, v in params.items()])
            url = f"{supabase_url}/rest/v1/leads?{query_string}"
            
            response = await client.get(
                url,
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                leads = response.json()
                
                # Buscar total de registros
                count_response = await client.get(
                    f"{supabase_url}/rest/v1/leads?select=count",
                    headers={
                        "apikey": supabase_key,
                        "Authorization": f"Bearer {supabase_key}",
                        "Content-Type": "application/json",
                        "Prefer": "count=exact"
                    }
                )
                
                total = 0
                if count_response.status_code == 200:
                    # O total vem no header Content-Range
                    content_range = count_response.headers.get("content-range", "")
                    if "/" in content_range:
                        total = int(content_range.split("/")[-1])
                
                return {
                    "leads": leads,
                    "total": total,
                    "offset": offset,
                    "limit": limit
                }
            else:
                raise HTTPException(status_code=500, detail="Failed to fetch leads from Supabase")
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching leads: {str(e)}")

# Endpoint para atualizar lead
@app.put("/api/leads/{lead_id}")
async def update_lead(lead_id: str, lead_update: LeadUpdate):
    """
    Atualiza status, notas e responsável de um lead
    """
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        update_data = {}
        if lead_update.status:
            update_data["status"] = lead_update.status
            if lead_update.status == "contacted":
                update_data["contacted_at"] = datetime.utcnow().isoformat()
            elif lead_update.status == "converted":
                update_data["converted_at"] = datetime.utcnow().isoformat()
        
        if lead_update.notes:
            update_data["notes"] = lead_update.notes
            
        if lead_update.assigned_to:
            update_data["assigned_to"] = lead_update.assigned_to
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        if not supabase_url or not supabase_key:
            # Fallback MongoDB
            result = await db.contacts.update_one(
                {"id": lead_id},
                {"$set": update_data}
            )
            
            if result.matched_count == 0:
                raise HTTPException(status_code=404, detail="Lead not found")
            
            return {"success": True, "message": "Lead updated successfully"}
        
        # Usar Supabase
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{supabase_url}/rest/v1/leads?id=eq.{lead_id}",
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },
                json=update_data
            )
            
            if response.status_code == 200:
                return {"success": True, "message": "Lead updated successfully"}
            elif response.status_code == 404:
                raise HTTPException(status_code=404, detail="Lead not found")
            else:
                raise HTTPException(status_code=500, detail="Failed to update lead")
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating lead: {str(e)}")

# Endpoint para deletar lead específico
@app.delete("/api/leads/{lead_id}")
async def delete_lead(lead_id: str):
    """
    Deleta um lead específico
    """
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            # Fallback MongoDB
            result = await db.contacts.delete_one({"id": lead_id})
            
            if result.deleted_count == 0:
                raise HTTPException(status_code=404, detail="Lead not found")
            
            return {"success": True, "message": "Lead deleted successfully"}
        
        # Usar Supabase
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{supabase_url}/rest/v1/leads?id=eq.{lead_id}",
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 204:
                return {"success": True, "message": "Lead deleted successfully"}
            elif response.status_code == 404:
                raise HTTPException(status_code=404, detail="Lead not found")
            else:
                raise HTTPException(status_code=500, detail="Failed to delete lead")
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting lead: {str(e)}")

# Endpoint para limpar leads mocados/demo
@app.delete("/api/leads/cleanup/demo")
async def cleanup_demo_leads():
    """
    Remove todos os leads de demonstração/teste
    """
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        # Lista de leads demo para remover
        demo_names = [
            "João Silva",
            "Maria Santos", 
            "Carlos Oliveira",
            "Dashboard Test Lead",
            "Lead Teste",
            "Webhook Final Test",
            "Webhook Test Success"
        ]
        
        demo_emails = [
            "joao@email.com",
            "maria@email.com",
            "carlos@email.com", 
            "dashboard@test.com",
            "teste@email.com"
        ]
        
        demo_sources = [
            "dashboard_test",
            "webhook_test"
        ]
        
        if not supabase_url or not supabase_key:
            # Fallback MongoDB
            query = {
                "$or": [
                    {"name": {"$in": demo_names}},
                    {"email": {"$in": demo_emails}},
                    {"source": {"$in": demo_sources}}
                ]
            }
            result = await db.contacts.delete_many(query)
            deleted_count = result.deleted_count
        else:
            # Usar Supabase
            deleted_count = 0
            async with httpx.AsyncClient() as client:
                # Deletar por nome
                for name in demo_names:
                    response = await client.delete(
                        f"{supabase_url}/rest/v1/leads?name=eq.{name}",
                        headers={
                            "apikey": supabase_key,
                            "Authorization": f"Bearer {supabase_key}",
                            "Content-Type": "application/json"
                        }
                    )
                    if response.status_code == 204:
                        deleted_count += 1
                
                # Deletar por email
                for email in demo_emails:
                    response = await client.delete(
                        f"{supabase_url}/rest/v1/leads?email=eq.{email}",
                        headers={
                            "apikey": supabase_key,
                            "Authorization": f"Bearer {supabase_key}",
                            "Content-Type": "application/json"
                        }
                    )
                    if response.status_code == 204:
                        deleted_count += 1
                
                # Deletar por source
                for source in demo_sources:
                    response = await client.delete(
                        f"{supabase_url}/rest/v1/leads?source=eq.{source}",
                        headers={
                            "apikey": supabase_key,
                            "Authorization": f"Bearer {supabase_key}",
                            "Content-Type": "application/json"
                        }
                    )
                    if response.status_code == 204:
                        deleted_count += 1
        
        return {
            "success": True,
            "message": f"Demo leads cleanup completed",
            "deleted_count": deleted_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cleaning up demo leads: {str(e)}")

# Endpoint para verificar reviews duplicados no Supabase
@app.get("/api/reviews/check-duplicates")
async def check_duplicates():
    """
    Verifica reviews duplicados no Supabase
    Retorna estatísticas de duplicatas por review_id e por conteúdo
    """
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            return {
                "error": "Supabase não configurado",
                "message": "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env"
            }
        
        async with httpx.AsyncClient(timeout=30) as client:
            # Buscar todos os reviews ativos
            print("🔍 Buscando todos os reviews do Supabase...")
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
                return {
                    "error": f"Erro ao buscar reviews: {response.status_code}",
                    "details": response.text
                }
            
            reviews = response.json()
            total_reviews = len(reviews)
            print(f"📊 Total de reviews encontrados: {total_reviews}")
            
            # Verificar duplicatas por review_id
            review_ids_dict = {}
            duplicates_by_id = []
            
            for review in reviews:
                review_id = review.get("review_id")
                if review_id:
                    if review_id in review_ids_dict:
                        # Duplicata encontrada
                        existing = review_ids_dict[review_id]
                        duplicates_by_id.append({
                            "review_id": review_id,
                            "author": review.get("author_name"),
                            "rating": review.get("rating"),
                            "text_preview": review.get("text", "")[:100] + "..." if len(review.get("text", "")) > 100 else review.get("text", ""),
                            "duplicate_1": {
                                "id": existing["id"],
                                "review_time": existing.get("review_time"),
                                "review_timestamp": existing.get("review_timestamp")
                            },
                            "duplicate_2": {
                                "id": review["id"],
                                "review_time": review.get("review_time"),
                                "review_timestamp": review.get("review_timestamp")
                            }
                        })
                    else:
                        review_ids_dict[review_id] = review
            
            # Verificar duplicatas por conteúdo (mesmo autor + texto similar)
            import hashlib
            content_hashes = {}
            duplicates_by_content = []
            
            for review in reviews:
                # Criar hash do conteúdo para comparação
                author = review.get("author_name", "").strip().lower()
                text = review.get("text", "").strip()
                rating = review.get("rating", 0)
                
                # Normalizar texto (remover espaços extras, converter para minúsculas)
                text_normalized = " ".join(text.lower().split())
                
                # Criar chave única baseada em autor, rating e hash do texto
                text_hash = hashlib.md5(text_normalized.encode()).hexdigest()[:12]
                content_key = f"{author}_{rating}_{text_hash}"
                
                if content_key in content_hashes:
                    existing = content_hashes[content_key]
                    # Verificar se o texto é realmente similar (pode ter pequenas diferenças)
                    if text_normalized == existing["text_normalized"]:
                        duplicates_by_content.append({
                            "author": review.get("author_name"),
                            "rating": rating,
                            "text_preview": text[:100] + "..." if len(text) > 100 else text,
                            "duplicate_1": {
                                "id": existing["id"],
                                "review_id": existing.get("review_id"),
                                "review_time": existing.get("review_time")
                            },
                            "duplicate_2": {
                                "id": review["id"],
                                "review_id": review.get("review_id"),
                                "review_time": review.get("review_time")
                            }
                        })
                else:
                    content_hashes[content_key] = {
                        "id": review["id"],
                        "review_id": review.get("review_id"),
                        "text_normalized": text_normalized,
                        "review_time": review.get("review_time")
                    }
            
            # Contar reviews únicos
            unique_by_id = len(review_ids_dict)
            unique_by_content = len(content_hashes)
            
            result = {
                "summary": {
                    "total_reviews": total_reviews,
                    "unique_by_review_id": unique_by_id,
                    "unique_by_content": unique_by_content,
                    "duplicates_by_review_id": len(duplicates_by_id),
                    "duplicates_by_content": len(duplicates_by_content),
                    "total_duplicate_groups": len(duplicates_by_id) + len(duplicates_by_content)
                },
                "duplicates_by_review_id": duplicates_by_id[:50],  # Limitar a 50 para não sobrecarregar
                "duplicates_by_content": duplicates_by_content[:50],
                "recommendation": "Verifique os duplicados acima e considere limpar mantendo apenas o mais recente"
            }
            
            print(f"✅ Verificação concluída:")
            print(f"   - Total: {total_reviews}")
            print(f"   - Únicos por review_id: {unique_by_id}")
            print(f"   - Duplicados por review_id: {len(duplicates_by_id)}")
            print(f"   - Duplicados por conteúdo: {len(duplicates_by_content)}")
            
            return result
            
    except Exception as e:
        error_msg = f"Erro ao verificar duplicatas: {str(e)}"
        print(f"❌ {error_msg}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)

# Initialize default service types
@app.on_event("startup")
async def startup_event():
    # Check if service types exist, if not create defaults
    try:
        count = await db.service_types.count_documents({})
        if count == 0:
            default_services = [
                {
                    "id": str(uuid.uuid4()),
                    "name": "Deep Cleaning",
                    "description": "Complete top-to-bottom cleaning ideal for first-time visits, post-renovation, or long periods without service. Includes hidden and hard-to-reach spots.",
                    "base_price": 159.0,  # Preço inicial "starting from" - Deep Cleaning
                    "duration_hours": 4,
                    "includes": ["All rooms", "Kitchen deep clean", "Bathroom sanitization", "Window cleaning", "Baseboards", "Light fixtures"],
                    "active": True,
                    "created_at": datetime.utcnow()
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Regular Maintenance",
                    "description": "Ongoing cleaning to keep your space fresh. Includes kitchen, bathrooms, bedrooms, floors, and all visible surfaces.",
                    "base_price": 69.0,  # Preço inicial "starting from" - Regular Maintenance
                    "duration_hours": 2,
                    "includes": ["Surface cleaning", "Vacuuming", "Mopping", "Bathroom cleaning", "Kitchen cleaning", "Dusting"],
                    "active": True,
                    "created_at": datetime.utcnow()
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Move-In / Move-Out Cleaning",
                    "description": "Detailed cleaning to prepare a home for new occupants or leave it spotless after moving. Includes inside cabinets, baseboards, and appliances.",
                    "base_price": 173.0,  # Preço inicial "starting from" - Move-In/Out Cleaning
                    "duration_hours": 6,
                    "includes": ["Complete deep clean", "Cabinet interiors", "Appliance cleaning", "Wall washing", "Closet cleaning", "Garage cleaning"],
                    "active": True,
                    "created_at": datetime.utcnow()
                }
            ]
            
            await db.service_types.insert_many(default_services)
            print("Default service types initialized with updated prices (+15%)")
    except Exception as e:
        print(f"⚠️ MongoDB not available: {e}. API de reviews continuará funcionando via Supabase.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)