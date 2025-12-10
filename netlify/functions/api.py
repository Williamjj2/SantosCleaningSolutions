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
# No local .env loading in production necessary as Netlify injects them.
# But for safety we can import it if available, though load_dotenv isn't strictly needed if env is set.
from dotenv import load_dotenv
load_dotenv()

from mangum import Mangum

app = FastAPI(title="Santos Cleaning Solutions API")

ALLOWED_ORIGINS = [
    "https://santoscsolutions.com",
    "https://www.santoscsolutions.com",
    "https://santoscleaningsolutions.netlify.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"
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
    serverSelectionTimeoutMS=2000,
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

@app.post("/api/contact")
async def submit_contact(contact: ContactRequest):
    try:
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
        
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if supabase_url and supabase_key:
            async with httpx.AsyncClient() as client:
                try:
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
                    else:
                        raise Exception("Supabase error")
                        
                except Exception as supabase_error:
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
        else:
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
        
        return {
            "success": True,
            "message": "Contact request submitted successfully",
            "id": lead_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit contact: {str(e)}")

@app.get("/api/reviews")
async def get_reviews():
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            return {"reviews": []}
        
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                f"{supabase_url}/rest/v1/google_reviews",
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}"
                },
                params={
                    "select": "author_name,rating,text,relative_time_description,profile_photo_url,review_time,review_id",
                    "order": "review_time.desc",
                    "limit": "100",  
                    "is_active": "eq.true"
                }
            )
            
            if response.status_code == 200:
                supabase_reviews = response.json()
                
                if supabase_reviews:
                    import hashlib
                    seen_review_ids = set()
                    seen_content = set()
                    unique_reviews = []
                    
                    for review in supabase_reviews:
                        review_id = review.get("review_id")
                        if review_id and review_id in seen_review_ids:
                            continue
                        
                        author = review.get("author_name", "").strip().lower()
                        text = review.get("text", "").strip()
                        rating = review.get("rating", 0)
                        
                        text_normalized = " ".join(text.lower().split())
                        content_hash = hashlib.md5(f"{author}_{rating}_{text_normalized}".encode()).hexdigest()
                        
                        if content_hash in seen_content:
                            continue
                        
                        if review_id:
                            seen_review_ids.add(review_id)
                        seen_content.add(content_hash)
                        unique_reviews.append(review)
                    
                    unique_reviews = unique_reviews[:50]
                    
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
        return {"reviews": []}
        
    except Exception as e:
        return {"reviews": []}

@app.get("/api/reviews/stats")
async def get_reviews_stats():
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            return {
                "average_rating": 4.8,
                "total_reviews": 47,
                "rating_distribution": {"5": 40, "4": 5, "3": 1, "2": 1, "1": 0},
                "last_updated": datetime.utcnow().isoformat()
            }
        
        async with httpx.AsyncClient(timeout=10) as client:
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
                    total_reviews = len(all_reviews)
                    ratings = [review.get("rating", 5) for review in all_reviews if review.get("rating")]
                    
                    if ratings:
                        average_rating = round(sum(ratings) / len(ratings), 1)
                        
                        rating_distribution = {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}
                        for rating in ratings:
                            rating_key = str(rating)
                            if rating_key in rating_distribution:
                                rating_distribution[rating_key] += 1
                        
                        latest_review_time = max([review.get("review_time", "") for review in all_reviews], default="")
                        
                        stats = {
                            "average_rating": average_rating,
                            "total_reviews": total_reviews,
                            "rating_distribution": rating_distribution,
                            "latest_review_time": latest_review_time,
                            "last_updated": datetime.utcnow().isoformat(),
                            "source": "supabase"
                        }
                        
                        return stats
        
        return {
            "average_rating": 4.8,
            "total_reviews": 47,
            "rating_distribution": {"5": 40, "4": 5, "3": 1, "2": 1, "1": 0},
            "last_updated": datetime.utcnow().isoformat(),
            "source": "fallback"
        }
        
    except Exception as e:
        return {
            "average_rating": 4.8,
            "total_reviews": 47,
            "rating_distribution": {"5": 40, "4": 5, "3": 1, "2": 1, "1": 0},
            "last_updated": datetime.utcnow().isoformat(),
            "source": "error_fallback"
        }

@app.get("/api/services")
async def get_services():
    try:
        services = await db.service_types.find({"active": True}, {"_id": 0}).to_list(length=None)
        return {"services": services}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching services: {str(e)}")

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

# Initialize default service types
@app.on_event("startup")
async def startup_event():
    try:
        count = await db.service_types.count_documents({})
        if count == 0:
            default_services = [
                {
                    "id": str(uuid.uuid4()),
                    "name": "Deep Cleaning",
                    "description": "Complete top-to-bottom cleaning ideal for first-time visits, post-renovation, or long periods without service. Includes hidden and hard-to-reach spots.",
                    "base_price": 159.0,
                    "duration_hours": 4,
                    "includes": ["All rooms", "Kitchen deep clean", "Bathroom sanitization", "Window cleaning", "Baseboards", "Light fixtures"],
                    "active": True,
                    "created_at": datetime.utcnow()
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Regular Maintenance",
                    "description": "Ongoing cleaning to keep your space fresh. Includes kitchen, bathrooms, bedrooms, floors, and all visible surfaces.",
                    "base_price": 69.0,
                    "duration_hours": 2,
                    "includes": ["Surface cleaning", "Vacuuming", "Mopping", "Bathroom cleaning", "Kitchen cleaning", "Dusting"],
                    "active": True,
                    "created_at": datetime.utcnow()
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Move-In / Move-Out Cleaning",
                    "description": "Detailed cleaning to prepare a home for new occupants or leave it spotless after moving. Includes inside cabinets, baseboards, and appliances.",
                    "base_price": 173.0,
                    "duration_hours": 6,
                    "includes": ["Complete deep clean", "Cabinet interiors", "Appliance cleaning", "Wall washing", "Closet cleaning", "Garage cleaning"],
                    "active": True,
                    "created_at": datetime.utcnow()
                }
            ]
            await db.service_types.insert_many(default_services)
    except Exception as e:
        pass

handler = Mangum(app)
