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

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
client = AsyncIOMotorClient(os.getenv("MONGO_URL", "mongodb://localhost:27017"))
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
        # Test database connection
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

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
                    "select": "author_name,rating,text,relative_time_description,profile_photo_url,review_time",
                    "order": "review_time.desc",
                    "limit": "50"
                }
            )
            
            if response.status_code == 200:
                supabase_reviews = response.json()
                
                if supabase_reviews:
                    print(f"✅ {len(supabase_reviews)} reviews carregados do Supabase")
                    
                    # Formatar reviews para o frontend
                    formatted_reviews = []
                    for review in supabase_reviews:
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
                    author_clean = review.get('author_name', 'anonymous').replace(' ', '_').replace('-', '_').lower()
                    review_timestamp = review.get('review_time', webhook_data.timestamp)
                    
                    # Converter timestamp para segundos Unix
                    try:
                        timestamp_seconds = int(datetime.fromisoformat(review_timestamp.replace('Z', '+00:00')).timestamp())
                    except:
                        timestamp_seconds = int(datetime.now().timestamp())
                    
                    review_id = f"gp_{author_clean}_{timestamp_seconds}_{review.get('rating', 5)}"
                    
                    # Verificar se review já existe (evitar duplicatas)
                    check_response = await client.get(
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
                    
                    if check_response.status_code == 200 and len(check_response.json()) > 0:
                        reviews_skipped += 1
                        print(f"⏭️ Review já existe: {review_id}")
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

# Initialize default service types
@app.on_event("startup")
async def startup_event():
    # Check if service types exist, if not create defaults
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)