from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User
from app.api.deps import get_db, get_current_user
from app.schema import ChatMessage, AI_chat_input, pdf_input
from app.llm import stream_chat
import uuid
from fastapi.responses import StreamingResponse
from chromadb.api.models.Collection import Collection 
from app.api.deps import get_chroma_collection
from app.api.deps import get_db, get_current_user, get_chroma_client
from pathlib import Path
from llama_index.readers.file import PyMuPDFReader
from llama_index.core.node_parser import SentenceSplitter
from typing import Annotated
import shutil
import os
from .quiz import ingest_logic

router = APIRouter(prefix="/notes")

UPLOAD_DIRECTORY = "uploaded_pdfs"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)


@router.post("/stream_chat", response_class=StreamingResponse)
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

@router.post("/upload_notes")
async def upload_notes(
    file: Annotated[UploadFile, File(description="A PDF file to upload")],
    collection: Collection = Depends(get_chroma_collection), 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file_path = Path(UPLOAD_DIRECTORY) / file.filename
    
    try:

        chunks = await pdf_process(str(file_path))
        if not chunks:
            raise ValueError("No chunks availible")

        await ingest_logic(chunks, collection)

        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
        
    finally:
        if file_path.exists():
            os.remove(file_path)

# #--------Helper Functions--------#

async def pdf_process(pdf_path: str):
    loader = PyMuPDFReader()
    
    # 5. Load using the file path string
    documents = loader.load_data(file_path=pdf_path)
    
    text_splitter = SentenceSplitter(
        chunk_size=1000,
        chunk_overlap=20
    )
    
    text_chunks = []
    
    for doc_idx, doc in enumerate(documents):
        cur_text_chunks = text_splitter.split_text(doc.text)
        text_chunks.extend(cur_text_chunks)

    return text_chunks