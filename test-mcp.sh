#!/bin/bash
export N8N_URL="https://n8n.williamjj.com"
export API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwODYzNDU5OS0zOGEwLTQxYmYtYWQ3Yy0xZmI2NzcwNThhMmQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY1NTgzNzUxfQ.Cc8BtCm20y_vhOgrivuawP5rChe0qS8cCmu6GLU2fvI"
export WF_ID="2VC364nhU2HECxBa"

echo "1. Activating Workflow..."
curl -s -X POST -H "X-N8N-API-KEY: $API_KEY" "$N8N_URL/api/v1/workflows/$WF_ID/activate"
echo -e "\n-----------------------------------"

echo "2. Testing check_lead (Phone: (470) 416-5649)..."
curl -s -X POST -H "Content-Type: application/json" -d '{"tool": "check_lead", "phone": "(470) 416-5649"}' "$N8N_URL/webhook/laura"
echo -e "\n-----------------------------------"

echo "3. Testing get_availability (Zip: 30067)..."
curl -s -X POST -H "Content-Type: application/json" -d '{"tool": "get_availability", "zip_code": "30067"}' "$N8N_URL/webhook/laura"
echo -e "\n-----------------------------------"

echo "4. Testing get_pricing (3 Bed, 2 Bath, Regular)..."
curl -s -X POST -H "Content-Type: application/json" -d '{"tool": "get_pricing", "bedrooms": 3, "bathrooms": 2, "service_type": "regular", "zip_code": "30067"}' "$N8N_URL/webhook/laura"
echo -e "\n-----------------------------------"
