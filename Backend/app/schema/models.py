from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import  Optional, Literal, List
from datetime import datetime

class StudentBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr = Field(...)

    @field_validator("name")
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty or just whitespace')
        return v.strip()

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None

class StudentResponse(StudentBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


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