#!/bin/bash
# N8N Helper Script - Santos Cleaning Solutions
# Facilita acesso à API do N8N

export N8N_BASE_URL="https://n8n.williamjj.com/api/v1"
export N8N_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwODYzNDU5OS0zOGEwLTQxYmYtYWQ3Yy0xZmI2NzcwNThhMmQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY1NTgzNzUxfQ.Cc8BtCm20y_vhOgrivuawP5rChe0qS8cCmu6GLU2fvI"

# Function to make N8N API calls
n8n_api() {
  local endpoint="$1"
  local method="${2:-GET}"
  local data="$3"
  
  if [ -z "$data" ]; then
    curl -s -X "$method" \
      -H "X-N8N-API-KEY: $N8N_API_KEY" \
      "$N8N_BASE_URL$endpoint"
  else
    curl -s -X "$method" \
      -H "X-N8N-API-KEY: $N8N_API_KEY" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$N8N_BASE_URL$endpoint"
  fi
}

# List all workflows
n8n_list_workflows() {
  n8n_api "/workflows"
}

# Get specific workflow
n8n_get_workflow() {
  local workflow_id="$1"
  n8n_api "/workflows/$workflow_id"
}

# Execute workflow
n8n_execute_workflow() {
  local workflow_id="$1"
  n8n_api "/workflows/$workflow_id/activate" "POST"
}

# Create workflow
n8n_create_workflow() {
  local workflow_json="$1"
  n8n_api "/workflows" "POST" "$workflow_json"
}

echo "N8N Helper loaded! Available functions:"
echo "  - n8n_list_workflows"
echo "  - n8n_get_workflow <id>"
echo "  - n8n_execute_workflow <id>"
echo "  - n8n_create_workflow <json>"
