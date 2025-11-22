from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.schema import StudentCreate, StudentUpdate, StudentResponse
from app.models import Student, User
from app.api.deps import get_db, get_current_user
from app.schema import Quiz_input

router = APIRouter()

# @router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
# async def generate_quiz(
#     Input_model: Quiz_input, db: AsyncSession = Depends(get_db), 
#     current_user: User = Depends(get_current_user)):

#     try:
#         if Input_model.parsed_doc and Input_model.user_prompt and Input_model.choice:



#--------Helper Functions--------#

def prompt_builder()