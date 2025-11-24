from fastapi import APIRouter, Depends, HTTPException, status
from chromadb import AsyncHttpClient
from app.models import User
from app.api.deps import get_db, get_current_user, get_chroma_client
from app.schema import Quiz_input, QuizOutput
from .prompts import SYSTEM_PROMPT
from fastapi import APIRouter, Depends, HTTPException
from chromadb.api.models.Collection import Collection # Import Collection type
from app.api.deps import get_chroma_collection
from app.llm import call_llm
router = APIRouter(prefix="/quiz")

async def search_logic(query: str, collection: Collection):
    results = await collection.query(
        query_texts=[query],
        n_results=5
    )
    return ''.join(results['documents'][0])

@router.get("/search_docs")
async def search_documents(
    query: str,
    collection: Collection = Depends(get_chroma_collection)
):
    try:
        return await search_logic(query, collection)
    except Exception as e:
        raise HTTPException(500, f"ChromaDB Query Error: {e}")


@router.post("/", response_model=QuizOutput, status_code=status.HTTP_201_CREATED)
async def generate_quiz(
    Input_model: Quiz_input, 
    collection: Collection = Depends(get_chroma_collection), 
    current_user: User = Depends(get_current_user)
):
    try:
        query = Input_model.parsed_doc + Input_model.user_prompt
        retrieved_context = await search_logic(query, collection)
        

        if not retrieved_context:
            raise ValueError("No context available to generate quiz.")
        prompt = await prompt_builder(Input_model.parsed_doc, Input_model.user_prompt, retrieved_context)
        
        quiz_data_obj = await call_llm(prompt)

        return quiz_data_obj

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Invalid Input: {str(e)}'
        )

# #--------Helper Functions--------#


async def prompt_builder(parsed_doc:str, user_prompt:str, docs:str=None):
    prompt = SYSTEM_PROMPT.format(
        parsed_info=parsed_doc,
        user_prompt=user_prompt,
        retrieved_docs=docs
    )
    return prompt