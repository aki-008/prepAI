from fastapi import FastAPI
from fastapi.middleware.cors import  CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime




# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     print("server starting", datetime.now())
#     print("creating tables if they dont exist....")
#     async with engine

# app = FastAPI(lifespan=lifespan)
# app.include_router(api_router)  
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Student Management API is running",
        "version": "1.0.0"
    }