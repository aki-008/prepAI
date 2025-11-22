from fastapi import APIRouter, Depends, HTTPException
from chromadb import AsyncHttpClient
from app.models import User
from app.api.deps import get_db, get_current_user, get_chroma_client
from app.schema import Quiz_input
from prompts import SYSTEM_PROMPT

router = APIRouter()






# @router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
# async def generate_quiz(
#     Input_model: Quiz_input, db: AsyncSession = Depends(get_db), 
#     current_user: User = Depends(get_current_user)):

    
#     if Input_model.parsed_doc and Input_model.user_prompt and Input_model.choice:
#         prompt = prompt_builder(Input_model.parsed_doc, Input_model.user_prompt, Input_model.choice)



# #--------Helper Functions--------#

# def get_embed()

# def prompt_builder(parsed_doc:str, user_prompt:str, choice:str):
#     retrieved_docs = get_embed()
#     prompt = SYSTEM_PROMPT.format(
#         parsed_info=parsed_doc,
#         user_prompt=user_prompt,
#         mcq_style=choice,
#         # retrieved_docs=
#     )