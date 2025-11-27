from sqlalchemy import String, LargeBinary, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.database import Base
from typing import List

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] =  mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))

    pdf_data: Mapped[list["PDFData"]] = relationship(back_populates="user")

class PDFData(Base):
    __tablename__ = "pdf_data"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    pdf_blob: Mapped[bytes] = mapped_column(LargeBinary)
    messages_list: Mapped[List] = mapped_column(JSON)
    pdf_embedding: Mapped[list[float]] = mapped_column(JSON)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    user: Mapped["User"] = relationship(back_populates="pdf_data")