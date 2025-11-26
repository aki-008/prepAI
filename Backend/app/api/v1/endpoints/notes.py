from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User
from app.api.deps import get_db, get_current_user
from app.schema import ChatMessage, AI_chat_input
from .prompts import SYSTEM_PROMPT
from app.llm import call_llm, stream_chat
import uuid
from fastapi.responses import StreamingResponse



router = APIRouter(prefix="/notes")

@router.post("/stram_chat", response_class=StreamingResponse)
async def ai_chat(
    Input_model: AI_chat_input, 
    # db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    messages_dict = [msg.model_dump() for msg in Input_model.messages]

    return StreamingResponse(
        stream_chat(messages_dict, Input_model.context),
        media_type="text/plain"
    )