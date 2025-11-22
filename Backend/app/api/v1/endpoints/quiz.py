from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.schema import StudentCreate, StudentUpdate, StudentResponse
from app.models import Student, User
from app.api.deps import get_db, get_current_user

router = APIRouter()

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