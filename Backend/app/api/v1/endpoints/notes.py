from fastapi import APIRouter, Depends, HTTPException, status
from chromadb import AsyncHttpClient
from app.models import User
from app.api.deps import get_db, get_current_user, get_chroma_client
from app.schema import Quiz_input, QuizOutput, IngestRequest
from .prompts import SYSTEM_PROMPT
from fastapi import APIRouter, Depends, HTTPException
from chromadb.api.models.Collection import Collection # Import Collection type
from app.api.deps import get_chroma_collection
from app.llm import call_llm
import uuid