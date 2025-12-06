import os
import uvicorn
from fastapi import APIRouter, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.config import settings
from vapi import Vapi
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

router = APIRouter()


# --- CONFIGURATION ---
VAPI_PRIVATE_KEY = os.getenv("VAPI_PRIVATE_KEY")
VAPI_ASSISTANT_ID = os.getenv("VAPI_ASSISTANT_ID")
# The SERVER_URL MUST be set to your public ngrok HTTPS URL for external webhooks to work.
SERVER_URL = os.getenv("SERVER_URL", "http://localhost:8000") 

# Initialize Vapi Server SDK
try:
    vapi_server = Vapi(token=VAPI_PRIVATE_KEY)
except Exception as e:
    print(f"Vapi SDK Initialization Error: {e}")
    print("Ensure VAPI_PRIVATE_KEY is set in .env")


# --- SCHEMAS ---
class ConfigRequest(BaseModel):
    name: str
    job_role: str
    experience: str
    level: str = "Medium"

# --- ENDPOINTS ---

@router.post("/api/get-vapi-config")
async def get_vapi_config(data: ConfigRequest):
    """
    Endpoint called by the Frontend to get the dynamically generated Assistant configuration.
    """
    if VAPI_ASSISTANT_ID == "asst_11111111111111111111":
        raise HTTPException(
            status_code=503, 
            detail="VAPI_ASSISTANT_ID not configured in .env. Please set your ID."
        )

    try:
        print(f"\n--- New Interview Request ---")
        print(f"👤 User: {data.name}, Role: {data.job_role}, Exp: {data.experience}, Level: {data.level}")

        system_prompt = (
            f"You are a strict technical interviewer. You are interviewing {data.name} for a {data.job_role} role. "
            f"They have {data.experience} years of experience. "
            f"The interview difficulty level is {data.level}. "
            f"If the level is 'Hard', ask complex, multi-layered questions. "
            f"If 'Medium', focus on standard industry concepts. "
            f"Ask short, concise questions. Wait for their answer. Do not lecture. "
            f"Start by asking them to introduce themselves."
        )
        webhook_url = f"{SERVER_URL}/api/webhook"
        
        # 3. Construct the Overrides Payload
        assistant_overrides = {
            "model": {
                "provider": "openai", 
                "model": "gpt-4o-mini", # or "gpt-4", "gpt-3.5-turbo"
                "messages": [
                    {"role": "system", "content": system_prompt}
                ]
            },
            "server": {
                "url": webhook_url
            },
            # ... keep metadata as is ...
            "metadata": {
                "user_name": data.name,
                "job_role": data.job_role,
                "environment": "standalone-test"
            }
        }

        # 4. Return the necessary config to the frontend Web SDK
        return {
            "assistantId": VAPI_ASSISTANT_ID,
            "overrides": assistant_overrides
        }

    except Exception as e:
        print(f"❌ Vapi Configuration Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to configure agent: {str(e)}")


@router.post("/api/webhook")
async def vapi_webhook_receiver(request: Request):
    """
    Endpoint that receives asynchronous events from Vapi's servers.
    """
    payload = await request.json()
    message = payload.get("message", {})
    
    # Log incoming transcripts in real-time
    if message.get("type") == "transcript" and message.get("transcriptType") == "final":
        print(f"🗣️ [Transcript] {message.get('role').upper()}: {message.get('transcript')}")
        
    # Log the final report (contains summary, full conversation, etc.)
    elif message.get("type") == "end-of-call-report":
        metadata = payload.get("assistant", {}).get("metadata", {})
        print(f"\n--- 🏁 Call Ended Report ---")
        print(f"  User: {metadata.get('user_name')}, Role: {metadata.get('job_role')}")
        print(f"  Summary: {message.get('summary', 'N/A')}")
        print(f"---------------------------\n")

    # Vapi expects a 200 OK response
    return {"status": "ok"}

@router.get("/")
async def root():
    return {"message": "Vapi Standalone Backend is running on port 8000."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)