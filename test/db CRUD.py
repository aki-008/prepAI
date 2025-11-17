import asyncio
from datetime import datetime
from sqlalchemy import String, Integer, DateTime
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm  import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import select

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

async def create_table():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print('Tables created successfully !')

async def add_student(name:str, email: str, age: int, grade: str):
    async with async_session() as session:
        async with session.begin():
            student = Student( name = name, email= email, age=age, grade=grade)
            session.add(student)
    print(f"added student{name}")

async def list_students():
    async with  async_session() as session:
        result = await session.execute(select(Student))
        students = result.scalars().all()

        for s in students:
            print(f" - {s.id}: {s.name}, {s.email}, Grade: {s.grade}, {s.age}")

async def update_student(student_id: int, new_name: str = None, new_age : int = None, new_grade : int = None ):
    async with async_session() as session:
        async with session.begin():
            student = await session.get(Student, student_id)
            if not student:
                print(f"❌ Student with id {student_id} not found.")
                return
            if new_name: 
                student.name = new_name
            if new_grade:
                student.grade = new_grade
            if new_age:
                student.age = new_age

            # await session.commit()  ## no need
    print(f"✏️ Updated student ID {student_id}")

async def delete_student(student_id: int):
    async with async_session() as session:
        async with session.begin():
            student = await session.get(Student, student_id)
            if not student:
                print(f"❌ Student with id {student_id} not found.")
                return
            
            await session.delete(student)
            # await session.commit()  ## no need
    print(f"🗑️ Deleted student ID {student_id}")


async def main():
    await create_table()
    await add_student("Akshat Mehta", "akshat@example.com", 21, "A+")
    await add_student("Nikhil Sharma", "nikhil@example.com", 22, "B")
    await list_students()

    await update_student(1, new_age=52)
    await delete_student(2)
    print('-'*100)
    await list_students()

if __name__ == "__main__":
    asyncio.run(main())