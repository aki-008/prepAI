from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import  Optional, Literal, List
from datetime import datetime

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr = Field(...)
    password: str = Field(..., min_length=6, max_length=72)

    @field_validator('password')
    def validate_password(cls, v):
        if len(v.encode("utf-8")) > 72:
            raise ValueError('Password cannot exceed 72 bytes')
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginResponse(Token):
    username: str

class Quiz_input(BaseModel):
    parsed_doc: str
    user_prompt: str
    # choice: Literal["mcq", "code"]

class QuizQuestion(BaseModel):
    question: str 
    options: List[str] = Field(..., min_items=2)
    answer: str = Field(..., description="Correct answer key")
    explanation: str
    User_response: str = Field("", alias="User_response")

class QuizOutput(BaseModel):
    quiz: List[QuizQuestion] = Field(..., description="A list of 10 generated MCQ questions.")

class IngestRequest(BaseModel):
    parsed_doc: str = Field(..., description="The main document content to embed")
    user_prompt: str = Field(..., description="The user prompt associated with this document")
    id: Optional[str] = None