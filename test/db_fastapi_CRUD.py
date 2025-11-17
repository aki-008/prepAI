import asyncio
from typing import List, Optional
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, HTTPException, status
from sqlalchemy import String, Integer, DateTime, select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm  import DeclarativeBase, Mapped, mapped_column
from pydantic import BaseModel, ConfigDict


DATABASE_URL = "postgresql+asyncpg://postgres:690869@localhost:5432/studentdb"

engine = create_async_engine(DATABASE_URL, echo=True)
async_session = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(100))
    age: Mapped[int]
    grade: Mapped[str] = mapped_column(String(5))
    created_at : Mapped[datetime] = mapped_column(default=datetime.utcnow)

class StudentCreate(BaseModel):
    name: str
    email: str 
    age: int
    grade: str

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None
    grade: Optional[str] = None

class StudentOut(BaseModel):
    id: int
    name: str
    email: str 
    age: int
    grade: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)



@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("Tables created !!!!")
    yield
    await engine.dispose()
    print("🔻 Database connection closed.")

app = FastAPI(title="Async student CRUD API", lifespan=lifespan)

@app.post("/students/", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
async def create_student(student: StudentCreate):
    async with async_session() as session:
        async with session.begin():
            student = Student(**student.model_dump())
            session.add(student)
        await session.refresh(student)
        return student

@app.get("/students/", response_model=List[StudentOut])
async def list_students():
    async with  async_session() as session:
        result = await session.execute(select(Student))
        students = result.scalars().all()
        return students

@app.get("/students/{id}", response_model=StudentOut)
async def get_student(id: int):
    async with async_session() as session:
        student = await session.get(Student, id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        return student

@app.put("/students/{id}/", response_model=StudentOut)
async def update_student(id: int, update_data: StudentUpdate):
    async with async_session() as session:
        async with session.begin():
            student = await session.get(Student, id)
            if not student:
                raise HTTPException(status_code=404, detail="student not found")
            
            update_dict = update_data.model_dump(exclude_unset=True)
            for key , value in update_dict.items():
                setattr(student, key , value)
        
        await session.refresh(student)
        return student

@app.delete("/students/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(id: int):
    async with async_session() as session:
        async with session.begin():
            student = await session.get(Student, id)
            if not student:
                raise HTTPException(status_code=404, detail="student not found")
            await session.delete(student)
    return None


# async def main():
#     # await create_table()
#     await add_student("Akshat Mehta", "akshat@example.com", 21, "A+")
#     await add_student("Nikhil Sharma", "nikhil@example.com", 22, "B")
#     await list_students()

#     await update_student(1, new_age=52)
#     await delete_student(2)
#     print('-'*100)
#     await list_students()

# if __name__ == "__main__":
#     asyncio.run(main())