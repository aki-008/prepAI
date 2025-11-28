from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User
from app.models.tables import PDFData
from app.api.deps import get_db, get_current_user
from app.schema import AI_chat_input
from app.llm import stream_chat
import uuid
from fastapi.responses import StreamingResponse
from chromadb.api.models.Collection import Collection 
from app.api.deps import get_chroma_collection
from pathlib import Path
from llama_index.readers.file import PyMuPDFReader
from llama_index.core.node_parser import SentenceSplitter
from typing import Annotated
import shutil
import os
from sentence_transformers import SentenceTransformer


router = APIRouter(prefix="/notes")

UPLOAD_DIRECTORY = "uploaded_pdfs"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

@router.post("/stream_chat", response_class=StreamingResponse)
async def ai_chat(
    Input_model: AI_chat_input, 
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
    file_content = file.read()

    await file.seek(0)


    safe_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = Path(UPLOAD_DIRECTORY) / safe_filename
    
    try:

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 2. Process PDF into chunks
        chunks = await pdf_process(str(file_path))
        
        if not chunks:
            raise ValueError("No text chunks could be extracted from this PDF.")

        full_text_preview = " ".join(chunks)[:2000]
        doc_embedding = embedding_model.encode(full_text_preview).tolist()


        new_doc = PDFData(
            pdf_blob=file_path.read_bytes(),
            messages_list=[],
            pdf_embedding=doc_embedding,
            user_id=current_user.id
        )
        
        db.add(new_doc)
        await db.commit()
        await db.refresh(new_doc)

        # Generate unique IDs for each chunk
        ids = [str(uuid.uuid4()) for _ in chunks]
        
        # Create metadata so you know which file the chunk came from
        metadatas = [{"source_file": file.filename, "chunk_index": new_doc.id,"chunk_index": i} for i in range(len(chunks))]

        # Add to ChromaDB
        await collection.add(
            ids=ids,
            documents=chunks,
            metadatas=metadatas
        )

        return {
            "status": "success", 
            "filename": file.filename, 
            "chunks_ingested": len(chunks)
        }

    except Exception as e:
        print(f"Error: {e}") # Log for server console
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
        
    finally:
        # 3. Cleanup: Remove the temp file
        if file_path.exists():
            os.remove(file_path)

# #--------Helper Functions--------#

async def pdf_process(pdf_path: str):
    try:
        loader = PyMuPDFReader()
        
        # Load data (this reads the file we just saved)
        documents = loader.load_data(file_path=pdf_path)
        
        text_splitter = SentenceSplitter(
            chunk_size=1000,
            chunk_overlap=20
        )
        
        text_chunks = []
        
        # Process all pages/documents found in the PDF
        for doc in documents:
            cur_text_chunks = text_splitter.split_text(doc.text)
            text_chunks.extend(cur_text_chunks)

        return text_chunks
    except Exception as e:
        print(f"PDF Processing Error: {e}")
        raise e