from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.schema import StudentCreate, StudentUpdate, StudentResponse
from app.models import Student, User
from app.api.deps import get_db, get_current_user

router = APIRouter()

@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(
    student: StudentCreate,
    db:AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        result = await db.execute(select(Student).filter(Student.email == student.email))
        existing_user = result.scalar_one_or_none()

        if existing_user:
            raise HTTPException(
                status_code= status.HTTP_400_BAD_REQUEST,
                detail=f'student with email {student.email} already exists'
            )
        
        new_student = Student(**student.model_dump())
        db.add(new_student)
        await db.commit()
        await db.refresh(new_student)

        return new_student
    except HTTPException:
        raise
    except Exception as e :
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'failed to create student: {str(e)}'
        )
@router.get("/", response_model=List[StudentResponse])
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


@router.get("/{student_id}", response_model=StudentResponse)
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


@router.put("/{student_id}", response_model=StudentResponse)
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


@router.patch("/{student_id}", response_model=StudentResponse)
async def partial_update_student(
    student_id: int,
    student_update: StudentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Partially update a student (same as PUT for this implementation) (Protected)"""
    return await update_student(student_id, student_update, db, current_user)


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
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