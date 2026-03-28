from sqlalchemy import Column, Integer, String, Float, Boolean
from .database import Base

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)
    name = Column(String)
    days = Column(Integer)
    difficulty = Column(Integer)
    total_hours = Column(Float)
    theory_hours = Column(Float)
    practice_hours = Column(Float)

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)
    name = Column(String)
    completed = Column(Boolean, default=False)