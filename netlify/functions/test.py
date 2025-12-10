import json

def handler(event, context):
    """Simple test function to verify Netlify Python Functions work"""
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps({
            "message": "Santos Cleaning API is working!",
            "path": event.get("path", "/"),
            "method": event.get("httpMethod", "GET")
        })
    }
