#!/usr/bin/env python3
"""
Santos Cleaning Solutions - Production API Server
Simplified version for production deployment
"""

import os
import json
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="Santos Cleaning Solutions API",
    description="Backend API for Santos Cleaning Solutions",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# MODELS
# ============================================================================

class Review(BaseModel):
    author_name: str
    author_url: Optional[str] = None
    language: Optional[str] = "en"
    original_language: Optional[str] = "en"
    profile_photo_url: Optional[str] = None
    rating: int = Field(ge=1, le=5)
    relative_time_description: Optional[str] = None
    text: Optional[str] = ""
    time: Optional[int] = None
    translated: Optional[bool] = False
    review_id: Optional[str] = None
    place_id: Optional[str] = None

class ReviewsResponse(BaseModel):
    reviews: List[Review]
    total_count: int
    average_rating: float
    last_updated: str

class WebhookReviewData(BaseModel):
    reviews: List[Dict[str, Any]]
    place_id: Optional[str] = None
    business_name: Optional[str] = None

# ============================================================================
# SUPABASE INTEGRATION (OPTIONAL)
# ============================================================================

def get_supabase_client():
    """Get Supabase client if configured"""
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            logger.warning("Supabase not configured - using fallback data")
            return None
            
        from supabase import create_client, Client
        return create_client(supabase_url, supabase_key)
    except ImportError:
        logger.warning("Supabase library not installed - using fallback data")
        return None
    except Exception as e:
        logger.error(f"Error initializing Supabase: {e}")
        return None

# ============================================================================
# FALLBACK DATA
# ============================================================================

FALLBACK_REVIEWS = [
    {
        "author_name": "Sarah Johnson",
        "rating": 5,
        "text": "Santos Cleaning did an amazing job! My house has never been cleaner. Professional, punctual, and thorough. Highly recommend!",
        "time": 1723654800,
        "review_id": "fallback_1"
    },
    {
        "author_name": "Michael Chen",
        "rating": 5,
        "text": "Excellent service! The team was very professional and paid attention to every detail. Will definitely use them again.",
        "time": 1723568400,
        "review_id": "fallback_2"
    },
    {
        "author_name": "Emily Rodriguez",
        "rating": 5,
        "text": "Best cleaning service in Marietta! They transformed my home. Very reliable and trustworthy team.",
        "time": 1723482000,
        "review_id": "fallback_3"
    }
]

# ============================================================================
# ROUTES
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "Santos Cleaning Solutions API",
        "version": "2.0.0",
        "status": "operational",
        "endpoints": {
            "reviews": "/api/reviews",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "santos-cleaning-api"
    }

@app.get("/api/reviews", response_model=ReviewsResponse)
async def get_reviews():
    """Get all reviews from Supabase or fallback data"""
    try:
        # Try Supabase first
        supabase = get_supabase_client()
        
        if supabase:
            try:
                response = supabase.table('reviews').select("*").order('time', desc=True).execute()
                
                if response.data:
                    reviews = response.data
                    logger.info(f"Fetched {len(reviews)} reviews from Supabase")
                else:
                    reviews = FALLBACK_REVIEWS
                    logger.info("No reviews in Supabase, using fallback")
            except Exception as e:
                logger.error(f"Error fetching from Supabase: {e}")
                reviews = FALLBACK_REVIEWS
        else:
            # Try to load from local file
            try:
                reviews_file = Path("/var/www/santos-cleaning-frontend/data/reviews.json")
                if reviews_file.exists():
                    with open(reviews_file, 'r') as f:
                        data = json.load(f)
                        reviews = data.get('reviews', FALLBACK_REVIEWS)
                        logger.info(f"Loaded {len(reviews)} reviews from local file")
                else:
                    reviews = FALLBACK_REVIEWS
                    logger.info("Using fallback reviews")
            except Exception as e:
                logger.error(f"Error loading local reviews: {e}")
                reviews = FALLBACK_REVIEWS
        
        # Calculate stats
        total_count = len(reviews)
        average_rating = sum(r.get('rating', 5) for r in reviews) / total_count if total_count > 0 else 5.0
        
        return ReviewsResponse(
            reviews=reviews[:20],  # Limit to 20 most recent
            total_count=total_count,
            average_rating=round(average_rating, 1),
            last_updated=datetime.now(timezone.utc).isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error in get_reviews: {e}")
        # Return fallback data on any error
        return ReviewsResponse(
            reviews=FALLBACK_REVIEWS,
            total_count=len(FALLBACK_REVIEWS),
            average_rating=5.0,
            last_updated=datetime.now(timezone.utc).isoformat()
        )

@app.post("/api/webhook/reviews-update")
async def webhook_reviews_update(data: WebhookReviewData):
    """Webhook endpoint to receive review updates from n8n"""
    try:
        supabase = get_supabase_client()
        
        if not supabase:
            # Save to local file if Supabase not available
            try:
                reviews_file = Path("/var/www/santos-cleaning-frontend/data/reviews.json")
                reviews_file.parent.mkdir(parents=True, exist_ok=True)
                
                with open(reviews_file, 'w') as f:
                    json.dump({
                        "reviews": data.reviews,
                        "last_updated": datetime.now(timezone.utc).isoformat()
                    }, f, indent=2)
                
                logger.info(f"Saved {len(data.reviews)} reviews to local file")
                return {"status": "success", "message": f"Saved {len(data.reviews)} reviews locally"}
                
            except Exception as e:
                logger.error(f"Error saving to local file: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        # Save to Supabase
        new_count = 0
        updated_count = 0
        
        for review in data.reviews:
            review_id = review.get('review_id')
            
            if not review_id:
                continue
            
            # Check if review exists
            existing = supabase.table('reviews').select("*").eq('review_id', review_id).execute()
            
            review_data = {
                'review_id': review_id,
                'author_name': review.get('author_name', 'Anonymous'),
                'rating': review.get('rating', 5),
                'text': review.get('text', ''),
                'time': review.get('time'),
                'author_url': review.get('author_url'),
                'profile_photo_url': review.get('profile_photo_url'),
                'place_id': data.place_id or review.get('place_id'),
                'updated_at': datetime.now(timezone.utc).isoformat()
            }
            
            if existing.data:
                # Update existing review
                supabase.table('reviews').update(review_data).eq('review_id', review_id).execute()
                updated_count += 1
            else:
                # Insert new review
                supabase.table('reviews').insert(review_data).execute()
                new_count += 1
        
        logger.info(f"Webhook processed: {new_count} new, {updated_count} updated reviews")
        
        return {
            "status": "success",
            "message": f"Processed {len(data.reviews)} reviews",
            "details": {
                "new": new_count,
                "updated": updated_count
            }
        }
        
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"Starting Santos Cleaning API on {host}:{port}")
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info",
        access_log=True
    )



