# LAURA MCP Server - API Documentation

**Base URL:** `https://n8n.williamjj.com/webhook/laura`
**Workflow ID:** `2VC364nhU2HECxBa`

---

## 🔧 Available Tools (Endpoints)

All requests must be **POST** with JSON body containing:
```json
{
  "tool": "tool_name",
  // ... tool-specific parameters
}
```

---

### 1. `check_lead` - Verify Lead History

**Purpose:** Check if customer exists in database and get their history.

**Request:**
```json
{
  "tool": "check_lead",
  "phone": "(470) 416-5649"
}
```

**Response:**
```json
{
  "type": "NEW" | "RETURNING" | "COLD",
  "last_service_date": "2024-09-15T10:00:00Z",
  "total_bookings": 3,
  "preferred_day": "Monday",
  "notes": "Has 2 dogs, needs pet-friendly products",
  "address": "123 Main St, Atlanta, GA 30067"
}
```

---

### 2. `get_availability` - Check Calendar Slots

**Purpose:** Get available time slots for next 7 days.

**Request:**
```json
{
  "tool": "get_availability",
  "zip_code": "30067",
  "preferred_date": "2024-12-16" // Optional
}
```

**Response:**
```json
{
  "available_slots": [
    {
      "date": "2024-12-16",
      "time": "9:00 AM",
      "datetime": "2024-12-16T09:00:00Z"
    },
    {
      "date": "2024-12-16",
      "time": "2:00 PM",
      "datetime": "2024-12-16T14:00:00Z"
    }
  ],
  "next_available": "2024-12-16 at 9:00 AM",
  "total_found": 10
}
```

---

### 3. `get_pricing` - Calculate Price

**Purpose:** Get pricing estimate based on home size and service type.

**Request:**
```json
{
  "tool": "get_pricing",
  "bedrooms": 3,
  "bathrooms": 2,
  "service_type": "regular" | "deep" | "move-in-out",
  "zip_code": "30067"
}
```

**Response:**
```json
{
  "base_price": 230,
  "range_low": 218,
  "range_high": 241,
  "area_premium": 0.15,
  "discount_available": 0.10,
  "breakdown": {
    "bedrooms": 3,
    "bathrooms": 2,
    "service_type": "regular",
    "is_premium_area": true
  }
}
```

---

### 4. `book_appointment` - Schedule Cleaning

**Purpose:** Create calendar event and update lead status.

**Request:**
```json
{
  "tool": "book_appointment",
  "phone": "(470) 416-5649",
  "lead_name": "William",
  "service_type": "regular",
  "address": "123 Main St, Atlanta, GA 30067",
  "datetime": "2024-12-16T09:00:00Z",
  "price": 230
}
```

**Response:**
```json
{
  "success": true,
  "confirmation_id": "SCS-1734134237523",
  "message": "Appointment booked successfully",
  "sms_sent": false
}
```

---

### 5. `end_call` - Log Call Outcome

**Purpose:** Record call result in database.

**Request:**
```json
{
  "tool": "end_call",
  "lead_id": "123",
  "outcome": "booked" | "callback" | "not_interested" | "voicemail",
  "notes": "Customer wants Monday morning. Booked for 9 AM."
}
```

**Response:**
```json
{
  "logged": true,
  "message": "Call outcome recorded"
}
```

---

## 🧪 Testing

Use curl to test endpoints:

```bash
curl -X POST https://n8n.williamjj.com/webhook/laura \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_pricing",
    "bedrooms": 3,
    "bathrooms": 2,
    "service_type": "regular",
    "zip_code": "30067"
  }'
```

---

## 📋 ElevenLabs Configuration

In ElevenLabs Agent settings, add these tools:

### Tool 1: check_lead
```json
{
  "name": "check_lead",
  "description": "Check if customer has history with us. Use when they mention past service.",
  "url": "https://n8n.williamjj.com/webhook/laura",
  "method": "POST",
  "body_schema": {
    "tool": "check_lead",
    "phone": "string"
  }
}
```

### Tool 2: get_availability
```json
{
  "name": "get_availability",
  "description": "Get available time slots when customer rejects pre-loaded options.",
  "url": "https://n8n.williamjj.com/webhook/laura",
  "method": "POST",
  "body_schema": {
    "tool": "get_availability",
    "zip_code": "string",
    "preferred_date": "string"
  }
}
```

### Tool 3: get_pricing (Optional)
```json
{
  "name": "get_pricing",
  "description": "Calculate exact pricing if needed.",
  "url": "https://n8n.williamjj.com/webhook/laura",
  "method": "POST",
  "body_schema": {
    "tool": "get_pricing",
    "bedrooms": "number",
    "bathrooms": "number",
    "service_type": "string",
    "zip_code": "string"
  }
}
```

### Tool 4: book_appointment
```json
{
  "name": "book_appointment",
  "description": "Book the cleaning when customer confirms date/time.",
  "url": "https://n8n.williamjj.com/webhook/laura",
  "method": "POST",
  "body_schema": {
    "tool": "book_appointment",
    "phone": "string",
    "lead_name": "string",
    "service_type": "string",
    "address": "string",
    "datetime": "string",
    "price": "number"
  }
}
```

### Tool 5: end_call
```json
{
  "name": "end_call",
  "description": "End the call and log outcome.",
  "url": "https://n8n.williamjj.com/webhook/laura",
  "method": "POST",
  "body_schema": {
    "tool": "end_call",
    "lead_id": "string",
    "outcome": "string",
    "notes": "string"
  }
}
```

---

## ⚠️ Important Notes

1. **Activate Workflow:** Go to N8N and activate the workflow before using
2. **Supabase Tables:** Ensure `call_logs` table exists in Supabase
3. **Phone Format:** Use format `(XXX) XXX-XXXX` for consistency
4. **Datetime Format:** Use ISO 8601 format `YYYY-MM-DDTHH:mm:ssZ`
