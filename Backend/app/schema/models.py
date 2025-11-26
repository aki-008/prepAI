from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import  Optional, Literal, List
from datetime import datetime


#--------Auth models--------#

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


#--------Quiz models--------#
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


# #--------Notes models--------#

class ChatMessage(BaseModel):
    role: Literal['user', 'assistant', 'system'] = Field(description="The sender of the message. Must be 'user', 'assistant', or 'system'.")
    content: str=Field(..., min_length=1, description="The text content of the message.")

class AI_chat_input(BaseModel):
    messages = List[ChatMessage] = Field(
        ...,
        min_length=1,
        description="The complete conversation history (list of messages) to send to the LLM."
    )
    session_id: str | None = Field(
        None, description="The unique ID of the current chat session (optional)."
    )