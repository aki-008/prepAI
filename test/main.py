"""
FastAPI + PostgreSQL Student Management System
Complete async implementation with SQLAlchemy, authentication, and validation

Requirements:
pip install fastapi uvicorn sqlalchemy asyncpg psycopg2-binary python-jose[cryptography] passlib[bcrypt] python-multipart
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import select, String
from pydantic import BaseModel, EmailStr, Field, field_validator,  ConfigDict
from typing import Optional, List
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
from contextlib import asynccontextmanager
# ======================== CONFIGURATION ========================
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql+asyncpg://postgres:690869@172.26.157.164:5432/studentdb"
)
SECRET_KEY = os.getenv("SECRET_KEY", "production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# ======================== DATABASE SETUP ========================
engine = create_async_engine(DATABASE_URL, echo=True)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

class Student(Base):
    __tablename__ = "students"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    age: Mapped[int]
    grade: Mapped[str] = mapped_column(String(5))
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))

# ======================== PYDANTIC MODELS ========================
class StudentBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Student full name")
    email: EmailStr = Field(..., description="Student email address")
    age: int = Field(..., ge=5, le=100, description="Student age (5-100)")
    grade: str = Field(..., pattern="^[A-F][+-]?$", description="Grade (A-F with optional + or -)")
    
    @field_validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty or just whitespace')
        return v.strip()
    
    @field_validator('grade')
    def validate_grade(cls, v):
        v = v.upper()
        if v not in ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F']:
            raise ValueError('Invalid grade format')
        return v

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    age: Optional[int] = Field(None, ge=5, le=100)
    grade: Optional[str] = Field(None, pattern="^[A-F][+-]?$")
    
    @field_validator('grade')
    def validate_grade(cls, v):
        if v is not None:
            v = v.upper()
            if v not in ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F']:
                raise ValueError('Invalid grade format')
        return v

class StudentResponse(StudentBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=72)
    
    @field_validator('password')
    def validate_password(cls, v):
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password cannot exceed 72 bytes')
        return v

class Token(BaseModel):
    access_token: str
    token_type: str

# ======================== SECURITY ========================
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Truncate password to 72 bytes for bcrypt compatibility
    password_bytes = plain_password.encode('utf-8')[:72]
    plain_password_truncated = password_bytes.decode('utf-8', errors='ignore')
    return pwd_context.verify(plain_password_truncated, hashed_password)

def get_password_hash(password: str) -> str:
    # Truncate password to 72 bytes for bcrypt compatibility
    password_bytes = password.encode('utf-8')[:72]
    password_truncated = password_bytes.decode('utf-8', errors='ignore')
    return pwd_context.hash(password_truncated)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(lambda: async_session_maker())
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    result = await db.execute(select(User).filter(User.username == username))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user

# ======================== DATABASE DEPENDENCY ========================
async def get_db():
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# new on event alternative 

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🏗️ Server starting:", datetime.now())
    print("🔧 Creating tables if they don't exist...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)        # Create tables

    print("✅ Tables ready!")
    yield
    print("🧹 Server shutting down:", datetime.now())

# ======================== FASTAPI APP ========================
app = FastAPI(
    title="Student Management API",
    description="FastAPI + PostgreSQL with SQLAlchemy async",
    version="1.0.0",
    lifespan=lifespan

)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ======================== AUTHENTICATION ROUTES ========================
@app.post("/auth/register", response_model=dict, tags=["Authentication"])
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user"""
    try:
        result = await db.execute(select(User).filter(User.username == user.username))
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        new_user = User(
            username=user.username,
            hashed_password=get_password_hash(user.password)
        )
        db.add(new_user)
        await db.commit()
        
        return {"message": "User registered successfully", "username": user.username}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@app.post("/auth/login", response_model=Token, tags=["Authentication"])
async def login(username: str, password: str, db: AsyncSession = Depends(get_db)):
    """Login and get access token"""
    try:
        result = await db.execute(select(User).filter(User.username == username))
        user = result.scalar_one_or_none()
        
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username},
            expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

# ======================== STUDENT CRUD ROUTES ========================
@app.post("/students/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED, tags=["Students"])
async def create_student(
    student: StudentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new student (Protected)"""
    try:
        # Check if email already exists
        result = await db.execute(select(Student).filter(Student.email == student.email))
        existing_student = result.scalar_one_or_none()
        
        if existing_student:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Student with email {student.email} already exists"
            )
        
        new_student = Student(**student.model_dump())
        db.add(new_student)
        await db.commit()
        await db.refresh(new_student)
        
        return new_student
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create student: {str(e)}"
        )

@app.get("/students/", response_model=List[StudentResponse], tags=["Students"])
async def get_all_students(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all students with pagination (Protected)"""
    try:
        result = await db.execute(
            select(Student).offset(skip).limit(limit)
        )
        students = result.scalars().all()
        return students
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch students: {str(e)}"
        )

@app.get("/students/{student_id}", response_model=StudentResponse, tags=["Students"])
async def get_student(
    student_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific student by ID (Protected)"""
    try:
        result = await db.execute(select(Student).filter(Student.id == student_id))
        student = result.scalar_one_or_none()
        
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student with ID {student_id} not found"
            )
        
        return student
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch student: {str(e)}"
        )

@app.put("/students/{student_id}", response_model=StudentResponse, tags=["Students"])
async def update_student(
    student_id: int,
    student_update: StudentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a student's information (Protected)"""
    try:
        result = await db.execute(select(Student).filter(Student.id == student_id))
        student = result.scalar_one_or_none()
        
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student with ID {student_id} not found"
            )
        
        # Update only provided fields
        update_data = student_update.model_dump(exclude_unset=True)
        
        # Check email uniqueness if email is being updated
        if "email" in update_data:
            result = await db.execute(
                select(Student).filter(
                    Student.email == update_data["email"],
                    Student.id != student_id
                )
            )
            existing = result.scalar_one_or_none()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Email {update_data['email']} is already in use"
                )
        
        for key, value in update_data.items():
            setattr(student, key, value)
        
        await db.commit()
        await db.refresh(student)
        
        return student
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update student: {str(e)}"
        )

@app.patch("/students/{student_id}", response_model=StudentResponse, tags=["Students"])
async def partial_update_student(
    student_id: int,
    student_update: StudentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Partially update a student (same as PUT for this implementation) (Protected)"""
    return await update_student(student_id, student_update, db, current_user)

@app.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Students"])
async def delete_student(
    student_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a student (Protected)"""
    try:
        result = await db.execute(select(Student).filter(Student.id == student_id))
        student = result.scalar_one_or_none()
        
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student with ID {student_id} not found"
            )
        
        await db.delete(student)
        await db.commit()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete student: {str(e)}"
        )

# ======================== HEALTH CHECK ========================
@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Student Management API is running",
        "version": "1.0.0"
    }

# ======================== RUN APPLICATION ========================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)